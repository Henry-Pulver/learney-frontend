import React from "react";
import { FireIcon } from "@heroicons/react/solid";
import { classNames } from "../../lib/reactUtils";
import { IconButtonTippy } from "../buttons";

export default function StreakIcon(props: { streak: number; today: boolean }) {
  return (
    <IconButtonTippy
      content={
        props.streak > 0
          ? props.today
            ? `You're on a daily streak of ${props.streak}!`
            : `Daily streak of ${props.streak}! Keep it up by completing a question batch!`
          : "Complete a question batch to start a streak!"
      }
    >
      <div className="group">
        <div
          className={classNames(
            "w-auto shrink-0 cursor-default rounded-full p-0.5 shadow-sm focus:outline-none",
            props.today
              ? "bg-yellow-200 text-red-500 group-hover:bg-yellow-300 group-hover:text-red-600"
              : "bg-white text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-500"
          )}
        >
          <div className="relative h-8 w-8">
            {/*<ChatIcon className="absolute right-0.5 top-0.5 h-6 w-6" />*/}
            <FireIcon
              className={classNames(
                // props.today && "",
                "absolute right-1 bottom-1 h-7 w-7"
              )}
            />
            <div
              className={classNames(
                props.today
                  ? "bg-red-300 text-gray-700 group-hover:bg-red-400 group-hover:text-gray-800"
                  : "bg-white text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-500",
                "absolute left-4 top-4 h-3.5 w-3.5 rounded-full pt-0.5 text-center text-xxs"
              )}
            >
              {props.streak}
            </div>
          </div>
        </div>
      </div>
    </IconButtonTippy>
  );
}
