import {
  learnedNodes,
  pathNodes,
  goalNodes,
  emptyLearnedGoalsPaths,
} from "./variables";
import { setNodeBrightness, setEdgeBrightness } from "../graph";
import { isAnonymousUser, saveToDB } from "../utils";
import Tippy from "tippy.js";
import { SetGoalState, SetLearnedState } from "../../components/types";
import { EdgeSingular, NodeSingular } from "cytoscape";

export const learnedNodesString = "learnedNodes";
export const goalNodesString = "goalNodes";

export var signInTooltip = null;

function nodeLearned(node: NodeSingular): void {
  learnedNodes[node.id()] = true;
  node.addClass("learned");
  setNodeBrightness(node);
}

function toggleEdgeLearned(edge: EdgeSingular): void {
  if (edge.source().hasClass("learned") && edge.target().hasClass("learned")) {
    edge.addClass("learned");
    setEdgeBrightness(edge);
  } else {
    edge.removeClass("learned");
    setEdgeBrightness(edge, 1);
  }
}

export async function learnedSliderClick(
  node: NodeSingular,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string
): Promise<void> {
  const nodeId = node.id();
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
  await saveToDB(
    learnedNodesString,
    learnedNodes,
    backendUrl,
    userId,
    mapUUID,
    sessionId
  );
  if (isAnonymousUser(userId)) signInTooltip.show();
}

function setPath(node: NodeSingular): void {
  const path = node.predecessors().not(".goal").not(".path");
  path.addClass("path");
  path.nodes().forEach((node) => {
    pathNodes[node.id()] = true;
  });
  setNodeBrightness(path.nodes());
  setEdgeBrightness(path.edges(), 1);
}

function promptSignInTooltip(text: string) {
  return Tippy("#profileImageButton", {
    content: text,
    arrow: true,
    theme: "dark",
    maxWidth: "200px",
    placement: "bottom",
    delay: [0, 3000],
  })[0];
}

export function initialiseSignInTooltip(): void {
  signInTooltip = promptSignInTooltip(
    "To keep progress across sessions, sign in here!"
  );
}

function setGoalIfSignedIn(node: NodeSingular, userId: string): void {
  setGoal(node);
  if (isAnonymousUser(userId)) signInTooltip.show();
}

function setGoal(node: NodeSingular): void {
  goalNodes[node.id()] = true;
  node.addClass("goal");
  node.removeClass("path");
  setNodeBrightness(node);
  setPath(node);
}

function unsetGoal(node: NodeSingular): void {
  delete goalNodes[node.id()];
  node.removeClass("goal");
  setNodeBrightness(node, 0);

  // Remove this goal's path
  const path = node.predecessors().not(".goal");
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

export async function setGoalClick(
  node: NodeSingular,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string
): Promise<void> {
  const nodeId = node.id();

  // If not already set!
  if (!(nodeId in goalNodes)) {
    // Set goal to class goal and unknown dependencies to class: path
    setGoalIfSignedIn(node, userId);
  } else {
    // If unsetting a goal, remove path from its predecessors and recalculate path to remaining goals
    unsetGoal(node);
  }
  await saveToDB(
    goalNodesString,
    goalNodes,
    backendUrl,
    userId,
    mapUUID,
    sessionId
  );
}

export function initialiseGraphState(userId: string): void {
  for (const nodeId in learnedNodes) {
    const node = window.cy.getElementById(nodeId);
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
    const node = window.cy.getElementById(nodeId);
    if (node.data() !== undefined) {
      setGoalIfSignedIn(node, userId);
    } else {
      delete goalNodes[nodeId];
    }
  }
}

export function resetProgress(
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string,
  setGoalsState: SetGoalState,
  setLearnedState: SetLearnedState
): void {
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
