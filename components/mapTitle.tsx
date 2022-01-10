import React, { useState } from "react";
import { classNames } from "../lib/reactUtils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";

export default function MapTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [descriptionExpanded, setDescriptionExpanded] =
    useState<boolean>(false);
  if (title.length === 0) return <></>;
  console.log(description);
  return (
    <div
      className="absolute z-10 left-8 top-6 bg-white rounded-lg max-w-xl px-4 py-2"
      onClick={
        !descriptionExpanded ? () => setDescriptionExpanded(true) : () => {}
      }
    >
      <div className="relative">
        <div className="text-3xl text-gray-900 font-semibold">{title}</div>
        {description.length > 0 && (
          <div
            className={classNames(
              "text-lg text-gray-700 py-1 whitespace-pre-line",
              !descriptionExpanded &&
                "overflow-hidden max-h-8 whitespace-nowrap overflow-ellipsis pr-8"
            )}
          >
            {description}
          </div>
        )}
        {description.length > 64 && (
          <div className="absolute right-0 bottom-0">
            <button
              className="gray-icon-btn-no-padding rounded-xl text-gray-500 hover:text-gray-600"
              onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            >
              <span className="sr-only">
                {descriptionExpanded
                  ? "Minimise description"
                  : "Expand description"}
              </span>
              {descriptionExpanded ? (
                <ChevronUpIcon className="h-7 w-7" />
              ) : (
                <ChevronDownIcon className="h-7 w-7" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
