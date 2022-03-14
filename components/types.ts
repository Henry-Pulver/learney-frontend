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
  message: string | JSX.Element;
  Icon: React.ComponentType<any>;
  colour: "green" | "red" | "blue" | "";
  show: boolean;
  side?: "right" | "left";
  bottom?: boolean;
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
  // questions_streak tells you if the user has access to the AI tutor or not!
  // If it is undefined, then the user doesn't have access to the AI tutor.
  questions_streak: undefined,
  batch_completed_today: false,
};
