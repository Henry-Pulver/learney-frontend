import { NodeSingular } from "cytoscape";

export type OnGoalLearnedClick = (
  node: NodeSingular,
  userId: string,
  sessionId: string
) => void;
export type SetLearnedState = (learnedState: object) => void;
export type SetGoalState = (goalState: object) => void;
