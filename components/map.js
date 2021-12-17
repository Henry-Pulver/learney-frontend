import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { ConceptTippy } from "./conceptInfo";
import { getDataFromStorage, saveVote } from "../lib/tooltips";
import {
  setGoalNodesGlobal,
  setLearnedNodesGlobal,
  goalNodes,
  learnedNodes,
} from "../lib/learningAndPlanning/variables";
import { initialiseGraphState } from "../lib/learningAndPlanning/learningAndPlanning";
import { initCy, bindRouters } from "../lib/graph";
import { setupCtoCentre } from "../lib/buttons";
import { classNames } from "../lib/reactUtils";

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
  setPageLoaded,
  editType,
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
  const [nodeSelected, setNodeSelected] = React.useState(null);
  const [conceptTippyShown, setConceptTippyShown] = React.useState(false);
  const [hoverNode, setHoverNode] = React.useState(false);

  const showConceptTippy = function (node) {
    setNodeSelected(node);
    setConceptTippyShown(true);
  };
  const hideConceptTippy = function () {
    setConceptTippyShown(false);
  };

  useEffect(() => {
    (async function () {
      if (sessionId && userId) {
        if (!editMap) {
          let [initLearnedNodes, initGoalNodes, initVotes] =
            await getDataFromStorage(backendUrl, userId, mapUUID);
          if (typeof initVotes === "string")
            initialiseUserVotes(JSON.parse(initVotes));
          else initialiseUserVotes(initVotes);

          setGoalNodesGlobal(initGoalNodes);
          setGoalsState(goalNodes);
          setLearnedNodesGlobal(initLearnedNodes);
          setLearnedState(learnedNodes);
        }
        const styleResponse = await fetch(`/knowledge_graph.cycss`);
        const styleText = await styleResponse.text();
        await initCy(mapJson, styleText, backendUrl, userId, mapUUID, editMap);
        initialiseGraphState(userId); // Set initially learned or goal nodes
        bindRouters(
          backendUrl,
          userId,
          mapUUID,
          sessionId,
          showConceptTippy,
          hideConceptTippy,
          onSetGoalClick,
          editMap,
          router,
          setHoverNode
        );

        setupCtoCentre(editMap);
        setPageLoaded(true);
      }
    })();
  }, [sessionId, userId]);

  return (
    <>
      <div
        id="cy"
        className={classNames(
          editMap && editType === "cursor" && "cursor-default",
          editMap && editType === "addNode" && "cursor-copy",
          editMap && editType === "addEdges" && "cursor-crosshair",
          editMap && editType === "delete" && "cursor-pointer",
          !editMap && hoverNode && "cursor-pointer",
          "absolute z-0 bg-gray-900 w-full h-[calc(100%-60px)]"
        )}
        ref={cytoscapeRef}
      />
      <ConceptTippy
        visible={conceptTippyShown}
        node={nodeSelected}
        backendUrl={backendUrl}
        userId={userId}
        userEmail={userEmail}
        mapUUID={mapUUID}
        sessionId={sessionId}
        hideTippy={hideConceptTippy}
        reference={cytoscapeRef}
        learnedNodes={learned}
        goalNodes={goals}
        onLearnedClick={onLearnedClick}
        onSetGoalClick={onSetGoalClick}
        allowSuggestions={allowSuggestions}
        buttonPressFunction={buttonPressFunction}
        userVotes={userVotes}
        onVote={onVote}
      />
    </>
  );
}
