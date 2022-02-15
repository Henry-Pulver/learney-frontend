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
  colour: "green" | "red" | "";
  show: boolean;
  side?: "right" | "left";
};

export type UserData = {
  id: string;
  email: string;
  questions_streak: number;
  batch_completed_today: boolean;
};

export const emptyUserData = {
  id: undefined,
  email: "",
  questions_streak: 0,
  batch_completed_today: false,
};
