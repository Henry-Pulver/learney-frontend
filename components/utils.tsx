import {XIcon} from "@heroicons/react/outline";
import React from "react";
import {classNames} from "../lib/reactUtils";

export function XCloseButton({onClick, size} : {onClick: () => void, size?: string}) {
    return (
      <div className="hidden sm:block absolute top-4 right-4">
        <button
          type="button"
          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onClick}
        >
          <span className="sr-only">Close</span>
          <XIcon className={size !== "small" ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true" />
        </button>
      </div>
    )
}
