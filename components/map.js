import React, { useEffect, useRef } from "react";
import { ConceptTippy } from "./conceptInfo";
import { getDataFromStorage, saveVote } from "../lib/tooltips";
import {
  setGoalNodesGlobal,
  setLearnedNodesGlobal,
  goalNodes,
  learnedNodes,
} from "../lib/learningAndPlanning";
import { initCy, panByAndZoom } from "../lib/graph";
import { setupCtoCentre } from "../lib/buttons";

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
  handleEditNodeData,
  handleEditParentNodeData,
}) {
  const [userVotes, setUserVote] = React.useState({});
  const initialiseUserVotes = (initialVotes) => {
    console.log(initialVotes);
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
        let [initLearnedNodes, initGoalNodes, initVotes] =
          await getDataFromStorage(backendUrl, userId, mapUUID);

        if (typeof initVotes === "string")
          initialiseUserVotes(JSON.parse(initVotes));
        else initialiseUserVotes(initVotes);

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
          userId,
          mapUUID,
          editMap,
          sessionId,
          showConceptTippy,
          hideConceptTippy,
          onSetGoalClick,
          handleEditNodeData,
          handleEditParentNodeData
        );
        // TODO: if goal is set, zoom there instead of to the bottom?
        panByAndZoom(
          -cy.width() / 6,
          (-cy.height() * 4) / 9,
          1.5,
          function () {}
        );
        setupCtoCentre();
      }
    })();
  }, [sessionId, userId]);

  return (
    <div>
      <div id="cy" className="z-0" ref={cytoscapeRef} />
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
    </div>
  );
}
