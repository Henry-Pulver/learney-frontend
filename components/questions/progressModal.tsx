import React from "react";
import { Dialog } from "@headlessui/react";
import { TrophyIcon } from "../svgs/icons";
import LevelBadge from "./levelBadge";
import { classNames } from "../../lib/reactUtils";
import { realPercentageToProgress } from "./progressBars";
import Modal from "../modal";

export function ProgressModal(props: {
  progressModalOpen: boolean;
  closeProgressModalOpen: () => void;
  knowledgeLevel: number;
  maxKnowledgeLevel: number;
  conceptName: string;
}) {
  return (
    <Modal
      open={props.progressModalOpen}
      setClosed={props.closeProgressModalOpen}
      dialogClassName="sm:z-20"
      modalClassName="items-center"
      contentClassName="md:max-w-3xl"
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 sm:mx-0 sm:h-16 sm:w-16">
          <TrophyIcon />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:text-left md:my-auto">
          <Dialog.Title as="h3" className="text-lg leading-6 text-gray-900">
            Your Progress on &quot;<b>{props.conceptName}</b>&quot;
          </Dialog.Title>
        </div>
      </div>

      <div className="mt-6 flex justify-center text-xl">
        {/*@ts-ignore*/}
        {[...Array(props.maxKnowledgeLevel + 1).keys()].map((level) => (
          <div className="flex items-center" key={level}>
            <LevelBadge
              key={level}
              knowledgeLevel={level}
              achieved={props.knowledgeLevel > level}
              overallClassName="transition ease-in-out delay-1000 duration-700"
              badgeClassName={
                "h-8 w-8 lg:h-16 lg:w-16 transition ease-in-out delay-1000 duration-700"
              }
              textClassName="text-sm sm:text-xl transition ease-in-out delay-1000 duration-700"
            />
            {level !== props.maxKnowledgeLevel && (
              <div
                className={classNames(
                  props.maxKnowledgeLevel === 2 && "w-40",
                  props.maxKnowledgeLevel === 3 && "w-28",
                  props.maxKnowledgeLevel === 4 && "w-20",
                  props.maxKnowledgeLevel === 5 && "w-14",
                  "flex h-1 items-center bg-gray-200"
                )}
              >
                <div
                  className={classNames(
                    props.knowledgeLevel > level + 1 && "w-full",
                    props.knowledgeLevel <= level + 1 && "rounded-r-full",
                    "h-1 bg-green-600 transition-all duration-1000 ease-in-out"
                  )}
                  style={
                    props.knowledgeLevel &&
                    level <= props.knowledgeLevel &&
                    props.knowledgeLevel <= level + 1
                      ? {
                          width: `${Math.max(
                            Math.min(
                              realPercentageToProgress(
                                props.knowledgeLevel % 1
                              ),
                              100
                            ),
                            0
                          )}%`,
                        }
                      : {}
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 mb-2 flex w-full flex-row justify-center text-lg font-bold">
        {props.knowledgeLevel > 1 ? (
          <>
            <p className="px-2 text-2xl leading-5">🎉</p>
            You&apos;ve completed Level {Math.floor(props.knowledgeLevel)}{" "}
            <p className="px-2 text-2xl leading-5">🎉</p>
          </>
        ) : (
          "Answer questions to reach Level 1!"
        )}
      </div>
    </Modal>
  );
}
