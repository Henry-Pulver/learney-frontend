import { isAnonymousUser, saveToDB } from "./utils";
import Tippy from "tippy.js";

export const learnedNodesString = "learnedNodes";
export const goalNodesString = "goalNodes";

export var signInTooltip = null;

function nodeLearned(node) {
  learnedNodes[node.data().id] = true;
  node.addClass("learned");
  node.style("opacity", 1);
}

function checkEdgeLearned(edge) {
  if (
    edge.source().classes().includes("learned") &&
    edge.target().classes().includes("learned")
  ) {
    edge.addClass("learned");
    edge.style("opacity", 1);
  } else {
    edge.removeClass("learned");
  }
}

export function learnedSliderClick(
  node,
  backendUrl,
  userId,
  mapUUID,
  sessionId
) {
  let nodeId = node.data().id;
  // If not learned...
  if (!(nodeId in learnedNodes)) {
    nodeLearned(node);
    // Deal with predecessors
    node.predecessors("node").forEach(function (node) {
      nodeLearned(node);
    });
    node.predecessors("edge").forEach(function (edge) {
      checkEdgeLearned(edge);
    });
  } else {
    // Learned or set as not learned
    node.toggleClass("learned");
    learnedNodes[nodeId] = !learnedNodes[nodeId];
    // Deal with edges
    node.connectedEdges().forEach(function (edge) {
      checkEdgeLearned(edge);
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
  path.nodes().forEach(function (node) {
    pathNodes[node.data().id] = true;
    node.style("opacity", 1);
  });
  path.edges().forEach(function (edge) {
    edge.style("opacity", 1);
  });
}

function promptSignInTooltip(text) {
  return Tippy("#profileImageButton", {
    content: text,
    arrow: true,
    theme: "light",
    maxWidth: "200px",
    placement: "bottom",
    delay: [0, 3000],
  })[0];
}

export function initialiseSignInTooltip() {
  signInTooltip = promptSignInTooltip(
    "To keep your progress across sessions, sign in here!"
  );
}

function setGoalIfSignedIn(node, userId) {
  setGoal(node);
  if (isAnonymousUser(userId)) signInTooltip.show();
}

function setGoal(node) {
  goalNodes[node.data().id] = true;
  node.addClass("goal");
  node.removeClass("path");
  node.style("opacity", 1);
  setPath(node);
}

function unsetGoal(node) {
  delete goalNodes[node.data().id];
  node.removeClass("goal");

  // Remove this goal's path
  let path = node.predecessors().not(".goal");
  path.removeClass("path");
  path.nodes().forEach(function (node) {
    delete pathNodes[node.data().id];
  });
  // Ensure all other goals have correct paths
  for (const goalId in goalNodes) {
    setPath(window.cy.nodes(`[id = "${goalId}"]`));
  }
}

export function setGoalClick(node, backendUrl, userId, mapUUID, sessionId) {
  let nodeId = node.data().id;

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
