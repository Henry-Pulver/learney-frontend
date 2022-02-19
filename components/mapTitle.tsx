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
      className={classNames(
        "absolute left-0 top-0 z-10 max-w-xl overflow-y-auto border-t border-t-gray-300 bg-white px-4 py-2 sm:left-8 sm:top-6 sm:rounded-lg",
        descriptionExpanded && "h-excl-toolbar sm:h-[auto]"
      )}
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
        <div className="pr-6 text-2xl font-semibold text-gray-900 sm:pr-0 sm:text-3xl">
          {title}
        </div>
        {description.length > 0 && (
          <div
            className={classNames(
              "whitespace-pre-line py-1 text-lg text-gray-700",
              !descriptionExpanded &&
                "max-h-0 overflow-hidden text-ellipsis whitespace-nowrap pr-8 sm:max-h-8"
            )}
          >
            {description}
          </div>
        )}
        {description.length > 64 && (
          <div className="absolute right-0 bottom-0">
            <button
              className="gray-icon-btn-no-padding z-20 rounded-xl text-gray-500 hover:text-gray-600"
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
