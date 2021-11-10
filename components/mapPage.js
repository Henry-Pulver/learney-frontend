import Profile from "./profile";
import buttonStyles from "../styles/buttons.module.css";
import mainStyles from "../styles/main.module.css";
import {
  AddEdgesButton,
  AddNodeButton,
  CursorButton,
  DeleteElementButton,
  FeedBackButton,
  MakeSuggestionButton,
  ResetLayoutButton,
  ResetPanButton,
  ResetProgressButton,
  RunDagreButton,
  saveMap,
  SaveMapButton,
  SlackButton,
} from "./buttons";
import React, { useEffect } from "react";
import { setupTracking } from "../lib/trackingScripts";
import { useUser } from "@auth0/nextjs-auth0";
import {
  getButtonPressFunction,
  isAnonymousUser,
  logPageView,
} from "../lib/utils";
import IntroButtonInclTooltip from "../components/intro";
import { isMobile } from "../lib/graph";
import MapHeader from "./mapHeader";
import Map from "./map";
import {
  goalNodes,
  learnedNodes,
  learnedSliderClick,
  setGoalClick,
  initialiseSignInTooltip,
} from "../lib/learningAndPlanning";
// import SearchBar, {getSearchOptions} from "./search";

let eh; // Edge handles variable

export default function MapPage({
  backendUrl,
  mapUrlExtension,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
}) {
  // SEARCH OPTIONS
  // const [searchOptions, setSearchOptions] = React.useState([]);
  // const updateSearchOptions = (elements) => setSearchOptions(getSearchOptions(elements));

  const { user, isLoading } = useUser();
  const [userId, setUserId] = React.useState(undefined);
  const [userEmail, setUserEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState(null);

  const [introShown, setIntroShown] = React.useState(false);
  const showIntroTooltip = () => {
    setIntroShown(true);
  };
  const hideIntroTooltip = () => {
    setIntroShown(false);
  };

  const [goals, setNewGoalsState] = React.useState({});
  const setGoalsState = function (goalState) {
    for (const [nodeId, _] of Object.entries(goals)) {
      if (!(nodeId in goalState)) {
        setNewGoalsState((prevGoals) => ({
          ...prevGoals,
          [nodeId]: undefined,
        }));
      }
    }
    for (const [nodeId, isGoal] of Object.entries(goalState)) {
      setNewGoalsState((prevGoals) => ({ ...prevGoals, [nodeId]: isGoal }));
    }
  };
  const onSetGoalClick = function (node, userId, sessionId) {
    setGoalClick(node, backendUrl, userId, mapUUID, sessionId);
    setGoalsState(goalNodes);
  };

  const [learned, setNewLearnedState] = React.useState({});
  const setLearnedState = function (learnedState) {
    for (const [nodeId, _] of Object.entries(learned)) {
      if (!(nodeId in learnedState)) {
        setNewLearnedState((prevLearned) => ({
          ...prevLearned,
          [nodeId]: undefined,
        }));
      }
    }
    for (const [nodeId, isLearned] of Object.entries(learnedState)) {
      setNewLearnedState((prevLearned) => ({
        ...prevLearned,
        [nodeId]: isLearned,
      }));
    }
  };
  const onLearnedClick = function (node, userId, sessionId) {
    learnedSliderClick(node, backendUrl, userId, mapUUID, sessionId);
    setLearnedState(learnedNodes);
  };

  const buttonPressFunction = getButtonPressFunction(
    backendUrl,
    userId,
    sessionId
  );

  useEffect(() => {
    (async function () {
      if (!isLoading) {
        let responseJson = await logPageView(user, backendUrl, mapUrlExtension);
        setSessionId(responseJson.session_id);

        let newUserId;
        if (user !== undefined) {
          newUserId = user.sub;
          setUserEmail(user.email);
        } else {
          newUserId = responseJson.user_id;
        }
        setUserId(newUserId);

        setupTracking();

        if (isAnonymousUser(newUserId) && !isMobile()) showIntroTooltip();
        if (isAnonymousUser(newUserId)) initialiseSignInTooltip();
      }
    })();
  }, [isLoading]);

  const [editType, setEditType] = React.useState("cursor");
  const addNode = function (e) {
    // [1.0] Create the next node ID
    let nextNodeID = -Infinity;
    window.cy
      .nodes('[nodetype = "concept"]') // Get concept nodes only
      .forEach((node) => {
        // Find the largest concept ID number
        if (Number(node.data().id) > nextNodeID)
          nextNodeID = Number(node.data().id);
      });
    // The next node ID is the largest previous node ID number + 1
    nextNodeID += 1;

    // [2.0] Create the new nodes
    const newParentNode = {
      group: "nodes",
      data: {
        colour: "#610061",
        id: `${nextNodeID}_topic_group`,
        name: "",
        nodetype: "field",
      },
      renderedPosition: {
        x: e.renderedPosition.x,
        y: e.renderedPosition.y,
      },
    };

    const newNode = {
      data: {
        id: `${nextNodeID}`,
        name: "",
        lectures: "",
        description: "",
        urls: [],
        nodetype: "concept",
        relative_importance: 1,
        parent: `${nextNodeID}_topic_group`,
      },
      renderedPosition: {
        x: e.renderedPosition.x,
        y: e.renderedPosition.y,
      },
    };

    // [3.0] Add the new nodes
    window.cy.add([newParentNode, newNode]);

    // [4.0] Update UI
    setEditNodeData(newNode.data);
    setEditType("cursor");
    setShowEditData("concept");
  };
  const removeElement = function (e) {
    if (e.target.data().id !== undefined) {
      e.target.remove();
      window.cy.nodes('[nodetype = "field"]').forEach((node) => {
        if (node.isChildless()) node.remove();
      });
    }
  };
  const handleEditNodeData = function (e) {
    setEditNodeData(e.target.data());
    setShowEditData("concept");
  };

  useEffect(() => {
    // [1.0] Ensure cytoscape map is initialized
    if (window.cy.edgehandles) {
      // [2.0] Remove old event listeners
      window.cy.removeListener("tap");
      if (eh !== undefined) eh.disableDrawMode();

      // [3.0] Add new event listeners
      switch (editType) {
        case "addNode":
          window.cy.on("tap", addNode);
          break;
        case "addEdges":
          eh = window.cy.edgehandles({
            canConnect: function (sourceNode, targetNode) {
              // whether an edge can be created between source and target
              return (
                !sourceNode.same(targetNode) && // No loops
                !sourceNode.isParent() && // No links from parent nodes
                !targetNode.isParent() // No links to parent nodes
              );
            },
            noEdgeEventsInDraw: false,
            snap: false,
          });

          eh.enableDrawMode();
          break;
        case "cursor":
          window.cy.on("tap", 'node[nodetype = "concept"]', handleEditNodeData);
          window.cy.on(
            "tap",
            'node[nodetype = "field"]',
            handleEditParentNodeData
          );
          break;
        case "delete":
          window.cy.on("tap", removeElement);
          break;
        default:
          break;
      }
    }
  }, [editType]);

  const [showEditData, setShowEditData] = React.useState(null);
  const [editNodeData, setEditNodeData] = React.useState({
    id: Infinity,
    name: "",
    lectures: "",
    description: "",
    urls: "",
    nodetype: "concept",
    relative_importance: 1,
    parent: "",
  });
  const saveEditNodeData = function () {
    // [1.0] Copy Previous Data
    let newNodeData = { ...editNodeData };

    // [2.0] Convert url string to array
    if (typeof newNodeData.urls === "string")
      newNodeData.urls = newNodeData.urls.split(",");

    // [3.0] If parent was changed, move node to new parent
    const oldParent = window.cy.getElementById(newNodeData.id).data("parent");
    if (oldParent !== newNodeData.parent) {
      // [3.1] If the new parent doesn't exist, create new parent node
      if (
        window.cy.getElementById(newNodeData.parent.replace(/ /g, "_")) !==
        undefined
      ) {
        const newParentNode = {
          group: "nodes",
          data: {
            colour: "#610061",
            id: newNodeData.parent.replace(/ /g, "_"),
            name: newNodeData.parent,
            nodetype: "field",
          },
          renderedPosition: {
            x: window.cy.getElementById(newNodeData.id).x,
            y: window.cy.getElementById(newNodeData.id).y,
          },
        };

        window.cy.add([newParentNode]);
      }

      // [3.2] Move node to new parent
      window.cy
        .getElementById(newNodeData.id)
        .move({ parent: newNodeData.parent.replace(/ /g, "_") });

      // [3.3] Remove empty parent nodes
      window.cy.nodes('[nodetype = "field"]').forEach((node) => {
        if (node.isChildless()) node.remove();
      });
    }

    // [4.0] Update node data
    window.cy.getElementById(newNodeData.id).data(newNodeData);

    // [5.0] Save the results
    saveMap(backendUrl, mapUUID);
    setShowEditData(null);
  };

  const [editParentNodeData, setEditParentNodeData] = React.useState({
    colour: "",
    id: "",
    name: "",
    nodetype: "",
  });
  const handleEditParentNodeData = function (e) {
    setEditParentNodeData(e.target.data());
    setShowEditData("topic");
  };
  const saveEditParentNodeData = function () {
    const newParentNodeData = { ...editParentNodeData };
    window.cy.getElementById(newParentNodeData.id).data(newParentNodeData);
    setShowEditData(null);
  };

  return (
    <div>
      <MapHeader />

      <Map
        backendUrl={backendUrl}
        userId={userId}
        userEmail={userEmail}
        allowSuggestions={allowSuggestions}
        editMap={editMap}
        mapJson={mapJson}
        mapUUID={mapUUID}
        sessionId={sessionId}
        buttonPressFunction={buttonPressFunction}
        learned={learned}
        onLearnedClick={onLearnedClick}
        setLearnedState={setLearnedState}
        goals={goals}
        onSetGoalClick={onSetGoalClick}
        setGoalsState={setGoalsState}
        handleEditNodeData={handleEditNodeData}
        handleEditParentNodeData={handleEditParentNodeData}
      />

      <Profile buttonPressFunction={buttonPressFunction} userdata={user} />
      <div
        className={`${buttonStyles.topButtonToolbar} ${mainStyles.disableTouchActions}`}
      >
        <div className={buttonStyles.introButtonContainer}>
          {!editMap && (
            <IntroButtonInclTooltip
              introShown={introShown}
              hideIntroTooltip={hideIntroTooltip}
              showIntroTooltip={showIntroTooltip}
              buttonPressFunction={buttonPressFunction}
            />
          )}
          <MakeSuggestionButton
            allowSuggestions={allowSuggestions}
            buttonPressFunction={buttonPressFunction}
            userEmail={userEmail}
            buttonName="make-suggestion"
            text="Make Suggestion"
          />
        </div>
        <label id="concept-search-bar-label">
          {/*<SearchBar searchOptions={ searchOptions }/>*/}
          <select
            id={"concept-search-bar"}
            className="pt-0"
            name="concept"
            style={{ width: "100%" }}
            tabIndex="0"
          />
        </label>
        <div className={buttonStyles.buttonToolbarDiv}>
          <SaveMapButton
            editMapEnabled={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            mapUUID={mapUUID}
          />
          <ResetLayoutButton
            buttonPressFunction={buttonPressFunction}
            userId={userId}
            editMap={editMap}
          />
          <RunDagreButton
            buttonPressFunction={buttonPressFunction}
            editMapEnabled={editMap}
          />
          <ResetProgressButton
            editMap={editMap}
            buttonPressFunction={buttonPressFunction}
            backendUrl={backendUrl}
            userId={userId}
            mapUUID={mapUUID}
            sessionId={sessionId}
            setGoalsState={setNewGoalsState}
            setLearnedState={setNewLearnedState}
          />
          <ResetPanButton buttonPressFunction={buttonPressFunction} />
        </div>
      </div>

      <div
        className={`${buttonStyles.feedbackButtons} ${mainStyles.disableTouchActions}`}
      >
        <FeedBackButton buttonPressFunction={buttonPressFunction} />
        {!editMap && <SlackButton buttonPressFunction={buttonPressFunction} />}
      </div>

      {editMap && (
        <div
          className={`bg-white cursor-pointer ${buttonStyles.editTools} z-20`}
        >
          <CursorButton editType={editType} setEditType={setEditType} />
          <AddNodeButton editType={editType} setEditType={setEditType} />
          <AddEdgesButton editType={editType} setEditType={setEditType} />
          <DeleteElementButton editType={editType} setEditType={setEditType} />
        </div>
      )}
      {editMap && ["addNode", "addEdges", "delete"].includes(editType) && (
        <div
          className={
            "cursor-default absolute bottom-5 text-center w-full text-white z-10"
          }
        >
          {editType === "addEdges"
            ? "Click and hold to add a dependency"
            : editType === "addNode"
            ? "Click to add a concept"
            : "Delete a concept, subject or dependency by clicking on it"}
        </div>
      )}
      {showEditData === "concept" && (
        <div className={`${buttonStyles.editNodeData}`}>
          <div>Concept Name</div>
          <input
            className="text-black text-xl"
            type="text"
            value={editNodeData.name}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, name: e.target.value })
            }
          />
          <div>Description</div>
          <textarea
            className="text-black"
            value={editNodeData.description}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, description: e.target.value })
            }
          />
          <div>Topic Group</div>
          <input
            className="text-black"
            type="text"
            value={editNodeData.parent}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, parent: e.target.value })
            }
          />
          <div>URLs (separated by a comma)</div>
          <input
            className="text-black"
            type="text"
            value={editNodeData.urls}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, urls: e.target.value })
            }
          />
          <div>Relative Size</div>
          <input
            className="text-black"
            type="number"
            value={editNodeData.relative_importance}
            onChange={(e) =>
              setEditNodeData({
                ...editNodeData,
                relative_importance: e.target.value,
              })
            }
          />
          <span
            className="text-white bg-blue-600 hover:bg-blue-500"
            onClick={() => saveEditNodeData()}
          >
            Save
          </span>
          <span
            className="text-white bg-blue-600 hover:bg-blue-500"
            onClick={() => setShowEditData(null)}
          >
            Cancel
          </span>
          <span
            className="text-white bg-red-600 hover:bg-red-500 border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
            onClick={() => {
              window.cy.getElementById(editNodeData.id).remove();
              setShowEditData(null);
            }}
          >
            Delete
          </span>
        </div>
      )}
      {showEditData === "topic" && (
        <div className={`${buttonStyles.editNodeData}`}>
          <div className="font-bold">Topic Name</div>
          <input
            className="text-black text-xl"
            type="text"
            value={editParentNodeData.name}
            onChange={(e) =>
              setEditParentNodeData({
                ...editParentNodeData,
                name: e.target.value,
              })
            }
          />
          {/*<div>Colour</div>*/}
          {/*<input*/}
          {/*  type="text"*/}
          {/*  value={editParentNodeData.colour}*/}
          {/*  onChange={(e) =>*/}
          {/*    setEditParentNodeData({*/}
          {/*      ...editParentNodeData,*/}
          {/*      colour: e.target.value,*/}
          {/*    })*/}
          {/*  }*/}
          {/*/>*/}
          <span
            className="text-white bg-blue-600 hover:bg-blue-500 border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
            onClick={() => saveEditParentNodeData()}
          >
            Save
          </span>
          <span
            className="text-white bg-blue-600 hover:bg-blue-500 border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
            onClick={() => setShowEditData(null)}
          >
            Cancel
          </span>
          <span
            className="text-white bg-red-600 hover:bg-red-500 border border-transparent text-sm font-medium rounded-lg inline-flex items-center px-4 py-2"
            onClick={() => {
              window.cy.getElementById(editParentNodeData.id).remove();
              setShowEditData(null);
            }}
          >
            Delete
          </span>
        </div>
      )}
    </div>
  );
}
