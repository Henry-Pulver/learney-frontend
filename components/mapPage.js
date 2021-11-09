import Profile from "./profile";
import buttonStyles from "../styles/buttons.module.css";
import mainStyles from "../styles/main.module.css";
import {
  FeedBackButton,
  MakeSuggestionButton,
  ResetLayoutButton,
  ResetPanButton,
  ResetProgressButton,
  RunDagreButton,
  SaveMapButton,
  SlackButton,
} from "./buttons";
import React, { useEffect, useState } from "react";
import { setupTracking } from "../lib/trackingScripts";
import { useUser } from "@auth0/nextjs-auth0";
import {
  getButtonPressFunction,
  isAnonymousUser,
  logPageView,
} from "../lib/utils";
import IntroButtonInclTooltip from "../components/intro";
import { isMobile } from "../lib/graph";
import MapHeader from "./mapHeader";
import Map from "./map";
import {
  goalNodes,
  learnedNodes,
  learnedSliderClick,
  setGoalClick,
  initialiseSignInTooltip,
} from "../lib/learningAndPlanning";
import NotificationManager from "./notifications";
import { getNextNodeToLearn } from "../lib/questions";
// import SearchBar, {getSearchOptions} from "./search";

export default function MapPage({
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
}) {
  // SEARCH OPTIONS
  // const [searchOptions, setSearchOptions] = React.useState([]);
  // const updateSearchOptions = (elements) => setSearchOptions(getSearchOptions(elements));

  const { user, isLoading } = useUser();
  const [userId, setUserId] = React.useState(undefined);
  const [userEmail, setUserEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState(null);

  const [introShown, setIntroShown] = React.useState(false);
  const showIntroTooltip = () => {
    setIntroShown(true);
  };
  const hideIntroTooltip = () => {
    setIntroShown(false);
  };

  const [notificationInfo, setNotificationInfo] = useState({});
  const updateNotificationInfo = (newNotificationInfo) => {
    setNotificationInfo((prevState) => ({
      ...prevState,
      type: undefined,
      nodeName: undefined,
      nextNode: undefined,
      ...newNotificationInfo,
    }));
    setTimeout(
      () =>
        setNotificationInfo((prevState) => ({
          ...prevState,
          type: undefined,
          nodeName: undefined,
          nextNode: undefined,
        })),
      5000
    );
  };

  const [goals, setNewGoalsState] = React.useState({});
  const setGoalsState = function (goalState) {
    for (const [nodeId, _] of Object.entries(goals)) {
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
  const onSetGoalClick = function (node, userId, sessionId) {
    setGoalClick(node, backendUrl, userId, mapUUID, sessionId);
    setGoalsState(goalNodes);
  };

  const [learned, setNewLearnedState] = React.useState({});
  const setLearnedState = function (learnedState) {
    for (const [nodeId, _] of Object.entries(learned)) {
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
  const onLearned = function (node, userId, sessionId) {
    learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
    setLearnedState(learnedNodes);
  };
  const onSuccessfulTest = function (node, userId, sessionId) {
    learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
    setLearnedState(learnedNodes);
    const nextNodeToLearn = getNextNodeToLearn(node);

    if (node.classes().includes("goal")) {
      // If goal achieved
      updateNotificationInfo({
        type: "goalAchieved",
        nodeName: node.data().name,
        nextNode: nextNodeToLearn,
      });
      if (nextNodeToLearn !== undefined) nextNodeToLearn.emit("tap");
    } else if (nextNodeToLearn === undefined) {
      // If no goal set - prompt to set goal
      updateNotificationInfo({
        type: "noGoal",
        nodeName: node.data().name,
      });
    } else {
      // If concept on path learned
      updateNotificationInfo({
        type: "progress",
        nodeName: node.data().name,
        nextNode: nextNodeToLearn.data().name,
      });
      nextNodeToLearn.emit("tap");
    }
  };
  const onTestFail = (node) => {
    updateNotificationInfo({
      type: "failed",
      nodeName: node.data().name,
    });
    node.emit("tap");
  };

  const buttonPressFunction = getButtonPressFunction(
    backendUrl,
    userId,
    sessionId
  );

  useEffect(() => {
    (async function () {
      if (!isLoading) {
        let responseJson = await logPageView(user, backendUrl, mapUrlExtension);
        setSessionId(responseJson.session_id);

        let newUserId;
        if (user !== undefined) {
          newUserId = user.sub;
          setUserEmail(user.email);
        } else {
          newUserId = responseJson.user_id;
        }
        setUserId(newUserId);

        setupTracking();

        if (isAnonymousUser(newUserId) && !isMobile()) showIntroTooltip();
        if (isAnonymousUser(newUserId)) initialiseSignInTooltip();
      }
    })();
  }, [isLoading]);

  return (
    <div>
      <MapHeader />

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
        onTestSuccess={onSuccessfulTest}
        onTestFail={onTestFail}
        onLearnedClick={onLearned}
        setLearnedState={setLearnedState}
        goals={goals}
        onSetGoalClick={onSetGoalClick}
        setGoalsState={setGoalsState}
      />

      <Profile buttonPressFunction={buttonPressFunction} userdata={user} />

      <div
        className={`${buttonStyles.topButtonToolbar} ${mainStyles.disableTouchActions}`}
      >
        <div className={buttonStyles.introButtonContainer}>
          {!editMap && (
            <IntroButtonInclTooltip
              introShown={introShown}
              hideIntroTooltip={hideIntroTooltip}
              showIntroTooltip={showIntroTooltip}
              buttonPressFunction={buttonPressFunction}
            />
          )}
          <MakeSuggestionButton
            allowSuggestions={allowSuggestions}
            buttonPressFunction={buttonPressFunction}
            userEmail={userEmail}
            buttonName="make-suggestion"
            text="Make Suggestion"
          />
        </div>
        <label id="concept-search-bar-label">
          {/*<SearchBar searchOptions={ searchOptions }/>*/}
          <select
            id={"concept-search-bar"}
            className="pt-0 w-full"
            name="concept"
            tabIndex="0"
          />
        </label>
        <div className={buttonStyles.buttonToolbarDiv}>
          <SaveMapButton
            editMapEnabled={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            mapUUID={mapUUID}
          />
          <ResetLayoutButton
            buttonPressFunction={buttonPressFunction}
            userId={userId}
            editMap={editMap}
          />
          <RunDagreButton
            buttonPressFunction={buttonPressFunction}
            editMapEnabled={editMap}
          />
          <ResetProgressButton
            editMap={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            userId={userId}
            mapUUID={mapUUID}
            sessionId={sessionId}
            setGoalsState={setNewGoalsState}
            setLearnedState={setNewLearnedState}
          />
          <ResetPanButton buttonPressFunction={buttonPressFunction} />
        </div>
      </div>

      <div
        className={`${buttonStyles.feedbackButtons} ${mainStyles.disableTouchActions}`}
      >
        <FeedBackButton buttonPressFunction={buttonPressFunction} />
        {!editMap && <SlackButton buttonPressFunction={buttonPressFunction} />}
      </div>
      <NotificationManager
        notificationInfo={notificationInfo}
        setNotificationInfo={setNotificationInfo}
      />
    </div>
  );
}
