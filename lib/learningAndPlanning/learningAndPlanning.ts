import {
  learnedNodes,
  pathNodes,
  goalNodes,
  emptyLearnedGoalsPaths,
} from "./variables";
import { setNodeBrightness, setEdgeBrightness } from "../graph";
import { isAnonymousUser, saveToDB } from "../utils";
import Tippy from "tippy.js";

export const learnedNodesString = "learnedNodes";
export const goalNodesString = "goalNodes";

export var signInTooltip = null;

function nodeLearned(node) {
  learnedNodes[node.id()] = true;
  node.addClass("learned");
  setNodeBrightness(node);
}

function toggleEdgeLearned(edge) {
  if (
    edge.source().classes().includes("learned") &&
    edge.target().classes().includes("learned")
  ) {
    edge.addClass("learned");
    setEdgeBrightness(edge);
  } else {
    edge.removeClass("learned");
    setEdgeBrightness(edge, 1);
  }
}

export function learnedSliderClick(
  node,
  backendUrl,
  userId,
  mapUUID,
  sessionId
) {
  let nodeId = node.id();
  // If not learned...
  if (!(nodeId in learnedNodes)) {
    nodeLearned(node);
    // Deal with predecessors
    node.predecessors("node").forEach(function (node) {
      nodeLearned(node);
    });
    node.predecessors("edge").forEach(function (edge) {
      toggleEdgeLearned(edge);
    });
  } else {
    // Learned or set as not learned
    node.toggleClass("learned");
    learnedNodes[nodeId] = !learnedNodes[nodeId];
    setNodeBrightness(node, 1);
    // Deal with edges
    node.connectedEdges().forEach(function (edge) {
      toggleEdgeLearned(edge);
    });
  }
  saveToDB(
    learnedNodesString,
    learnedNodes,
    backendUrl,
    userId,
    mapUUID,
    sessionId
  );
  if (isAnonymousUser(userId)) signInTooltip.show();
}

function setPath(node) {
  let path = node.predecessors().not(".goal").not(".path");
  path.addClass("path");
  path.nodes().forEach((node) => {
    pathNodes[node.id()] = true;
  });
  setNodeBrightness(path.nodes());
  setEdgeBrightness(path.edges(), 1);
}

function promptSignInTooltip(text) {
  return Tippy("#profileImageButton", {
    content: text,
    arrow: true,
    theme: "dark",
    maxWidth: "200px",
    placement: "bottom",
    delay: [0, 3000],
  })[0];
}

export function initialiseSignInTooltip() {
  signInTooltip = promptSignInTooltip(
    "To keep progress across sessions, sign in here!"
  );
}

function setGoalIfSignedIn(node, userId) {
  setGoal(node);
  if (isAnonymousUser(userId)) signInTooltip.show();
}

function setGoal(node) {
  goalNodes[node.id()] = true;
  node.addClass("goal");
  node.removeClass("path");
  setNodeBrightness(node);
  setPath(node);
}

function unsetGoal(node) {
  delete goalNodes[node.id()];
  node.removeClass("goal");
  setNodeBrightness(node, 0);

  // Remove this goal's path
  let path = node.predecessors().not(".goal");
  path.removeClass("path");
  path.nodes().forEach(function (node) {
    delete pathNodes[node.id()];
  });
  // Ensure all other goals have correct paths
  for (const goalId in goalNodes) {
    setPath(window.cy.getElementById(goalId));
  }
  setNodeBrightness(path.nodes(), 0);
  setEdgeBrightness(path.edges(), 0);
}

export function setGoalClick(node, backendUrl, userId, mapUUID, sessionId) {
  let nodeId = node.id();

  // If not already set!
  if (!(nodeId in goalNodes)) {
    // Set goal to class goal and unknown dependencies to class: path
    setGoalIfSignedIn(node, userId);
  } else {
    // If unsetting a goal, remove path from its predecessors and recalculate path to remaining goals
    unsetGoal(node);
  }
  saveToDB(goalNodesString, goalNodes, backendUrl, userId, mapUUID, sessionId);
}

export function initialiseGraphState(userId) {
  for (const nodeId in learnedNodes) {
    let node = window.cy.getElementById(nodeId);
    if (node.data() !== undefined) {
      if (learnedNodes[nodeId] === true) {
        nodeLearned(node);
        node.connectedEdges().forEach(function (edge) {
          toggleEdgeLearned(edge);
        });
      }
    } else {
      delete learnedNodes[nodeId];
    }
  }
  for (const nodeId in goalNodes) {
    let node = window.cy.getElementById(nodeId);
    if (node.data() !== undefined) {
      setGoalIfSignedIn(node, userId);
    } else {
      delete goalNodes[nodeId];
    }
  }
}

export function resetProgress(
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  setGoalsState,
  setLearnedState
) {
  for (const goalId in goalNodes) {
    unsetGoal(window.cy.getElementById(goalId));
  }
  for (const learnedId in learnedNodes) {
    if (learnedNodes[learnedId] === true) {
      learnedSliderClick(
        window.cy.getElementById(learnedId),
        backendUrl,
        userId,
        mapUUID,
        sessionId
      );
    }
  }
  emptyLearnedGoalsPaths();
  setGoalsState({});
  setLearnedState({});
  saveToDB(
    learnedNodesString,
    learnedNodes,
    backendUrl,
    userId,
    mapUUID,
    sessionId
  );
  saveToDB(goalNodesString, goalNodes, backendUrl, userId, mapUUID, sessionId);
}
