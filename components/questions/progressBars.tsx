import React from "react";
import { classNames } from "../../lib/reactUtils";
import { QuestionSet } from "../../lib/questions";
import { AnswersGiven } from "./progressDots";

export default function ProgressBar(props: {
  colour?: "green" | "blue" | "orange" | "red";
  percentFilled: number;
}) {
  return (
    <div className="w-11/12 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={classNames(
          (props.colour === undefined || props.colour === "green") &&
            "bg-green-600",
          props.colour === "blue" && "bg-blue-600",
          props.colour === "orange" && "bg-orange-600",
          props.colour === "red" && "bg-red-600",
          `h-2.5 rounded-full transition-all duration-1000 ease-in-out`
        )}
        style={{ width: `${props.percentFilled}%` }}
      />
    </div>
  );
}

export function realPercentageToProgress(
  questionSet: QuestionSet,
  answersGiven: AnswersGiven,
  knowledgeLevel: number, // between 0 and 1
  testSuccessfullyCompleted: boolean,
  previousProgressLevel: number
): number {
  if (testSuccessfullyCompleted) return 100;
  const correctArray: Array<number> = answersGiven.map((answer, idx) =>
    Number(answer === questionSet[idx].correct_answer)
  );
  let totalProgress = 0;
  if (answersGiven.length > 0 && correctArray.reduce((a, b) => a + b, 0))
    totalProgress += 20;
  totalProgress += 100 * (1 - Math.E ** -(knowledgeLevel * 1.61));
  console.log(totalProgress);
  return Math.max(totalProgress, previousProgressLevel); // Progress bar only moves in the positive direction
}
