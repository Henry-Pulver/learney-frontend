import ReactGA from "react-ga";
import React, { useEffect, useState } from "react";
import isEqual from "lodash.isequal";
import { useUser } from "@auth0/nextjs-auth0";
import {
  setupTracking,
  initialiseMixpanelTracking,
} from "../lib/trackingScripts";
import { buttonPress, logPageView, URLQuerySet } from "../lib/utils";
import MapHeader from "./headers";
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
import {
  handleIntroAnimation,
  unhighlightNodes,
  highlightNodes,
} from "../lib/graph";
import { useRouter } from "next/router";
import { EditType } from "./editor/types";
import { NodeSingular } from "cytoscape";
import { setNotificationProgressInfo } from "./questions/notificationMessages";
import {
  fetchCurrentConcept,
  getCurrentNodeToLearn,
  validCurrentConcept,
} from "../lib/questions";
import { ButtonPressFunction } from "../lib/types";
import { NotificationData } from "./types";
import { useAppSelector, useAppDispatch } from "../hooks";
import { setUserData } from "./userDataSlice";
import { ChipIcon } from "@heroicons/react/solid";

export default function MapPage({
  mapTitle,
  mapDescription,
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJsonString,
  mapUUID,
  questionsEnabled,
}: {
  mapTitle: string;
  mapDescription: string;
  backendUrl: string;
  mapUrlExtension: string;
  allowSuggestions: boolean;
  editMap: boolean;
  mapJsonString: string;
  mapUUID: string;
  questionsEnabled: boolean;
}) {
  if (backendUrl === "https://api.learney.me") {
    ReactGA.initialize("UA-197170313-2");
  } else {
    ReactGA.initialize("UA-197170313-1", { debug: true });
  }
  const { user, isLoading } = useUser();
  const mapJson = JSON.parse(mapJsonString);
  const router = useRouter();

  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.userData);

  // TODO: Move all these into a redux/MST store
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  useEffect(() => setIsNewUser(!localStorage.getItem("userId")), []);

  const [pageLoaded, setPageLoaded] = React.useState(false);

  const [currentConceptId, setCurrentConceptId] = useState<string>(undefined);
  const updateCurrentConceptId = async (userId: string) => {
    let currConceptObj;
    if (questionsEnabled)
      currConceptObj = await fetchCurrentConcept(backendUrl, userId, mapUUID);
    else {
      const nextNode = getCurrentNodeToLearn(null);
      if (nextNode) currConceptObj = { concept_id: nextNode.id() };
      else currConceptObj = { concept_id: null };
    }
    setCurrentConceptId((prevCurrConcId) => {
      if (prevCurrConcId !== undefined) {
        const prevCurrConc = window.cy.getElementById(prevCurrConcId);
        // De-highlight it
        prevCurrConc.removeClass("current-concept");
        unhighlightNodes(prevCurrConc);
        // Get new current concept
        const currConc = window.cy.getElementById(currConceptObj.concept_id);
        // Highlight it
        currConc.addClass("current-concept");
        highlightNodes(currConc, true);
      }
      return currConceptObj.concept_id;
    });
    return currConceptObj.concept_id;
  };

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
    (async function () {
      await setGoalClick(node, backendUrl, userId, mapUUID, sessionId);
      await updateCurrentConceptId(userId);
    })();
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
    (async function () {
      await learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
      await updateCurrentConceptId(userId);
    })();
    setLearnedState(learnedNodes);
  };

  // This initialisation deactivates all buttons until a userId is set.
  // The extra function here is because useState calls the first one already.
  const [buttonPressFunction, setButtonPressFunction] =
    useState<ButtonPressFunction>(() => () => () => {});
  useEffect(() => {
    if (userData.id !== undefined) {
      setButtonPressFunction(() => (runFirst, buttonName) => {
        return buttonPress(runFirst, buttonName, backendUrl, userData.id);
      });
    }
  }, [userData.id]);

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

        if (user !== undefined) {
          dispatch(
            setUserData({
              id: user.sub,
              email: user.email,
              questions_streak: responseJson.questions_streak,
              batch_completed_today: responseJson.batch_completed_today,
            })
          );
          initialiseMixpanelTracking(user.sub, user);
        } else {
          dispatch(setUserData({ id: responseJson.user_id }));
          localStorage.setItem("userId", responseJson.user_id);
          initialiseSignInTooltip();
          initialiseMixpanelTracking(responseJson.user_id, user);
        }
        setupTracking();
        ReactGA.pageview(window.location.pathname);
      }
    })();
  }, [isLoading]);

  const [editType, setEditType] = React.useState<EditType | null>(null);

  useEffect(() => {
    // The version of updateCurrentConceptId without questions enabled uses
    // window.cy so requires the page to be loaded before running!
    if (userData.id && questionsEnabled) updateCurrentConceptId(userData.id);
  }, [userData]);
  // Introduction animations when the map is shown
  useEffect(() => {
    let query = router.query;
    const querySet = URLQuerySet(query);
    if (pageLoaded && (querySet || Object.keys(goals).length > 0)) {
      (async () => {
        // The version of updateCurrentConceptId without questions enabled uses
        // window.cy so requires the page to be loaded before running!
        let updatedConceptId;
        if (!questionsEnabled)
          updatedConceptId = await updateCurrentConceptId(userData.id);
        // If questionsEnabled, it's been preloaded as it fetches from backend
        else updatedConceptId = currentConceptId;
        if (updatedConceptId && !querySet)
          query = { concept: updatedConceptId };
        const currConc = window.cy.getElementById(updatedConceptId);
        // Highlight current concept
        currConc.addClass("current-concept");
        highlightNodes(currConc, true);

        handleIntroAnimation(router, query, goals);
      })();
    }
  }, [pageLoaded]);

  const [notificationInfo, setNotificationInfo] = useState<NotificationData>({
    title: "",
    message: "",
    Icon: () => <></>,
    colour: "",
    show: false,
    side: "right",
  });
  const updateNotificationInfo = (
    newNotificationInfo: NotificationData
  ): void => {
    /** Set new notification values, with a 10-second timeout **/
    setNotificationInfo((prevState) => ({
      ...prevState,
      ...newNotificationInfo,
    }));
    setTimeout(
      () =>
        setNotificationInfo((currentState) => {
          if (isEqual(newNotificationInfo, currentState)) {
            return {
              ...currentState,
              show: false,
            };
          } else {
            return currentState;
          }
        }),
      10000
    );
  };

  const onSuccessfulTest = (
    node: NodeSingular,
    userId: string,
    sessionId: string
  ): void => {
    /** Questions-ONLY - run when a question batch is successful **/
    if (learnedNodes[node.id()] !== true) {
      (async () => {
        await learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
        setLearnedState(learnedNodes);
        updateCurrentConceptId(userId);
      })();
    }
    let currentConcept = window.cy.getElementById(
      currentConceptId
    ) as NodeSingular;
    if (currentConcept.size() === 0) currentConcept = null;
    setTimeout(
      () =>
        setNotificationProgressInfo(
          node,
          currentConcept,
          updateNotificationInfo
        ),
      1500
    );
  };
  const [showTitle, setShowTitle] = useState<boolean>(true);
  const [bottomLeftNotifInfo, setBottomLeftNotifInfo] =
    useState<NotificationData>({
      title: "",
      message: "",
      Icon: ChipIcon,
      colour: "blue",
      show: false,
      side: "left",
      bottom: true,
    });
  useEffect(() => {
    if (
      // Below is trying to stop people we don't want seeing this from seeing it
      !editMap &&
      !["noj@janussysteme.de", "josh.starmer@statquest.org"].includes(
        userData.email
      ) &&
      !userData.email.includes("@covestro.com")
    ) {
      setBottomLeftNotifInfo({
        ...bottomLeftNotifInfo,
        title: "Learn Deep RL with weekly AI contests!",
        message: (
          <a
            href={"https://joindeltaacademy.com"}
            className="text-semibold text-gray-900 underline decoration-blue-300 underline-offset-4 hover:text-blue-400 hover:decoration-blue-400"
          >
            Click here to learn more...
          </a>
        ),
        show: true,
      });
    } else if (
      !questionsEnabled &&
      userData.questions_streak !== undefined &&
      !editMap
    ) {
      setBottomLeftNotifInfo({
        ...bottomLeftNotifInfo,
        title: "Learney AI Tutor Access!",
        message: (
          <a
            href={"https://app.learney.me/questions"}
            className="text-semibold text-gray-900 underline decoration-blue-300 underline-offset-4 hover:text-blue-400 hover:decoration-blue-400"
          >
            Click here to access the Learney AI Tutor.
          </a>
        ),
        show: true,
      });
    }
  }, [userData]);

  return (
    <div>
      <MapHeader
        editMap={editMap}
        mapUrlExtension={mapUrlExtension}
        mapTitle={mapTitle}
        mapDescription={mapDescription}
      />
      {!isLoading &&
        (editMap ? (
          <EditNavbar
            user={user}
            userId={userData.id}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            mapUUID={mapUUID}
            mapJson={mapJson}
            pageLoaded={pageLoaded}
            updateNotificationInfo={updateNotificationInfo}
            showTitle={showTitle}
            setShowTitle={setShowTitle}
          />
        ) : (
          <LearnNavbar
            user={user}
            userData={userData}
            pageLoaded={pageLoaded}
            buttonPressFunction={buttonPressFunction}
            mapJson={mapJson}
            isNewUser={isNewUser}
            showTitle={showTitle}
            setShowTitle={setShowTitle}
            questionsEnabled={questionsEnabled}
          />
        ))}

      <Map
        mapTitle={mapTitle ? mapTitle : mapUrlExtension}
        mapDescription={mapDescription}
        backendUrl={backendUrl}
        allowSuggestions={allowSuggestions}
        editMap={editMap}
        mapJson={mapJson}
        mapUUID={mapUUID}
        sessionId={sessionId}
        buttonPressFunction={buttonPressFunction}
        learned={learned}
        onLearnedClick={onLearnedClick}
        onTestSuccess={onSuccessfulTest}
        setLearnedState={setLearnedState}
        goals={goals}
        onSetGoalClick={onSetGoalClick}
        setGoalsState={setGoalsState}
        setPageLoaded={setPageLoaded}
        editType={editType}
        questionsEnabled={questionsEnabled}
        showTitle={showTitle}
        currentConceptId={currentConceptId}
        updateNotificationInfo={updateNotificationInfo}
        setCurrentConceptId={(currConcId: string) => {
          const currConc = window.cy.getElementById(currConcId);
          if (validCurrentConcept(currConc)) {
            const prevCurrConc = window.cy.getElementById(currentConceptId);
            // De-highlight it
            prevCurrConc.removeClass("current-concept");
            unhighlightNodes(prevCurrConc);
            // Highlight new current concept
            currConc.addClass("current-concept");
            highlightNodes(currConc, true);

            setCurrentConceptId(currConcId);
          }
        }}
      />
      {editMap && (
        <Editor
          buttonPressFunction={buttonPressFunction}
          backendUrl={backendUrl}
          userId={userData.id}
          mapUUID={mapUUID}
          pageLoaded={pageLoaded}
          editType={editType}
          setEditType={setEditType}
        />
      )}
      <Notification
        info={notificationInfo}
        setNotificationInfo={setNotificationInfo}
      />
      <Notification
        info={bottomLeftNotifInfo}
        setNotificationInfo={setBottomLeftNotifInfo}
      />
    </div>
  );
}
