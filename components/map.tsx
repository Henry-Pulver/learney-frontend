import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ElementsDefinition, NodeSingular } from "cytoscape";
import { useAsync } from "react-async";
import { ConceptInfo } from "./conceptInfo";
import { getDataFromStorage, saveVote } from "../lib/tooltips";
import {
  setGoalNodesGlobal,
  setLearnedNodesGlobal,
  goalNodes,
  learnedNodes,
} from "../lib/learningAndPlanning/variables";
import { initialiseGraphState } from "../lib/learningAndPlanning/learningAndPlanning";
import { initCy, bindRouters, selectConcept } from "../lib/graph";
import { setupCtoCentre } from "../lib/hotkeys";
import { classNames } from "../lib/reactUtils";
import { fetchTotalVotes, queryParams, setURLQuery } from "../lib/utils";
import MapTitle from "./mapTitle";
import {
  GetNextConceptButton,
  ResetPanButton,
  ResetProgressIconButton,
} from "./buttons";
import { fetchConceptInfo } from "../lib/questions";
import { ButtonPressFunction } from "../lib/types";
import { EditType } from "./editor/types";
import {
  OnGoalLearnedClick,
  SetGoalState,
  SetLearnedState,
  NotificationData,
  UserData,
} from "./types";
import QuestionModal from "./questions/questionModal";
import { ProgressModal } from "./questions/progressModal";
import { ArrowCircleUpIcon, BookOpenIcon } from "@heroicons/react/outline";
import { Completed } from "./questions/types";
import { setUserData } from "./userDataSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

type PrevUserDataFn = (prevUserData: UserData) => UserData;

export default function Map({
  mapTitle,
  mapDescription,
  backendUrl,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
  sessionId,
  buttonPressFunction,
  learned,
  onLearnedClick,
  onTestSuccess,
  setLearnedState,
  goals,
  onSetGoalClick,
  setGoalsState,
  setPageLoaded,
  editType,
  questionsEnabled,
  showTitle,
  currentConcept,
  updateNotificationInfo,
}: {
  mapTitle: string;
  mapDescription: string;
  backendUrl: string;
  allowSuggestions: boolean;
  editMap: boolean;
  mapJson: ElementsDefinition;
  mapUUID: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
  learned: object;
  onLearnedClick: OnGoalLearnedClick;
  onTestSuccess;
  setLearnedState: SetLearnedState;
  goals: object;
  onSetGoalClick: OnGoalLearnedClick;
  setGoalsState: SetGoalState;
  setPageLoaded: (boolean) => void;
  editType: EditType;
  questionsEnabled: boolean;
  showTitle: boolean;
  currentConcept: NodeSingular;
  updateNotificationInfo: (notificationData: NotificationData) => void;
}) {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.userData);
  const router = useRouter();
  const [userVotes, setUserVote] = React.useState({});
  const initialiseUserVotes = (initialVotes) => {
    for (const [url, voteDirection] of Object.entries(initialVotes)) {
      setUserVote((prevVotes) => ({ ...prevVotes, [url]: voteDirection }));
    }
  };
  const onVote = (node, url, up) => {
    setUserVote((prevVotes) => ({ ...prevVotes, [url]: up }));
    saveVote(url, up, node, backendUrl, userData.id, mapUUID, sessionId);
  };
  const [progressModalShown, setProgressModalShown] = useState<boolean>(false);

  const cytoscapeRef = useRef();
  const [nodeSelected, setNodeSelected] = React.useState<
    NodeSingular | undefined
  >(undefined);
  const showConceptPanel: (nodeSelected: NodeSingular) => void = (node) =>
    setNodeSelected(node);
  const hideConceptPanel: () => void = () => setNodeSelected(undefined);

  const [hoverNode, setHoverNode] = React.useState<boolean>(false);

  useEffect(() => {
    (async function () {
      if (sessionId && userData.id) {
        let initLearnedNodes, initGoalNodes, initVotes;
        if (!editMap) {
          [initLearnedNodes, initGoalNodes, initVotes] =
            await getDataFromStorage(backendUrl, userData.id, mapUUID);
          if (typeof initVotes === "string")
            initialiseUserVotes(JSON.parse(initVotes));
          else initialiseUserVotes(initVotes);
        } else {
          initLearnedNodes = {};
          initGoalNodes = {};
        }

        setGoalNodesGlobal(initGoalNodes);
        setGoalsState(goalNodes);
        setLearnedNodesGlobal(initLearnedNodes);
        setLearnedState(learnedNodes);

        const styleResponse = await fetch(`/knowledge_graph.cycss`);
        const styleText = await styleResponse.text();
        await initCy(
          mapJson,
          styleText,
          backendUrl,
          userData.id,
          mapUUID,
          editMap
        );
        initialiseGraphState(userData.id); // Set initially learned or goal nodes
        bindRouters(
          backendUrl,
          userData.id,
          mapUUID,
          sessionId,
          showConceptPanel,
          hideConceptPanel,
          onSetGoalClick,
          editMap,
          router,
          setHoverNode
        );

        setupCtoCentre();
        setPageLoaded(true);
      }
    })();
  }, [sessionId, userData.id]);

  const { data } = useAsync({
    promiseFn: fetchTotalVotes,
    backendUrl,
    mapUUID,
    editMap,
  });

  // Question stuff
  const [maxKnowledgeLevel, setMaxKnowledgeLevel] = useState<number>(null);
  const [knowledgeLevel, setKnowledgeLevel] = useState<number>(null);
  const [progressModalKnowledgeLevel, setProgressModalKnowledgeLevel] =
    useState<number>(null);
  useEffect(() => {
    // So the knowledge level isn't stuck on the previous node's value while loading
    setKnowledgeLevel(null);
    setMaxKnowledgeLevel(null);
    if (nodeSelected && questionsEnabled) {
      (async () => {
        const conceptInfo = await fetchConceptInfo(
          backendUrl,
          userData.id,
          nodeSelected.id()
        );
        setKnowledgeLevel(conceptInfo.level);
        setMaxKnowledgeLevel(Math.floor(conceptInfo.max_level));
      })();
    }
  }, [nodeSelected]);

  const [questionModalShown, setQuestionModalShown] =
    React.useState<boolean>(false);
  useEffect(() => {
    localStorage.setItem("quemodal", String(questionModalShown));
    console.log({
      ...router.query,
      quemodal: questionModalShown ? questionModalShown : undefined,
    });
    setURLQuery(router, {
      ...router.query,
      quemodal: questionModalShown ? questionModalShown : undefined,
    });
  }, [questionModalShown]);

  useEffect(() => {
    setQuestionModalShown(
      localStorage.getItem("quemodal") === "true" && questionsEnabled
    );
    if (
      localStorage.getItem(`lastConceptClickedMap${mapUUID}`) &&
      !router.query.concept
    )
      setURLQuery(router, {
        ...router.query,
        concept: localStorage.getItem(`lastConceptClickedMap${mapUUID}`),
      });
  }, []);
  return (
    <div className="flex-column h-excl-toolbar flex w-full sm:flex-row">
      <div
        className={classNames(
          nodeSelected !== undefined &&
            "w-full sm:w-[calc(100vw-27rem)] lg:w-[calc(100vw-42rem)]",
          "h-excl-toolbar relative w-full"
        )}
      >
        {!nodeSelected && showTitle && (
          <MapTitle
            title={mapTitle}
            description={mapDescription}
            buttonPressFunction={buttonPressFunction}
          />
        )}
        <div
          id="cy"
          className={classNames(
            editMap && editType === "cursor" && "cursor-default",
            editMap && editType === "addNode" && "cursor-copy",
            editMap && editType === "addEdges" && "cursor-crosshair",
            editMap && editType === "delete" && "cursor-pointer",
            !editMap && hoverNode && "cursor-pointer",
            "h-excl-toolbar z-0 w-full bg-gray-900",
            nodeSelected !== undefined &&
              "w-0 sm:w-[calc(100vw-27rem)] lg:w-[calc(100vw-42rem)]"
          )}
          ref={cytoscapeRef}
        />
        {maxKnowledgeLevel && (
          <QuestionModal
            modalShown={nodeSelected !== undefined && questionModalShown}
            closeModal={() => setQuestionModalShown(false)}
            onCompletion={(
              conceptCompleted: Completed,
              levelsGained: number
            ) => {
              setProgressModalKnowledgeLevel(knowledgeLevel - levelsGained);
              dispatch(
                setUserData({
                  questions_streak:
                    userData.questions_streak +
                    1 -
                    Number(userData.batch_completed_today),
                  batch_completed_today: true,
                })
              );
              switch (conceptCompleted) {
                case "completed_concept":
                  setProgressModalShown(true);
                  setProgressModalKnowledgeLevel(null);
                  setTimeout(() => {
                    setProgressModalShown(false);
                    onTestSuccess(nodeSelected, userData.id, sessionId);
                    setQuestionModalShown(false);
                    setTimeout(() => {
                      if (currentConcept) selectConcept(currentConcept);
                    }, 1500);
                  }, 3000);
                  break;
                case "doing_poorly":
                  updateNotificationInfo({
                    title: `Mission Failed - we'll get 'em next time.`,
                    message: `Look at the resources on ${
                      nodeSelected.data().name
                    } & test again when ready!`,
                    Icon: BookOpenIcon,
                    colour: "red",
                    show: true,
                    side: "left",
                  });
                  break;
                case "max_num_of_questions":
                  setProgressModalShown(true);
                  setProgressModalKnowledgeLevel(null);
                  setTimeout(() => {
                    setProgressModalShown(false);
                    setQuestionModalShown(false);
                    setTimeout(() => {
                      if (currentConcept) selectConcept(currentConcept);
                    }, 1500);
                  }, 3000);
                  updateNotificationInfo({
                    title:
                      levelsGained >= 1
                        ? `Congrats! You've progressed ${Math.floor(
                            levelsGained
                          )} level${levelsGained >= 2 ? "s" : ""} on ${
                            nodeSelected.data().name
                          }!`
                        : "You're making great progress!",
                    message: levelsGained
                      ? "At this rate, you'll soon complete the concept! Test again when you're ready."
                      : "Keep it up to reach the next level! Check out the content for this concept and test again. :)",
                    Icon: levelsGained ? ArrowCircleUpIcon : BookOpenIcon,
                    colour: "green",
                    show: true,
                    side: "left",
                  });
                  break;
                case "review_completed":
                  updateNotificationInfo({
                    title: `Review of ${nodeSelected.data().name} completed!`,
                    message: `Congrats for completing the review! You can do another or move on from here.`,
                    Icon: BookOpenIcon,
                    colour: "green",
                    show: true,
                    side: "left",
                  });
                  break;
                case null:
                  break;
              }
              setQuestionModalShown(false);
              setTimeout(() => setProgressModalKnowledgeLevel(null), 5000);
            }}
            knowledgeLevel={knowledgeLevel}
            setKnowledgeLevel={setKnowledgeLevel}
            maxKnowledgeLevel={maxKnowledgeLevel}
            conceptId={nodeSelected ? nodeSelected.id() : null}
            backendUrl={backendUrl}
            userId={userData.id}
            sessionId={sessionId}
            buttonPressFunction={buttonPressFunction}
          />
        )}
        <div
          className={classNames(
            !editMap && data && nodeSelected && "hidden sm:flex",
            "absolute bottom-0 right-0 m-4 flex flex-col items-end gap-4 md:flex-row"
          )}
        >
          {/*{!editMap && (*/}
          {/*  <GetNextConceptButton*/}
          {/*    currentConcept={currentConcept}*/}
          {/*    buttonPressFunction={buttonPressFunction}*/}
          {/*  />*/}
          {/*)}*/}
          <ResetPanButton buttonPressFunction={buttonPressFunction} />
          {!editMap && !questionsEnabled && (
            <ResetProgressIconButton
              buttonPressFunction={buttonPressFunction}
              backendUrl={backendUrl}
              userId={userData.id}
              mapUUID={mapUUID}
              sessionId={sessionId}
              setGoalsState={setGoalsState}
              setLearnedState={setLearnedState}
            />
          )}
        </div>
      </div>
      {/*RIGHT SIDE PANEL*/}
      {!editMap && (
        <div className={questionModalShown ? "hidden sm:block" : ""}>
          <ConceptInfo
            visible={nodeSelected !== undefined}
            node={nodeSelected}
            backendUrl={backendUrl}
            userData={userData}
            mapUUID={mapUUID}
            sessionId={sessionId}
            hideConceptInfo={hideConceptPanel}
            learnedNodes={learned}
            goalNodes={goals}
            knowledgeLevel={knowledgeLevel}
            maxKnowledgeLevel={maxKnowledgeLevel}
            questionModalShown={questionModalShown}
            setQuestionModalShown={setQuestionModalShown}
            onLearnedClick={onLearnedClick}
            onSetGoalClick={onSetGoalClick}
            allowSuggestions={allowSuggestions}
            buttonPressFunction={buttonPressFunction}
            userVotes={userVotes}
            onVote={onVote}
            allVotes={data}
            questionsEnabled={questionsEnabled}
            setProgressModalOpen={setProgressModalShown}
          />
        </div>
      )}
      <ProgressModal
        progressModalOpen={progressModalShown}
        closeProgressModalOpen={() => setProgressModalShown(false)}
        knowledgeLevel={
          progressModalKnowledgeLevel !== null
            ? progressModalKnowledgeLevel
            : knowledgeLevel
        }
        maxKnowledgeLevel={maxKnowledgeLevel}
        conceptName={nodeSelected && nodeSelected.data().name}
      />
    </div>
  );
}
