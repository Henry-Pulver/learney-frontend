import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { ConceptTippy } from "./conceptInfo";
import { getDataFromStorage, saveVote } from "../lib/tooltips";
import {
  setGoalNodesGlobal,
  setLearnedNodesGlobal,
  goalNodes,
  learnedNodes,
} from "../lib/learningAndPlanning";
import { handleAnimation, initCy, bindRouters } from "../lib/graph";
import { setupCtoCentre } from "../lib/buttons";
import { classNames } from "../lib/reactUtils";
import { setURLQuery } from "../lib/utils";

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
        await initCy(mapJson, styleText, backendUrl, userId, mapUUID, editMap);
        bindRouters(
          backendUrl,
          userId,
          mapUUID,
          sessionId,
          showConceptTippy,
          hideConceptTippy,
          onSetGoalClick,
          editMap,
          router
        );

        // TODO: if goal is set, zoom there instead of to the bottom?
        if (router.query.topic || router.query.x) {
          const query = router.query;
          if (query.topic) {
            handleAnimation({
              fit: {
                eles: window.cy.filter(`[id = "${query.topic}"]`),
                padding: 50,
              },
              duration: 1200,
              easing: "ease-in-out",
            });
          } else if (query.concept) {
            window.cy.getElementById(query.concept).emit("tap");
          } else {
            handleAnimation({
              pan: { x: Number(router.query.x), y: Number(router.query.y) },
              zoom: Number(router.query.zoom),
              duration: 1200,
              easing: "ease-in-out",
            });
          }
        } else {
          handleAnimation({
            panBy: {
              x: -window.cy.width() / 6,
              y: (-window.cy.height() * 4) / 9,
            },
            zoom: 1.5 * window.cy.zoom(),
            duration: 1200,
            easing: "ease-in-out",
          });
        }
        setURLQuery(router, {});
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
          editType === "cursor" && "cursor-default",
          editType === "addNode" && "cursor-copy",
          editType === "addEdges" && "cursor-crosshair",
          editType === "delete" && "cursor-pointer",
          "absolute z-0 bg-black w-full h-full"
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
