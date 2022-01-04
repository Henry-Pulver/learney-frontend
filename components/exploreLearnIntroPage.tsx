import React, { useEffect, useState } from "react";
import { classNames } from "../lib/reactUtils";
import { ConceptSearchBox } from "./ConceptSearchBox";
import { AcademicCapIcon, XIcon } from "@heroicons/react/outline";
import { LoadingSpinner } from "./animations";
import { ButtonPressFunction } from "../lib/types";
import { ElementsDefinition } from "cytoscape";
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
  hideExploreLearn: Function;
  mapName: string;
  mapJson: ElementsDefinition;
  setGoal: Function;
  pageLoaded: boolean;
  userId: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [goalsSet, setGoalsSet] = useState({});
  const addGoalSet = (goalId) => setGoalsSet({ ...goalsSet, [goalId]: true });
  const removeGoalSet = (goalId) => {
    let goals = { ...goalsSet };
    delete goals[goalId];
    setGoalsSet(goals);
  };
  function setGoalsOnMap(goals, userID, sessionID) {
    Object.keys(goals).forEach((goalId) =>
      setGoal(window.cy.getElementById(goalId), userID, sessionID)
    );
  }
  const [learnClicked, setLearnClicked] = useState(null);
  const onLearnClick = (goals, isPageLoaded, userID, sessionID) => {
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
  const onExploreClick = (goals, isPageLoaded, userID, sessionID) => {
    /** If goals have been selected, set them! **/
    const goalsHaveBeenSet = Object.keys(goals).length !== 0;
    setLearnClicked(goalsHaveBeenSet);
    if (isPageLoaded && goalsHaveBeenSet)
      setGoalsOnMap(goals, userID, sessionID);
    hideExploreLearn();
  };

  return (
    // <!-- Extra Large Modal -->
    <div className="overflow-x-hidden overflow-y-auto fixed inset-0 z-40 justify-center items-center">
      <div className="flex justify-center relative w-full h-full md:h-auto">
        {/* Grey out the map in the background */}
        <button
          className="cursor-default bg-black opacity-30 w-screen h-screen absolute left-0 top-0"
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
        <div className="relative bg-white max-w-2xl min-w-full md:min-w-0 min-h-full md:min-h-0 rounded-none md:rounded-xl shadow relative md:mt-20 xl:mt-28 dark:bg-gray-700">
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
                className="absolute sm:relative left-0 top-0 m-1 sm:mt-4 md:mt-8 xl:mt-12 h-8 sm:h-10 md:h-14 xl:h-16 w-auto"
                src={"/images/learney_logo_256x256.png"}
                alt="Learney"
              />
              <h3 className="text-base md:text-3xl max-w-xxs sm:max-w-xl text-gray-700 mt-4 sm:mt-12 text-center">
                From the <b>{mapName}</b> map, I want to learn...
              </h3>
              {/* Search box wrapper to add red outline when  */}
              <div
                className={classNames(
                  learnClicked === false &&
                    Object.keys(goalsSet).length === 0 &&
                    "ring-2 ring-offset-2 ring-red-400 rounded-full",
                  "w-5/6 max-w-2xl z-10 mt-4 sm:mt-8"
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
                />
              </div>
              <p
                className={classNames(
                  learnClicked === false && Object.keys(goalsSet).length === 0
                    ? "visible"
                    : "invisible",
                  "text-red-500 text-lg font-bold mt-4"
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
          <div className="absolute bottom-0 z-50 bg-white flex w-full justify-between sm:justify-center place-content-center space-x-2 items-center p-2 sm:p-4 border-t border-gray-200 rounded-none md:rounded-b-xl dark:border-gray-600">
            {/* EXPLORE BUTTON */}
            <div className="relative sm:absolute sm:left-0 flex p-1 md:p-2 flex-row sm:flex-col text-gray-500">
              <div className="flex flex-row justify-center text-sm">
                <div className="pr-1 align-middle">Or</div>
                <p className="hidden md:flex pr-2">just</p>
              </div>
              <button
                className="btn-3 whitespace-pre-wrap sm:whitespace-normal btn-xs md:btn-md"
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
                  "ring-2 ring-offset-2 ring-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
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
  mapJson: object;
  goals: object;
  removeGoal: Function;
  classes?: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <span
      className={classNames(
        "relative block w-10/12 overflow-auto h-28 sm:h-40 max-w-xl mt-4 mb-28 mx-12 sm:mx-60 border-2 xl:border-4 border-gray-200 border-dashed rounded-xl p-2 md:p-6 text-center focus:outline-none",
        classes
      )}
    >
      {Object.keys(goals).length !== 0 ? (
        <div className="flex flex-row flex-wrap gap-y-0.5 sm:gap-y-1 gap-x-1">
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
          <AcademicCapIcon className="mx-auto h-12 w-auto md:h-16 text-gray-300" />
          <span className="mt-2 block text-sm lg:text-lg sm:font-medium text-gray-500">
            Set what you want to learn
          </span>
        </>
      )}
    </span>
  );
}

function GoalListItem({ goalInfo, removeGoal, buttonPressFunction }) {
  return (
    <span
      style={{ backgroundColor: goalInfo.colour }}
      className={`text-sm sm:text-lg text-gray-300 sm:font-semibold px-1.5 sm:pl-3.5 py-0.5 sm:py-1 rounded-lg flex align-middle`}
    >
      {goalInfo.name}
      <button
        onClick={buttonPressFunction(
          () => removeGoal(goalInfo.id),
          `Explore Learn Intro Page Remove Goal Selected: ${goalInfo.name}`
        )}
      >
        <XIcon className="ml-0.5 sm:ml-1 h-5 sm:h-6 w-5 sm:w-6 text-gray-400 hover:text-gray-500" />
      </button>
    </span>
  );
}

function getBadgeColour(parentId, mapJson) {
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

function goalInfoFromId(goalId, mapJson) {
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
