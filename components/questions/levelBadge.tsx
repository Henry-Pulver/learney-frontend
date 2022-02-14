import { classNames } from "../../lib/reactUtils";
import { BadgeCheckIcon } from "@heroicons/react/outline";
import React from "react";

export default function LevelBadge(props: {
  knowledgeLevel: number;
  achieved: boolean;
  overallClassName?: string;
  badgeClassName?: string;
  textClassName?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={props.onClick ? props.onClick : () => {}}
      className={classNames(
        !props.knowledgeLevel && "hidden",
        !props.achieved && "bg-gray-50",
        props.achieved && props.knowledgeLevel === 1 && "bg-blue-200",
        props.achieved && props.knowledgeLevel === 2 && "bg-yellow-200",
        props.achieved && props.knowledgeLevel === 3 && "bg-green-200",
        props.achieved && props.knowledgeLevel === 4 && "bg-purple-200",
        props.achieved && props.knowledgeLevel === 5 && "bg-pink-200",
        props.overallClassName,
        "flex flex-col place-items-center rounded-full"
      )}
    >
      <BadgeCheckIcon
        className={classNames(
          !props.achieved && "text-gray-300",
          props.achieved && props.knowledgeLevel === 1 && "text-blue-600",
          props.achieved && props.knowledgeLevel === 2 && "text-yellow-600",
          props.achieved && props.knowledgeLevel === 3 && "text-green-600",
          props.achieved && props.knowledgeLevel === 4 && "text-purple-600",
          props.achieved && props.knowledgeLevel === 5 && "text-pink-600",
          props.badgeClassName,
          "h-8 w-8 rounded-full md:h-10 md:w-10"
        )}
      />
      <p
        className={classNames(
          !props.achieved && "bg-gray-50 text-gray-400",
          props.achieved &&
            props.knowledgeLevel === 1 &&
            "bg-blue-100 text-blue-800",
          props.achieved &&
            props.knowledgeLevel === 2 &&
            "bg-yellow-100 text-yellow-800",
          props.achieved &&
            props.knowledgeLevel === 3 &&
            "bg-green-100 text-green-800",
          props.achieved &&
            props.knowledgeLevel === 4 &&
            "bg-purple-100 text-purple-800",
          props.achieved &&
            props.knowledgeLevel === 5 &&
            "bg-pink-100 text-pink-800",
          props.textClassName,
          "whitespace-nowrap rounded-full px-1"
        )}
      >
        {`Level ${props.knowledgeLevel}`}
      </p>
    </div>
  );
}
