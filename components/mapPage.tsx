import ReactGA from "react-ga";
import React, { useEffect, useState } from "react";
import isEqual from "lodash.isequal";
import { useUser } from "@auth0/nextjs-auth0";
import {
  setupTracking,
  initialiseMixpanelTracking,
} from "../lib/trackingScripts";
import {
  buttonPress,
  isAnonymousUser,
  logPageView,
  setURLQuery,
  URLQuerySet,
} from "../lib/utils";
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
import ExploreLearnIntroPage from "./exploreLearnIntroPage";
import { handleIntroAnimation } from "../lib/graph";
import { useRouter } from "next/router";
import { EditType } from "./editor/types";
import { NodeSingular } from "cytoscape";
import { setNotificationProgressInfo } from "./questions/notificationMessages";
import { fetchCurrentConcept, getNextNodeToLearn } from "../lib/questions";
import { ButtonPressFunction } from "../lib/types";
import { NotificationData } from "./types";
import { CheckCircleIcon } from "@heroicons/react/outline";

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

  // TODO: Move all these into a redux/MST store
  const [userId, setUserId] = React.useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  // Whether to show LearnExploreIntroPage on load
  const [showExploreLearn, setExploreLearn] = useState<boolean | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  useEffect(() => setIsNewUser(!localStorage.getItem("userId")), []);

  const [goals, setNewGoalsState] = React.useState<object>({});
  const [currentConcept, setCurrentConcept] = useState<NodeSingular>(null);
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
      const currentConceptObject = await fetchCurrentConcept(
        backendUrl,
        userId,
        mapUUID
      );
      const currentConceptNode = window.cy.getElementById(
        currentConceptObject.concept_id
      );
      setCurrentConcept(currentConceptNode as NodeSingular);
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
      const currentConceptObject = await fetchCurrentConcept(
        backendUrl,
        userId,
        mapUUID
      );
      const currentConceptNode = window.cy.getElementById(
        currentConceptObject.concept_id
      );
      setCurrentConcept(currentConceptNode as NodeSingular);
    })();
    setLearnedState(learnedNodes);
  };

  // This initialisation deactivates all buttons until a userId is set.
  // The extra function here is because useState calls the first one already.
  const [buttonPressFunction, setButtonPressFunction] =
    useState<ButtonPressFunction>(() => () => () => {});
  useEffect(() => {
    if (userId !== undefined) {
      setButtonPressFunction(() => (runFirst, buttonName) => {
        return buttonPress(runFirst, buttonName, backendUrl, userId);
      });
    }
  }, [userId]);

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
    side: "right",
  });
  const updateNotificationInfo = (
    newNotificationInfo: NotificationData
  ): void => {
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
    if (learnedNodes[node.id()] !== true) {
      learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
      setLearnedState(learnedNodes);
    }
    setNotificationProgressInfo(
      node,
      getNextNodeToLearn(node),
      updateNotificationInfo
    );
  };
  const [showTitle, setShowTitle] = useState<boolean>(true);

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
            userId={userId}
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
            pageLoaded={pageLoaded}
            buttonPressFunction={buttonPressFunction}
            mapJson={mapJson}
            isNewUser={isNewUser}
            showExploreLearn={showExploreLearn}
            showTitle={showTitle}
            setShowTitle={setShowTitle}
            questionsEnabled={questionsEnabled}
          />
        ))}

      {showExploreLearn && (
        <ExploreLearnIntroPage
          hideExploreLearn={() => setExploreLearn(false)}
          mapName={mapTitle ? mapTitle : mapUrlExtension + " map"}
          mapJson={mapJson}
          setGoal={onSetGoalClick}
          pageLoaded={pageLoaded}
          userId={userId}
          sessionId={sessionId}
          buttonPressFunction={buttonPressFunction}
        />
      )}
      <Map
        mapTitle={mapTitle ? mapTitle : mapUrlExtension}
        mapDescription={mapDescription}
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
        onTestSuccess={onSuccessfulTest}
        setLearnedState={setLearnedState}
        goals={goals}
        onSetGoalClick={onSetGoalClick}
        setGoalsState={setGoalsState}
        setPageLoaded={setPageLoaded}
        editType={editType}
        questionsEnabled={questionsEnabled}
        showTitle={showTitle}
        currentConcept={currentConcept}
        updateNotificationInfo={updateNotificationInfo}
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
        info={notificationInfo}
        setNotificationInfo={setNotificationInfo}
      />
    </div>
  );
}
