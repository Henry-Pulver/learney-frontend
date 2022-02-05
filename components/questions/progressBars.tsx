import React from "react";
import { classNames } from "../../lib/reactUtils";
import LevelBadge from "./levelBadge";

export function LevelsProgressBar(props: {
  knowledgeLevel: number;
  maxKnowledgeLevel: number;
  onClick?: () => void;
}) {
  return (
    <div className="max-w-xl w-full grid grid-cols-7 sm:grid-cols-8 gap-4 sm:gap-0 text-sm items-center text-gray-900 px-2">
      <div className="sm:col-start-2 col-span-6">
        <ProgressBar
          colour="green"
          className="cursor-pointer"
          onClick={props.onClick}
          percentFilled={
            props.knowledgeLevel < props.maxKnowledgeLevel
              ? Math.max(
                  Math.min(
                    realPercentageToProgress(props.knowledgeLevel % 1),
                    100
                  ),
                  0
                )
              : 100
          }
        />
      </div>
      <LevelBadge
        overallClassName={classNames(
          props.knowledgeLevel >= props.maxKnowledgeLevel && "invisible",
          "visible col-span-1 justify-self-center cursor-pointer text-xs lg:text-sm"
        )}
        knowledgeLevel={Math.floor(Math.max(props.knowledgeLevel, 0) + 1)}
        achieved={true}
        onClick={props.onClick}
      />
    </div>
  );
}

export function ProgressBar(props: {
  colour?: "green" | "blue" | "orange" | "red";
  percentFilled: number | null; // Allow null to stop animating progress
  // bar down when going from a concept with progress to one without
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        props.className,
        "w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
      )}
      onClick={props.onClick ? props.onClick : () => {}}
    >
      <div
        className={classNames(
          (props.colour === undefined || props.colour === "green") &&
            "bg-green-600",
          props.colour === "blue" && "bg-blue-600",
          props.colour === "orange" && "bg-orange-600",
          props.colour === "red" && "bg-red-600",
          props.percentFilled !== null ? "duration-1000" : "duration-0",
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
