import React, { useEffect, useRef } from "react";
import { ConceptTippy } from "./conceptInfo";
import { getDataFromStorage, saveVote } from "../lib/tooltips";
import { setupMap } from "../lib/main";
import {
  setGoalNodesGlobal,
  setLearnedNodesGlobal,
  goalNodes,
  learnedNodes,
} from "../lib/learningAndPlanning";

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
  onTestSuccess,
  onTestFail,
  setLearnedState,
  goals,
  onSetGoalClick,
  setGoalsState,
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
        console.log(`initial goals: ${JSON.stringify(goalNodes)}`);
        console.log(`initial Learned: ${JSON.stringify(learnedNodes)}`);

        await setupMap(
          backendUrl,
          userId,
          allowSuggestions,
          editMap,
          mapJson,
          mapUUID,
          sessionId,
          showConceptTippy,
          hideConceptTippy,
          onSetGoalClick
        );
      }
    })();
  }, [sessionId, userId]);

  return (
    <div>
      <div id="cy" ref={cytoscapeRef} />
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
        onTestSuccess={onTestSuccess}
        onTestFail={onTestFail}
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
