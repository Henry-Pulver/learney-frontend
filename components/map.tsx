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
import { initCy, bindRouters } from "../lib/graph";
import { setupCtoCentre } from "../lib/hotkeys";
import { classNames } from "../lib/reactUtils";
import { fetchTotalVotes } from "../lib/utils";
import MapTitle from "./mapTitle";
import {
  GetNextConceptButton,
  ResetPanButton,
  ResetProgressIconButton,
} from "./buttons";
import { fetchConceptInfo, fetchNextConcept } from "../lib/questions";
import { ButtonPressFunction } from "../lib/types";
import { EditType } from "./editor/types";
import { OnGoalLearnedClick, SetGoalState, SetLearnedState } from "./types";
import QuestionModal from "./questions/questionModal";

export default function Map({
  mapTitle,
  mapDescription,
  backendUrl,
  userId,
  userEmail,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
  sessionId,
  buttonPressFunction,
  learned,
  onLearnedClick,
  onTestSuccess,
  onTestFail,
  setLearnedState,
  goals,
  onSetGoalClick,
  setGoalsState,
  pageLoaded,
  setPageLoaded,
  editType,
  questionsEnabled,
  showTitle,
  nextConcept,
}: {
  mapTitle: string;
  mapDescription: string;
  backendUrl: string;
  userId: string;
  userEmail: string;
  allowSuggestions: boolean;
  editMap: boolean;
  mapJson: ElementsDefinition;
  mapUUID: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
  learned: object;
  onLearnedClick: OnGoalLearnedClick;
  onTestSuccess;
  onTestFail;
  setLearnedState: SetLearnedState;
  goals: object;
  onSetGoalClick: OnGoalLearnedClick;
  setGoalsState: SetGoalState;
  pageLoaded: boolean;
  setPageLoaded: (boolean) => void;
  editType: EditType;
  questionsEnabled: boolean;
  showTitle: boolean;
  nextConcept: NodeSingular;
}) {
  const router = useRouter();
  const [userVotes, setUserVote] = React.useState({});
  const initialiseUserVotes = (initialVotes) => {
    for (const [url, voteDirection] of Object.entries(initialVotes)) {
      setUserVote((prevVotes) => ({ ...prevVotes, [url]: voteDirection }));
    }
  };
  const onVote = (node, url, up) => {
    setUserVote((prevVotes) => ({ ...prevVotes, [url]: up }));
    saveVote(url, up, node, backendUrl, userId, mapUUID, sessionId);
  };

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
      if (sessionId && userId) {
        let initLearnedNodes, initGoalNodes, initVotes;
        if (!editMap) {
          [initLearnedNodes, initGoalNodes, initVotes] =
            await getDataFromStorage(backendUrl, userId, mapUUID);
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
        await initCy(mapJson, styleText, backendUrl, userId, mapUUID, editMap);
        initialiseGraphState(userId); // Set initially learned or goal nodes
        bindRouters(
          backendUrl,
          userId,
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
  }, [sessionId, userId]);
 
  const { data } = useAsync({
    promiseFn: fetchTotalVotes,
    backendUrl,
    mapUUID,
    editMap,
  });

  // Question stuff
  const [maxKnowledgeLevel, setMaxKnowledgeLevel] = useState<number>(null);
  const [knowledgeLevel, setKnowledgeLevel] = useState<number>(null);
  useEffect(() => {
    // So the knowledge level isn't stuck on the previous node's value while loading
    setKnowledgeLevel(null);
    setMaxKnowledgeLevel(null);
    if (nodeSelected) {
      (async () => {
        const conceptInfo = await fetchConceptInfo(
          backendUrl,
          userId,
          nodeSelected.id(),
          questionsEnabled
        );
        setKnowledgeLevel(conceptInfo.level);
        setMaxKnowledgeLevel(conceptInfo.max_level);
      })();
    }
  }, [nodeSelected]);
  const [questionModalShown, setQuestionModalShown] =
    React.useState<boolean>(false);

  return (
    <div className="flex flex-column sm:flex-row w-full h-excl-toolbar">
      <div
        className={classNames(
          nodeSelected !== undefined &&
            "w-full sm:w-[calc(100vw-27rem)] lg:w-[calc(100vw-42rem)]",
          "relative h-excl-toolbar w-full"
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
            "z-0 w-full bg-gray-900 h-excl-toolbar",
            nodeSelected !== undefined &&
              "w-0 sm:w-[calc(100vw-27rem)] lg:w-[calc(100vw-42rem)]"
          )}
          ref={cytoscapeRef}
        />
        {maxKnowledgeLevel && (
          <QuestionModal
            modalShown={nodeSelected !== undefined && questionModalShown}
            closeModal={() => setQuestionModalShown(false)}
            onCompletion={(conceptCompleted) => {
              // const levelsGained =
              //   Math.floor(newKnowledgeLevel) - Math.floor(data.level);
              // const conceptCompleted = newKnowledgeLevel >= data.max_level;

              if (conceptCompleted)
                onTestSuccess(nodeSelected, userId, sessionId);
              // else if (levelsGained > 0) onTestSuccess(node, userId, sessionId);
              else {
                onTestFail(nodeSelected);
              }
              setQuestionModalShown(false);
            }}
            knowledgeLevel={knowledgeLevel}
            setKnowledgeLevel={setKnowledgeLevel}
            maxKnowledgeLevel={maxKnowledgeLevel}
            conceptId={nodeSelected ? nodeSelected.id() : null}
            backendUrl={backendUrl}
            userId={userId}
            sessionId={sessionId}
            buttonPressFunction={buttonPressFunction}
          />
        )}
        <div
          className={classNames(
            !editMap && data && nodeSelected && "hidden sm:flex",
            "flex flex-col md:flex-row items-end gap-4 absolute bottom-0 right-0 m-4"
          )}
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
      </div>
      {/*RIGHT SIDE PANEL*/}
      {!editMap && (
        <div className={questionModalShown ? "hidden sm:block" : ""}>
          <ConceptInfo
            visible={nodeSelected !== undefined}
            node={nodeSelected}
            backendUrl={backendUrl}
            userId={userId}
            userEmail={userEmail}
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
          />
        </div>
      )}
    </div>
  );
}
