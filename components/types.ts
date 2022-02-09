import { NodeSingular } from "cytoscape";
import React from "react";

export type OnGoalLearnedClick = (
  node: NodeSingular,
  userId: string,
  sessionId: string
) => void;
export type SetLearnedState = (learnedState: object) => void;
export type SetGoalState = (goalState: object) => void;

export type NotificationData = {
  title: string;
  message: string;
  Icon: React.ComponentType<any>;
  colour: "green" | "red" | "orange" | "";
  show: boolean;
  side?: "right" | "left";
};
