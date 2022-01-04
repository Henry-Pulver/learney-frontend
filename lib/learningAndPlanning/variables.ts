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

export function emptyLearnedGoalsPaths() {
  learnedNodes = {};
  goalNodes = {};
  pathNodes = {};
}
