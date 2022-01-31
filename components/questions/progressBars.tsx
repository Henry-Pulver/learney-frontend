import React from "react";
import { classNames } from "../../lib/reactUtils";

export function LevelsProgressBar(props: { knowledgeLevel: number }) {
  return (
    <div className="max-w-lg w-full flex justify-between content-center text-gray-900 font-bold">
      <p
        className={classNames(
          "text-base bg-green-100 p-auto w-7 h-7 rounded-full border-solid border-green-600 border-2",
          (!props.knowledgeLevel || Math.floor(props.knowledgeLevel)) === 0 &&
            "invisible"
        )}
      >
        {Math.floor(props.knowledgeLevel)}
      </p>
      <div className="w-5/6 my-2">
        <ProgressBar
          colour="green"
          percentFilled={
            props.knowledgeLevel
              ? Math.max(
                  Math.min(
                    realPercentageToProgress(props.knowledgeLevel % 1),
                    100
                  ),
                  0
                )
              : null
          }
        />
      </div>
      <p className="text-base bg-green-100 p-auto w-7 h-7 rounded-full border-solid border-green-600 border-2">
        {props.knowledgeLevel ? Math.floor(props.knowledgeLevel) + 1 : 1}
      </p>
    </div>
  );
}

export function ProgressBar(props: {
  colour?: "green" | "blue" | "orange" | "red";
  percentFilled: number | null;
}) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className={classNames(
          (props.colour === undefined || props.colour === "green") &&
            "bg-green-600",
          props.colour === "blue" && "bg-blue-600",
          props.colour === "orange" && "bg-orange-600",
          props.colour === "red" && "bg-red-600",
          props.percentFilled ? "duration-1000" : "duration-0",
          `h-2.5 rounded-full transition-all ease-in-out`
        )}
        style={
          props.percentFilled
            ? { width: `${props.percentFilled}%` }
            : { width: "0%" }
        }
      />
    </div>
  );
}

export function realPercentageToProgress(knowledgeLevel: number): number {
  return 100 * (1 - Math.E ** -(knowledgeLevel * 1.61));
}
