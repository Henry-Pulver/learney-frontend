import { CheckCircleIcon } from "@heroicons/react/outline";
import { NodeSingular } from "cytoscape";
import { NotificationData } from "../editor/types";

export function getRandomProgressMessage(nextNodeName: string): string {
  const progressMessages = [
    "'A journey of a thousand miles begins with a single step' - Chinese proverb.",
    "Small steps will take you to your goals! Keep going!",
  ];
  let message =
    progressMessages[Math.floor(Math.random() * progressMessages.length)];
  if (nextNodeName) {
    message += ` Next up: ${nextNodeName}!`;
  }
  return message;
}

export function getRandomGoalMessage(nextNodeName: string): string {
  const goalMessages = [
    "You've made impressive progress!",
    "Time to crack open the champagne!",
  ];
  let message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
  if (!nextNodeName) {
    message += " What's next? It's the ideal time to set your new goal!";
  } else {
    message += ` Let's hit another goal! Next is ${nextNodeName}`;
  }
  return message;
}

export function setNotificationProgressInfo(
  node: NodeSingular,
  nextNodeToLearn: NodeSingular | undefined,
  updateNotificationInfo: (newNotificationInfo: NotificationData) => void
) {
  if (node.hasClass("goal")) {
    // If goal achieved
    let message;
    if (nextNodeToLearn !== undefined) {
      nextNodeToLearn.emit("tap");
      message = getRandomGoalMessage(nextNodeToLearn.data().name);
    } else message = undefined;
    updateNotificationInfo({
      title: `Congratulations - reached goal: ${node.data().name}!`,
      message: message,
      Icon: CheckCircleIcon,
      colour: "green",
      show: true,
    });
  } else if (nextNodeToLearn === undefined) {
    // If no goal set - prompt to set goal
    updateNotificationInfo({
      title: `Congratulations - time to set a goal!`,
      message: `You've learned ${
        node.data().name
      }, what's next? Set a goal on the map!`,
      Icon: CheckCircleIcon,
      colour: "green",
      show: true,
    });
  } else {
    // If concept on path learned
    updateNotificationInfo({
      title: `Congratulations - learned ${node.data().name}!`,
      message: getRandomProgressMessage(nextNodeToLearn.data().name),
      Icon: CheckCircleIcon,
      colour: "green",
      show: true,
    });
    nextNodeToLearn.emit("tap");
  }
}
