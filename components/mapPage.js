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
import { panByAndZoom } from "../lib/graph";

let eh = null;

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
    // TODO: This is an awful way to find the nextNodeID. Ask Henry
    let nextNodeID = -Infinity;
    window.cy // Get the map
      .json() // Get map data in JSON
      .elements.nodes // Get nodes only
      .forEach((node) => {
        // Filter out nodes that are topic labels, then find the largest node ID number
        if (Number(node.data.id) && Number(node.data.id) > nextNodeID) {
          nextNodeID = Number(node.data.id);
        }
      });
    // The next node ID is the largest previous node ID number + 1
    nextNodeID += 1;

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

    window.cy.add([newParentNode, newNode]);

    setEditNodeData(newNode.data);
    setEditType("cursor");
    setShowEditNodeData(true);
  };
  const removeElement = function (e) {
    if (e.target.data().id !== undefined) e.target.remove();
  };
  const handleEditNodeData = function (e) {
    setEditNodeData(e.target.data());
    setShowEditNodeData(true);
  };

  useEffect(() => {
    if (window.cy.edgehandles) {
      window.cy.removeListener("tap");
      if (eh !== null) eh.disableDrawMode();

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

  const [showEditNodeData, setShowEditNodeData] = React.useState(false);
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

    // [2.0] Convery url string to array
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
            id: `${newNodeData.parent}`.replace(/ /g, "_"),
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
        .move({ parent: newNodeData.parent });
    }

    // [4.0] Update node data
    window.cy.getElementById(newNodeData.id).data(newNodeData);

    // [5.0] Save the results
    // saveMap(backendUrl, mapUUID);
    setShowEditNodeData(false);
  };

  const [showEditParentNodeData, setShowEditParentNodeData] =
    React.useState(false);
  const [editParentNodeData, setEditParentNodeData] = React.useState({
    colour: "",
    id: "",
    name: "",
    nodetype: "",
  });
  const handleEditParentNodeData = function (e) {
    setEditParentNodeData(e.target.data());
    setShowEditParentNodeData(true);
  };
  const saveEditParentNodeData = function () {
    const newParentNodeData = { ...editParentNodeData };
    window.cy.getElementById(newParentNodeData.id).data(newParentNodeData);
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
        <div className={`${buttonStyles.editTools}`}>
          <CursorButton editType={editType} setEditType={setEditType} />
          <AddNodeButton editType={editType} setEditType={setEditType} />
          <AddEdgesButton editType={editType} setEditType={setEditType} />
          <DeleteElementButton editType={editType} setEditType={setEditType} />
        </div>
      )}
      {showEditNodeData && (
        <div className={`${buttonStyles.editNodeData}`}>
          <div>Concept Name</div>
          <input
            type="text"
            value={editNodeData.name}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, name: e.target.value })
            }
          />
          <div>Description</div>
          <textarea
            value={editNodeData.description}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, description: e.target.value })
            }
          />
          <div>Topic Group</div>
          <input
            type="text"
            value={editNodeData.parent}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, parent: e.target.value })
            }
          />
          <div>URLs (separated by a comma)</div>
          <input
            type="text"
            value={editNodeData.urls}
            onChange={(e) =>
              setEditNodeData({ ...editNodeData, urls: e.target.value })
            }
          />
          <div>Relative Size</div>
          <input
            type="number"
            value={editNodeData.relative_importance}
            onChange={(e) =>
              setEditNodeData({
                ...editNodeData,
                relative_importance: e.target.value,
              })
            }
          />
          <span onClick={() => saveEditNodeData()}>Save</span>
          <span onClick={() => setShowEditNodeData(false)}>Cancel</span>
          <span
            onClick={() => {
              window.cy.getElementById(editNodeData.id).remove();
              setShowEditNodeData(false);
            }}
          >
            Delete
          </span>
        </div>
      )}
      {showEditParentNodeData && (
        <div className={`${buttonStyles.editNodeData}`}>
          <div>Topic Group</div>
          <input
            type="text"
            value={editParentNodeData.name}
            onChange={(e) =>
              setEditParentNodeData({
                ...editParentNodeData,
                name: e.target.value,
              })
            }
          />
          <div>Colour</div>
          <input
            type="text"
            value={editParentNodeData.colour}
            onChange={(e) =>
              setEditParentNodeData({
                ...editParentNodeData,
                colour: e.target.value,
              })
            }
          />
          <span onClick={() => saveEditParentNodeData()}>Save</span>
          <span onClick={() => setShowEditParentNodeData(false)}>Cancel</span>
          <span
            onClick={() => {
              window.cy.getElementById(editParentNodeData.id).remove();
              setShowEditParentNodeData(false);
            }}
          >
            Delete
          </span>
        </div>
      )}
    </div>
  );
}
