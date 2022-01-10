import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { classNames } from "../lib/reactUtils";
import { ButtonPressFunction } from "../lib/types";

export default function MapTitle({
  title,
  description,
  buttonPressFunction,
}: {
  title: string;
  description: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [descriptionExpanded, setDescriptionExpanded] =
    useState<boolean>(false);
  if (title.length === 0) return <></>;
  return (
    <div
      className="absolute z-10 left-8 top-6 bg-white rounded-lg max-w-xl px-4 py-2"
      onClick={
        !descriptionExpanded
          ? buttonPressFunction(
              () => setDescriptionExpanded(true),
              "Map Title Anywhere (Expand)"
            )
          : buttonPressFunction(() => {}, "Map Title Anywhere (Invalid)")
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
              className="gray-icon-btn-no-padding rounded-xl text-gray-500 hover:text-gray-600 z-20"
              onClick={buttonPressFunction((e) => {
                e.stopPropagation(); // Stops parent div's onClick function from being called!
                setDescriptionExpanded((expanded) => !expanded);
              }, "Map Title Expand/Minimise Button")}
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
