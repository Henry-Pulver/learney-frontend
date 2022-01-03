import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
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
import { ButtonPressFunction } from "../lib/types";
import { EditType } from "./editor/types";
import { useAsync } from "react-async";
import { fetchTotalVotes } from "../lib/utils";
import {
  ElementsDefinition,
  NodeSingular,
  SingularElementArgument,
  Stylesheet,
} from "cytoscape";
import {
  GetNextConceptButton,
  ResetPanButton,
  ResetProgressIconButton,
} from "./buttons";
import { getNextNodeToLearn } from "../lib/questions";

export default function Map({
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
  setLearnedState,
  goals,
  onSetGoalClick,
  setGoalsState,
  pageLoaded,
  setPageLoaded,
  editType,
}: {
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
  onLearnedClick: Function;
  setLearnedState: Function;
  goals: object;
  onSetGoalClick: (
    node: NodeSingular,
    userId: string,
    sessionId: string
  ) => void;
  setGoalsState: Function;
  pageLoaded: boolean;
  setPageLoaded: (boolean) => void;
  editType: EditType;
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
  const showConceptPanel: (NodeSingular) => void = (node) =>
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
  const [nextConcept, setNextConcept] = useState<SingularElementArgument>(null);

  useEffect(() => {
    if (!editMap && pageLoaded) setNextConcept(getNextNodeToLearn());
  }, [pageLoaded, learned, goals]);

  const { data } = useAsync({
    promiseFn: fetchTotalVotes,
    backendUrl,
    mapUUID,
    editMap,
  });

  return (
    <div className="flex flex-column sm:flex-row w-full h-excl-toolbar">
      <div
        className={classNames(
          nodeSelected !== undefined &&
            "w-0 sm:w-[calc(100vw-30rem)] lg:w-[calc(100vw-38rem)]",
          "relative h-excl-toolbar w-full"
        )}
      >
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
              "w-0 sm:w-[calc(100vw-30rem)] lg:w-[calc(100vw-38rem)]"
          )}
          ref={cytoscapeRef}
        />
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
      {!editMap && data && (
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
          onLearnedClick={onLearnedClick}
          onSetGoalClick={onSetGoalClick}
          allowSuggestions={allowSuggestions}
          buttonPressFunction={buttonPressFunction}
          userVotes={userVotes}
          onVote={onVote}
          allVotes={data}
        />
      )}
    </div>
  );
}
