import ReactGA from "react-ga";
import buttonStyles from "../styles/buttons.module.css";
import mainStyles from "../styles/main.module.css";
import {
  AddEdgesButton,
  AddNodeButton,
  CursorButton,
  DeleteElementButton,
  FeedBackButton,
  MakeSuggestionIconButton,
  ResetLayoutButton,
  ResetPanButton,
  ResetProgressButton,
  RunDagreButton,
  saveMap,
  SaveMapButton,
  SlackButton,
} from "./buttons";
import React, { useEffect } from "react";
import {
  setupTracking,
  initialiseMixpanelTracking,
} from "../lib/trackingScripts";
import { useUser } from "@auth0/nextjs-auth0";
import {
  getButtonPressFunction,
  isAnonymousUser,
  logPageView,
} from "../lib/utils";
import IntroButton from "../components/intro";
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
import Navbar from "./navbar";
import { classNames } from "../lib/reactUtils";
// import SearchBar, {getSearchOptions} from "./search";

let eh; // Edge handles variable
const topicColours = [
  "#001d4d",
  "#006161",
  "#001975",
  "#001d4d",
  "#210042",
  "#610061",
];

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
  if (backendUrl === "https://api.learney.me") {
    ReactGA.initialize("UA-197170313-2");
  } else {
    ReactGA.initialize("UA-197170313-1", { debug: true });
  }

  const { user, isLoading } = useUser();
  const [userId, setUserId] = React.useState(undefined);
  const [userEmail, setUserEmail] = React.useState("");
  const [sessionId, setSessionId] = React.useState(null);

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
        ReactGA.pageview(window.location.pathname);
        initialiseMixpanelTracking(newUserId);

        if (isAnonymousUser(newUserId)) initialiseSignInTooltip();
      }
    })();
  }, [isLoading]);

  const [editType, setEditType] = React.useState("cursor");
  const addNode = function (e) {
    // [1.0] Create the next node ID
    let nextNodeID = 0;
    window.cy
      .nodes('[nodetype = "concept"]') // Get concept nodes only
      .forEach((node) => {
        // Find the largest concept ID number
        if (Number(node.data().id) > nextNodeID)
          nextNodeID = Number(node.data().id);
      });
    // The next node ID is the largest previous node ID number + 1
    nextNodeID += 1;
    let nodeClicked = e.target;

    // [2.0] Get parent node if one was clicked!
    let parentNodeId;
    let newParentNodeData;
    if ("nodetype" in nodeClicked.data()) {
      // Clicked on a node or parent node!
      if (nodeClicked.data().nodetype === "field") {
        parentNodeId = nodeClicked.data().id;
      } else {
        parentNodeId = nodeClicked.parent().data().id;
      }
    } else {
      // Clicked in empty space - create new parent node!
      parentNodeId = `${nextNodeID}_topic_group`;
      newParentNodeData = {
        group: "nodes",
        data: {
          colour: topicColours[Math.floor(Math.random() * topicColours.length)],
          id: parentNodeId,
          name: "",
          nodetype: "field",
        },
        renderedPosition: {
          x: e.renderedPosition.x,
          y: e.renderedPosition.y,
        },
      };
    }

    // [2.1] Create new node
    const newNode = {
      data: {
        id: `${nextNodeID}`,
        name: "",
        lectures: "",
        description: "",
        urls: [],
        nodetype: "concept",
        relative_importance: 1,
        parent: parentNodeId,
      },
      renderedPosition: {
        x: e.renderedPosition.x,
        y: e.renderedPosition.y,
      },
    };

    // [3.0] Add the new nodes
    if (newParentNodeData !== undefined)
      window.cy.add([newParentNodeData, newNode]);
    else window.cy.add([newNode]);

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
  const saveEditNodeData = function (userId) {
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
            colour:
              topicColours[Math.floor(Math.random() * topicColours.length)],
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
    saveMap(userId, backendUrl, mapUUID);
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
      {!isLoading && (
        <Navbar
          user={user}
          leftSideButtons={[
            <IntroButton
              openAtStart={user === undefined}
              buttonPressFunction={buttonPressFunction}
            />,
            <MakeSuggestionIconButton
              buttonPressFunction={buttonPressFunction}
              userEmail={user !== undefined ? user.email : ""}
            />,
          ]}
          rightSideButtons={[
            <FeedBackButton buttonPressFunction={buttonPressFunction} />,
            <SlackButton buttonPressFunction={buttonPressFunction} />,
          ]}
          buttonPressFunction={buttonPressFunction}
        />
      )}

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

      <div
        className={`absolute top-0 flex mt-1 justify-end disableTouchActions`}
      >
        <div className={buttonStyles.buttonToolbarDiv}>
          {editMap && (
            <SaveMapButton
              buttonPressFunction={buttonPressFunction}
              backendUrl={backendUrl}
              mapUUID={mapUUID}
            />
          )}
          {editMap && (
            <ResetLayoutButton
              buttonPressFunction={buttonPressFunction}
              userId={userId}
            />
          )}
          {editMap && (
            <RunDagreButton buttonPressFunction={buttonPressFunction} />
          )}
          {editMap && (
            <ResetProgressButton
              buttonPressFunction={buttonPressFunction}
              backendUrl={backendUrl}
              userId={userId}
              mapUUID={mapUUID}
              sessionId={sessionId}
              setGoalsState={setNewGoalsState}
              setLearnedState={setNewLearnedState}
            />
          )}
        </div>
      </div>

      <div
        className={classNames(
          `flex flex-row items-end absolute bottom-0 left-0 m-4 disableTouchActions`
        )}
      >
        {editMap && (
          <div
            className={`block bg-white cursor-pointer rounded m-1 ${buttonStyles.editTools} z-20`}
          >
            <CursorButton editType={editType} setEditType={setEditType} />
            <AddNodeButton editType={editType} setEditType={setEditType} />
            <AddEdgesButton editType={editType} setEditType={setEditType} />
            <DeleteElementButton
              editType={editType}
              setEditType={setEditType}
            />
          </div>
        )}
        <div className="block">
          <ResetPanButton buttonPressFunction={buttonPressFunction} />
        </div>
      </div>

      {editMap && ["addNode", "addEdges", "delete"].includes(editType) && (
        <div
          className={
            "cursor-default pointer-events-none absolute bottom-5 text-center w-full text-lg text-white z-10"
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
            onClick={() => saveEditNodeData(userId)}
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
