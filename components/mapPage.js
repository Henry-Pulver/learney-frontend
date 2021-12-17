import ReactGA from "react-ga";
import {
  GetNextConceptButton,
  ResetPanButton,
  ResetProgressIconButton,
} from "./buttons";
import React, { useEffect, useState } from "react";
import {
  setupTracking,
  initialiseMixpanelTracking,
} from "../lib/trackingScripts";
import { useUser } from "@auth0/nextjs-auth0";
import {
  buttonPress,
  isAnonymousUser,
  logPageView,
  setURLQuery,
} from "../lib/utils";
import MapHeader from "./mapHeader";
import Map from "./map";
import { goalNodes, learnedNodes } from "../lib/learningAndPlanning/variables";
import {
  learnedSliderClick,
  setGoalClick,
  initialiseSignInTooltip,
} from "../lib/learningAndPlanning/learningAndPlanning";
import { EditNavbar, LearnNavbar } from "./navbar";
import Editor from "./editor/editor";
import { getNextNodeToLearn } from "../lib/questions";
import { Notification } from "./notifications";
import ExploreLearnIntroPage from "./exploreLearnIntroPage";
import { handleAnimation } from "../lib/graph";
import { useRouter } from "next/router";

export default function MapPage({
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJsonString,
  mapUUID,
}) {
  if (backendUrl === "https://api.learney.me") {
    ReactGA.initialize("UA-197170313-2");
  } else {
    ReactGA.initialize("UA-197170313-1", { debug: true });
  }
  const mapJson = JSON.parse(mapJsonString);
  const router = useRouter();

  let mapName;
  if (mapUrlExtension === "original_map")
    mapName = "Maths for Machine Learning";
  else mapName = mapUrlExtension;

  const { user, isLoading } = useUser();
  // TODO: Move all these into a redux/MST store
  const [userId, setUserId] = React.useState(undefined);
  const [userEmail, setUserEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState(null);
  // Whether to show LearnExploreIntroPage on load
  const [showExploreLearn, setExploreLearn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  useEffect(() => setIsNewUser(!localStorage.getItem("userId")), []);

  const [goals, setNewGoalsState] = React.useState({});
  const setGoalsState = function (goalState) {
    for (const nodeId of Object.keys(goals)) {
      if (!(nodeId in goalState)) {
        setNewGoalsState((prevGoals) => ({
          ...prevGoals,
          [nodeId]: undefined,
        }));
      }
    }
    for (const [nodeId, isGoal] of Object.entries(goalState)) {
      setNewGoalsState((prevGoals) => ({ ...prevGoals, [nodeId]: isGoal }));
    }
  };
  const onSetGoalClick = (node, userId, sessionId) => {
    setGoalClick(node, backendUrl, userId, mapUUID, sessionId);
    setGoalsState(goalNodes);
  };

  const [learned, setNewLearnedState] = React.useState({});
  const setLearnedState = function (learnedState) {
    for (const nodeId of Object.keys(learned)) {
      if (!(nodeId in learnedState)) {
        setNewLearnedState((prevLearned) => ({
          ...prevLearned,
          [nodeId]: undefined,
        }));
      }
    }
    for (const [nodeId, isLearned] of Object.entries(learnedState)) {
      setNewLearnedState((prevLearned) => ({
        ...prevLearned,
        [nodeId]: isLearned,
      }));
    }
  };
  const onLearnedClick = function (node, userId, sessionId) {
    learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
    setLearnedState(learnedNodes);
  };

  const buttonPressFunction = function (runFirst, buttonName) {
    return buttonPress(runFirst, buttonName, backendUrl, userId);
  };

  const [pageLoaded, setPageLoaded] = React.useState(false);
  useEffect(() => {
    (async function () {
      if (!isLoading) {
        let responseJson;
        if (user === undefined) {
          responseJson = await logPageView(
            { user_id: localStorage.getItem("userId") },
            backendUrl,
            mapUrlExtension
          );
        } else
          responseJson = await logPageView(user, backendUrl, mapUrlExtension);
        setSessionId(responseJson.session_id);

        let newUserId;
        if (user !== undefined) {
          newUserId = user.sub;
          setUserEmail(user.email);
        } else {
          newUserId = responseJson.user_id;
          localStorage.setItem("userId", newUserId);
        }
        setUserId(newUserId);

        setupTracking();
        ReactGA.pageview(window.location.pathname);
        initialiseMixpanelTracking(newUserId);

        if (isAnonymousUser(newUserId)) initialiseSignInTooltip();
      }
    })();
  }, [isLoading]);

  const [editType, setEditType] = React.useState(null);

  const [nextConcept, setNextConcept] = useState(null);
  useEffect(() => {
    if (!editMap && pageLoaded) setNextConcept(getNextNodeToLearn());
  }, [pageLoaded, learned, goals]);
  useEffect(() => {
    const query = router.query;
    // Don't show explore-learn page if in editor, a goal is set, or they're using a specific url
    if (
      !editMap &&
      ((sessionId && Object.keys(goals).length === 0) || isNewUser) &&
      !(query.topic || query.concept || query.x)
    )
      setExploreLearn(true);
  }, [goals, pageLoaded]);

  // Introduction animations when the map is shown
  useEffect(() => {
    if (pageLoaded && !showExploreLearn) {
      if (router.query.topic || router.query.concept || router.query.x) {
        const query = router.query;
        if (query.topic) {
          handleAnimation({
            fit: {
              eles: window.cy.filter(`[id = "${query.topic}"]`),
              padding: 50,
            },
            duration: 1200,
            easing: "ease-in-out",
          });
        } else if (query.concept) {
          window.cy.getElementById(query.concept).emit("tap");
        } else {
          handleAnimation({
            pan: { x: Number(router.query.x), y: Number(router.query.y) },
            zoom: Number(router.query.zoom),
            duration: 1200,
            easing: "ease-in-out",
          });
        }
      } else if (Object.keys(goals).length > 0) {
        handleAnimation({
          fit: {
            eles: window.cy.nodes(".learned").or(".path"),
            padding: 50,
          },
          duration: 1200,
          easing: "ease-in-out",
        });
      } else {
        handleAnimation({
          panBy: {
            x: -window.cy.width() / 6,
            y: (-window.cy.height() * 4) / 9,
          },
          zoom: 1.5 * window.cy.zoom(),
          duration: 1200,
          easing: "ease-in-out",
        });
      }
      setURLQuery(router, {});
    }
  }, [pageLoaded, showExploreLearn]);

  const [notificationInfo, setNotificationInfo] = useState({
    title: "",
    message: "",
    Icon: () => <></>,
    colour: "",
    show: false,
  });

  return (
    <div>
      <MapHeader editMode={editMap} mapUrlExtension={mapUrlExtension} />
      {!isLoading &&
        (editMap ? (
          <EditNavbar
            user={user}
            userId={userId}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            mapUUID={mapUUID}
            mapJson={mapJson}
            pageLoaded={pageLoaded}
            setNotificationInfo={setNotificationInfo}
          />
        ) : (
          <LearnNavbar
            user={user}
            pageLoaded={pageLoaded}
            buttonPressFunction={buttonPressFunction}
            mapJson={mapJson}
            isNewUser={isNewUser}
            showExploreLearn={showExploreLearn}
          />
        ))}

      {showExploreLearn && (
        <ExploreLearnIntroPage
          hideExploreLearn={() => setExploreLearn(false)}
          newUser={isNewUser && !user}
          mapName={mapName}
          mapJson={mapJson}
          setGoal={onSetGoalClick}
          pageLoaded={pageLoaded}
          userId={userId}
          sessionId={sessionId}
          buttonPressFunction={buttonPressFunction}
        />
      )}
      <Map
        backendUrl={backendUrl}
        userId={userId}
        userEmail={userEmail}
        allowSuggestions={allowSuggestions}
        editMap={editMap}
        mapJson={mapJson}
        mapUUID={mapUUID}
        sessionId={sessionId}
        buttonPressFunction={buttonPressFunction}
        learned={learned}
        onLearnedClick={onLearnedClick}
        setLearnedState={setLearnedState}
        goals={goals}
        onSetGoalClick={onSetGoalClick}
        setGoalsState={setGoalsState}
        setPageLoaded={setPageLoaded}
        editType={editType}
      />
      <div
        className={`flex flex-col md:flex-row items-end gap-4 absolute bottom-0 right-0 mx-8 my-4 disableTouchActions`}
      >
        {!editMap && (
          <GetNextConceptButton
            nextConcept={nextConcept}
            buttonPressFunction={buttonPressFunction}
          />
        )}
        <ResetPanButton buttonPressFunction={buttonPressFunction} />
        {!editMap && (
          <ResetProgressIconButton
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            userId={userId}
            mapUUID={mapUUID}
            sessionId={sessionId}
            setGoalsState={setGoalsState}
            setLearnedState={setLearnedState}
          />
        )}
      </div>
      {editMap && (
        <Editor
          buttonPressFunction={buttonPressFunction}
          backendUrl={backendUrl}
          userId={userId}
          mapUUID={mapUUID}
          pageLoaded={pageLoaded}
          editType={editType}
          setEditType={setEditType}
          mapUrlExtension={mapUrlExtension}
        />
      )}
      <Notification
        title={notificationInfo.title}
        message={notificationInfo.message}
        colour={notificationInfo.colour}
        Icon={notificationInfo.Icon}
        show={notificationInfo.show}
        setShow={setNotificationInfo}
      />
    </div>
  );
}
