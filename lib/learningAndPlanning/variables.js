import { saveToDB } from "../utils";
import {
  goalNodesString,
  learnedNodesString,
  learnedSliderClick,
} from "./learningAndPlanning";

export var learnedNodes;
export var goalNodes;
export var pathNodes = {};

export function setLearnedNodesGlobal(learned) {
  if (typeof learned === "string") {
    learnedNodes = JSON.parse(learned);
  } else {
    learnedNodes = learned;
  }
}

export function setGoalNodesGlobal(goals) {
  if (typeof goals === "string") {
    goalNodes = JSON.parse(goals);
  } else {
    goalNodes = goals;
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
  learnedNodes = {};
  goalNodes = {};
  setGoalsState({});
  setLearnedState({});
  pathNodes = {};
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
