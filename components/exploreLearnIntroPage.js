import React, { useEffect, useState } from "react";
import { classNames } from "../lib/reactUtils";
import { ConceptSearchBox } from "./ConceptSearchBox";
import { AcademicCapIcon, XIcon } from "@heroicons/react/outline";
import { getBadgeColour } from "../lib/goalBadges";
import { LoadingSpinner } from "./animations";

export default function ExploreLearnIntroPage({
  hideExploreLearn,
  newUser,
  mapName,
  mapJson,
  setGoal,
  pageLoaded,
  userId,
  sessionId,
  buttonPressFunction,
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
        <div className="bg-black opacity-40 w-screen h-screen absolute left-0 top-0" />
        {/* Modal content */}
        <div className="bg-white max-w-2xl shadow h-screen relative dark:bg-gray-700">
          {/* Modal footer */}
          <div className="flex flex-col">
            <div className="flex flex-col items-center">
              <img
                className="mt-4 md:mt-8 lg:mt-10 xl:mt-14 h-14 md:h-20 xl:h-28 w-auto"
                src={"/images/learney_logo_256x256.png"}
                alt="Learney"
              />
              <p
                className={classNames(
                  "text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-500 mt-10 md:mt-24",
                  newUser && "invisible"
                )}
              >
                We noticed you hadn&apos;t set a goal.
              </p>
              <h3 className="text-2xl lg:text-3xl text-gray-700 mt-6 md:mt-12 mb-8 text-center">
                From <b>{mapName}</b>, I want to learn...
              </h3>
              {/* Search box wrapper to add red outline when  */}
              <div
                className={classNames(
                  learnClicked === false &&
                    Object.keys(goalsSet).length === 0 &&
                    "ring-2 ring-offset-2 ring-red-400 rounded-full",
                  "w-5/6 max-w-2xl z-10"
                )}
              >
                <ConceptSearchBox
                  mapJson={mapJson}
                  onSelect={(item) => addGoalSet(item.id)}
                  classes="animate-none z-10"
                  searchStyling={
                    learnClicked === false && Object.keys(goalsSet).length === 0
                      ? {
                          backgroundColor: "#fef2f2",
                          border: "1px solid #4b5563",
                        }
                      : { border: "1px solid #4b5563" }
                  }
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
              />
            </div>
          </div>
        </div>
        {/* FOOTER BAR */}
        <div className="fixed bottom-0 z-50 bg-white w-full flex justify-between md:place-content-center space-x-2 items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
          {/* EXPLORE BUTTON */}
          <div className="flex flex-col align-middle md:flex-row text-gray-500 md:absolute md:left-0 md:ml-4">
            <div className="flex flex-col text-center justify-center text-base align-middle md:text-lg pr-2">
              Or just
            </div>
            <button
              className="btn-3 btn-sm md:btn-lg"
              onClick={
                !learnClicked
                  ? buttonPressFunction(
                      () =>
                        onExploreClick(goalsSet, pageLoaded, userId, sessionId),
                      "Intro Page Explore"
                    )
                  : buttonPressFunction(() => {},
                    "Intro Page Explore (Deactivated)")
              }
            >
              {learnClicked ? (
                <LoadingSpinner classes="w-6 h-6 my-0.5 mx-5" />
              ) : (
                "Explore"
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
                    () => onLearnClick(goalsSet, pageLoaded, userId, sessionId),
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
  );
}

function GoalsList({ mapJson, goals, removeGoal, classes }) {
  return (
    <span
      className={classNames(
        "relative block w-10/12 overflow-auto max-h-80 max-w-xl mt-8 md:mt-12 mx-12 sm:mx-60 border-2 xl:border-4 border-gray-200 border-dashed rounded-xl p-2 md:p-6 text-center focus:outline-none",
        classes
      )}
    >
      {Object.keys(goals).length !== 0 ? (
        <div className="flex flex-row flex-wrap gap-y-0.5 sm:gap-y-1 gap-x-1">
          {Object.keys(goals).map((goalId) => (
            <GoalListItem
              goalInfo={goalInfoFromId(goalId, mapJson)}
              removeGoal={removeGoal}
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

function GoalListItem({ goalInfo, removeGoal }) {
  return (
    <span
      style={{ backgroundColor: goalInfo.colour }}
      className={`text-sm sm:text-lg text-gray-300 sm:font-semibold px-1.5 sm:pl-3.5 py-0.5 sm:py-1 rounded-lg flex align-middle`}
    >
      {goalInfo.name}
      <button onClick={() => removeGoal(goalInfo.id)}>
        <XIcon className="ml-0.5 sm:ml-1 h-5 sm:h-6 w-5 sm:w-6 text-gray-400 hover:text-gray-500" />
      </button>
    </span>
  );
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
