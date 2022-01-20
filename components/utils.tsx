import { XIcon } from "@heroicons/react/outline";
import React from "react";
import { classNames } from "../lib/reactUtils";

export function XCloseButton({
  onClick,
  size,
  visibleOnMobile,
}: {
  onClick: () => void;
  size?: string;
  visibleOnMobile?: boolean;
}) {
  return (
    <div
      className={classNames(
        !visibleOnMobile && "hidden sm:block",
        "absolute top-1 sm:top-4 right-1 sm:right-4 z-10"
      )}
    >
      <button
        type="button"
        className="bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={onClick}
      >
        <span className="sr-only">Close</span>
        <XIcon
          className={classNames(
            size !== "small" ? "h-6 w-6" : "h-5 w-5",
            "text-gray-400 hover:text-gray-500"
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
