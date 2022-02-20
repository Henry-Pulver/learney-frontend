import React, { useEffect, useState } from "react";
import { classNames } from "../lib/reactUtils";
import { ConceptSearchBox } from "./ConceptSearchBox";
import { AcademicCapIcon, XIcon } from "@heroicons/react/outline";
import { LoadingSpinner } from "./animations";
import { ButtonPressFunction } from "../lib/types";
import {
  ElementsDefinition,
  NodeDataDefinition,
  NodeSingular,
} from "cytoscape";
import { XCloseButton } from "./utils";

export default function ExploreLearnIntroPage({
  hideExploreLearn,
  mapName,
  mapJson,
  setGoal,
  pageLoaded,
  userId,
  sessionId,
  buttonPressFunction,
}: {
  hideExploreLearn: () => void;
  mapName: string;
  mapJson: ElementsDefinition;
  setGoal: (goal: NodeSingular, userId: string, sessionId: string) => void;
  pageLoaded: boolean;
  userId: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [goalsSet, setGoalsSet] = useState<object>({});
  const addGoalSet = (goalId: string) =>
    setGoalsSet({ ...goalsSet, [goalId]: true });
  const removeGoalSet = (goalId: string) => {
    const goals = { ...goalsSet };
    delete goals[goalId];
    setGoalsSet(goals);
  };
  function setGoalsOnMap(goals: object, userID: string, sessionID: string) {
    Object.keys(goals).forEach((goalId) =>
      setGoal(window.cy.getElementById(goalId), userID, sessionID)
    );
  }
  const [learnClicked, setLearnClicked] = useState<boolean | null>(null);
  const onLearnClick = (
    goals: object,
    isPageLoaded: boolean,
    userID: string,
    sessionID: string
  ) => {
    const goalsHaveBeenSet = Object.keys(goals).length !== 0;
    setLearnClicked(goalsHaveBeenSet);
    if (isPageLoaded && goalsHaveBeenSet) {
      setGoalsOnMap(goals, userID, sessionID);
      hideExploreLearn();
    }
  };
  useEffect(() => {
    if (pageLoaded && learnClicked) {
      setGoalsOnMap(goalsSet, userId, sessionId);
      hideExploreLearn();
    }
  }, [pageLoaded]);
  const onExploreClick = (
    goals: object,
    isPageLoaded: boolean,
    userID: string,
    sessionID: string
  ) => {
    /** If goals have been selected, set them! **/
    const goalsHaveBeenSet = Object.keys(goals).length !== 0;
    setLearnClicked(goalsHaveBeenSet);
    if (isPageLoaded && goalsHaveBeenSet)
      setGoalsOnMap(goals, userID, sessionID);
    hideExploreLearn();
  };

  return (
    // <!-- Extra Large Modal -->
    <div className="fixed inset-0 z-40 items-center justify-center overflow-y-auto overflow-x-hidden">
      <div className="relative flex h-full w-full justify-center md:h-auto">
        {/* Grey out the map in the background */}
        <button
          className="absolute left-0 top-0 h-screen w-screen cursor-default bg-black opacity-30"
          onClick={
            !learnClicked
              ? buttonPressFunction(
                  () => onExploreClick(goalsSet, pageLoaded, userId, sessionId),
                  "Explore Learn Intro Page Outside Modal"
                )
              : buttonPressFunction(() => {},
                "Explore Learn Intro Page Outside Modal")
          }
        />
        {/* Modal content */}
        <div className="relative relative min-h-full min-w-full max-w-2xl rounded-none bg-white shadow dark:bg-gray-700 md:mt-20 md:min-h-0 md:min-w-0 md:rounded-xl xl:mt-28">
          <XCloseButton
            onClick={
              !learnClicked
                ? buttonPressFunction(
                    () =>
                      onExploreClick(goalsSet, pageLoaded, userId, sessionId),
                    "Explore Learn Intro Page Close X Button"
                  )
                : buttonPressFunction(() => {},
                  "Explore Learn Intro Page Close X Button")
            }
          />
          {/* Modal body */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center">
              <img
                className="absolute left-0 top-0 m-1 h-8 w-auto sm:relative sm:mt-4 sm:h-10 md:mt-8 md:h-14 xl:mt-12 xl:h-16"
                src={"/images/learney_logo_256x256.png"}
                alt="Learney"
              />
              <h3 className="mt-4 max-w-xxs text-center text-base text-gray-700 sm:mt-12 sm:max-w-xl md:text-3xl">
                From <b>{mapName}</b>, I want to learn...
              </h3>
              {/* Search box wrapper to add red outline when  */}
              <div
                className={classNames(
                  learnClicked === false &&
                    Object.keys(goalsSet).length === 0 &&
                    "rounded-full ring-2 ring-red-400 ring-offset-2",
                  "z-10 mt-4 w-5/6 max-w-2xl sm:mt-8"
                )}
              >
                <ConceptSearchBox
                  mapJson={mapJson}
                  onSelect={buttonPressFunction(
                    (item) => addGoalSet(item.id),
                    "Learn Explore Intro Page Goal Selected"
                  )}
                  classes="animate-none z-10"
                  searchStyling={
                    learnClicked === false && Object.keys(goalsSet).length === 0
                      ? {
                          backgroundColor: "#fef2f2",
                          border: "1px solid #4b5563",
                        }
                      : { border: "1px solid #4b5563" }
                  }
                  maxResults={5}
                  showTitle={true}
                  setShowTitle={() => {}}
                />
              </div>
              <p
                className={classNames(
                  learnClicked === false && Object.keys(goalsSet).length === 0
                    ? "visible"
                    : "invisible",
                  "mt-4 text-lg font-bold text-red-500"
                )}
              >
                Set what you want to learn
              </p>
              <GoalsList
                mapJson={mapJson}
                goals={goalsSet}
                removeGoal={removeGoalSet}
                buttonPressFunction={buttonPressFunction}
              />
            </div>
          </div>
          {/* FOOTER BAR */}
          <div className="absolute bottom-0 z-50 flex w-full place-content-center items-center justify-between space-x-2 rounded-none border-t border-gray-200 bg-white p-2 dark:border-gray-600 sm:justify-center sm:p-4 md:rounded-b-xl">
            {/* EXPLORE BUTTON */}
            <div className="relative flex flex-row p-1 text-gray-500 sm:absolute sm:left-0 sm:flex-col md:p-2">
              <div className="flex flex-row justify-center text-sm">
                <div className="pr-1 align-middle">Or</div>
                <p className="hidden pr-2 md:flex">just</p>
              </div>
              <button
                className="btn-3 btn-xs md:btn-md whitespace-pre-wrap sm:whitespace-normal"
                onClick={
                  !learnClicked
                    ? buttonPressFunction(
                        () =>
                          onExploreClick(
                            goalsSet,
                            pageLoaded,
                            userId,
                            sessionId
                          ),
                        "Intro Page Explore"
                      )
                    : buttonPressFunction(() => {},
                      "Intro Page Explore (Deactivated)")
                }
              >
                {learnClicked ? (
                  <LoadingSpinner classes="w-6 h-6 my-0.5 mx-5" />
                ) : (
                  "Explore \nMap"
                )}
              </button>
            </div>
            {/* LEARN BUTTON */}
            <button
              className={classNames(
                learnClicked === false &&
                  Object.keys(goalsSet).length === 0 &&
                  "ring-2 ring-red-400 ring-offset-2 focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                "btn-blue btn-lg md:btn-xl"
              )}
              onClick={
                !learnClicked
                  ? buttonPressFunction(
                      () =>
                        onLearnClick(goalsSet, pageLoaded, userId, sessionId),
                      "Intro Page Learn"
                    )
                  : buttonPressFunction(() => {},
                    "Intro Page Learn (Deactivated)")
              }
            >
              {learnClicked ? (
                <LoadingSpinner classes="w-8 h-8 mx-3.5" />
              ) : (
                "Learn"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsList({
  mapJson,
  goals,
  removeGoal,
  classes,
  buttonPressFunction,
}: {
  mapJson: ElementsDefinition;
  goals: object;
  removeGoal: (goalId: string) => void;
  classes?: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <span
      className={classNames(
        "relative mx-12 mt-4 mb-28 block h-28 w-10/12 max-w-xl overflow-auto rounded-xl border-2 border-dashed border-gray-200 p-2 text-center focus:outline-none sm:mx-60 sm:h-40 md:p-6 xl:border-4",
        classes
      )}
    >
      {Object.keys(goals).length !== 0 ? (
        <div className="flex flex-row flex-wrap gap-y-0.5 gap-x-1 sm:gap-y-1">
          {Object.keys(goals).map((goalId) => (
            <GoalListItem
              goalInfo={goalInfoFromId(goalId, mapJson)}
              removeGoal={removeGoal}
              buttonPressFunction={buttonPressFunction}
              key={goalId}
            />
          ))}
        </div>
      ) : (
        <>
          <AcademicCapIcon className="mx-auto h-12 w-auto text-gray-300 md:h-16" />
          <span className="mt-2 block text-sm text-gray-500 sm:font-medium lg:text-lg">
            Set what you want to learn
          </span>
        </>
      )}
    </span>
  );
}

function GoalListItem({
  goalInfo,
  removeGoal,
  buttonPressFunction,
}: {
  goalInfo: NodeDataDefinition;
  removeGoal: (goalId: string) => void;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <span
      style={{ backgroundColor: goalInfo.colour }}
      className={`flex rounded-lg px-1.5 py-0.5 align-middle text-sm text-gray-300 sm:py-1 sm:pl-3.5 sm:text-lg sm:font-semibold`}
    >
      {goalInfo.name}
      <button
        onClick={buttonPressFunction(
          () => removeGoal(goalInfo.id),
          `Explore Learn Intro Page Remove Goal Selected: ${goalInfo.name}`
        )}
      >
        <XIcon className="ml-0.5 h-5 w-5 text-gray-400 hover:text-gray-500 sm:ml-1 sm:h-6 sm:w-6" />
      </button>
    </span>
  );
}

function getBadgeColour(parentId: string, mapJson: ElementsDefinition): string {
  let badgeColour = null;
  mapJson.nodes.forEach((node) => {
    if (node.data.nodetype === "field" && node.data.id === parentId) {
      badgeColour = node.data.colour;
    }
  });
  if (badgeColour === null)
    throw new Error(`Topic with ID=${parentId} isn't in the map!`);
  return badgeColour;
}

function goalInfoFromId(
  goalId: string,
  mapJson: ElementsDefinition
): NodeDataDefinition {
  let nodeData = null;
  mapJson.nodes.forEach((node) => {
    if (node.data.id === goalId) {
      nodeData = { ...node.data };
      nodeData.colour = getBadgeColour(nodeData.parent, mapJson);
    }
  });
  if (nodeData === null)
    throw new Error(`Concept set as goal with ID=${goalId} isn't in the map!`);
  return nodeData;
}
