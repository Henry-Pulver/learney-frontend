import ReactGA from "react-ga";
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
  URLQuerySet,
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
import { Notification } from "./notifications";
import ExploreLearnIntroPage from "./exploreLearnIntroPage";
import { handleIntroAnimation } from "../lib/graph";
import { useRouter } from "next/router";
import { EditType, NotificationData } from "./editor/types";
import { NodeSingular } from "cytoscape";
import mixpanel from "mixpanel-browser";

export default function MapPage({
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJsonString,
  mapUUID,
}: {
  backendUrl: string;
  mapUrlExtension: string;
  allowSuggestions: boolean;
  editMap: boolean;
  mapJsonString: string;
  mapUUID: string;
}) {
  if (backendUrl === "https://api.learney.me") {
    ReactGA.initialize("UA-197170313-2");
  } else {
    ReactGA.initialize("UA-197170313-1", { debug: true });
  }
  const { user, isLoading } = useUser();
  const mapJson = JSON.parse(mapJsonString);
  const router = useRouter();

  let mapName;
  if (mapUrlExtension === "original_map")
    mapName = "Maths for Machine Learning";
  else mapName = mapUrlExtension; // Cut off "maps/" from the start

  // TODO: Move all these into a redux/MST store
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  // Whether to show LearnExploreIntroPage on load
  const [showExploreLearn, setExploreLearn] = useState<boolean | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  useEffect(() => setIsNewUser(!localStorage.getItem("userId")), []);

  const [goals, setNewGoalsState] = React.useState<object>({});
  const setGoalsState = (goalState: object) => {
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
  const onSetGoalClick = (
    node: NodeSingular,
    userId: string,
    sessionId: string
  ): void => {
    setGoalClick(node, backendUrl, userId, mapUUID, sessionId);
    setGoalsState(goalNodes);
  };

  const [learned, setNewLearnedState] = React.useState({});
  const setLearnedState = (learnedState: object): void => {
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
  const onLearnedClick = (node, userId, sessionId) => {
    learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
    setLearnedState(learnedNodes);
  };

  const buttonPressFunction = (runFirst, buttonName) => {
    return buttonPress(runFirst, buttonName, backendUrl, userId);
  };

  const [pageLoaded, setPageLoaded] = React.useState(false);
  useEffect(() => {
    (async () => {
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

        let newUserId: string;
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
        initialiseMixpanelTracking(newUserId, user);

        if (isAnonymousUser(newUserId)) initialiseSignInTooltip();
      }
    })();
  }, [isLoading]);

  const [editType, setEditType] = React.useState<EditType | null>(null);

  useEffect(() => {
    const query = router.query;
    // Don't show explore-learn page if in editor, a goal is set, or they're using a specific url
    if (
      !editMap &&
      showExploreLearn === null &&
      ((sessionId && Object.keys(goals).length === 0) || isNewUser) &&
      !URLQuerySet(query)
    )
      setExploreLearn(true);
  }, [isNewUser, goals, pageLoaded]);

  // Introduction animations when the map is shown
  useEffect(() => {
    const query = router.query;
    if (
      pageLoaded &&
      !showExploreLearn &&
      (URLQuerySet(query) || Object.keys(goals).length > 0)
    ) {
      handleIntroAnimation(query, goals);
      setURLQuery(router, {});
    }
  }, [pageLoaded, showExploreLearn]);

  const [notificationInfo, setNotificationInfo] = useState<NotificationData>({
    title: "",
    message: "",
    Icon: () => <></>,
    colour: "",
    show: false,
  });

  return (
    <div>
      <MapHeader editMap={editMap} mapUrlExtension={mapUrlExtension} />
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
        pageLoaded={pageLoaded}
        setPageLoaded={setPageLoaded}
        editType={editType}
      />
      {editMap && (
        <Editor
          buttonPressFunction={buttonPressFunction}
          backendUrl={backendUrl}
          userId={userId}
          mapUUID={mapUUID}
          pageLoaded={pageLoaded}
          editType={editType}
          setEditType={setEditType}
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
