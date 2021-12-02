import React, { useEffect } from "react";
import {
  AddEdgesButton,
  AddNodeButton,
  CursorButton,
  DeleteElementButton,
  ResetPanButton,
  ResetProgressIconButton,
  saveMap,
} from "../buttons";
import { AreYouSureModal, getAreYouSureDescriptionText } from "../modal";
import {
  EditConceptDataSidebar,
  EditTopicDataSidebar,
} from "./editConceptDataSidebar";
import { updateMinZoom } from "../../lib/graph";

let eh; // Edge handles variable
const topicColours = [
  "#001d4d",
  "#006161",
  "#001975",
  "#001d4d",
  "#210042",
  "#610061",
];
const emptyNodeData = {
  id: "",
  name: "",
  lectures: "",
  description: "",
  urls: "",
  nodetype: "concept",
  relative_importance: 1,
  parent: "",
};

export default function Editor({
  buttonPressFunction,
  backendUrl,
  userId,
  mapUUID,
  pageLoaded,
}) {
  const [editType, setEditType] = React.useState(null);
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
    setShowEditData("concept");
    updateMinZoom();
  };
  const deleteModeClick = function (e) {
    if (e.target.data().id !== undefined) {
      if (e.target.isEdge()) {
        e.target.remove();
      } else if (e.target.isNode()) {
        setDeleteNodeData((prevState) => {
          return { ...prevState, ...e.target.data() };
        });
      }
    }
  };
  const removeElement = function (elementId) {
    const element = window.cy.nodes(`[id = "${elementId}"]`);
    const parentNode = element.parent();
    element.remove();
    if (parentNode.isChildless()) parentNode.remove();
    updateMinZoom();
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
          window.cy.on("tap", deleteModeClick);
          break;
        default:
          break;
      }
    }
  }, [editType]);

  useEffect(() => {
    if (pageLoaded) setEditType("cursor");
  }, [pageLoaded]);

  const [showEditData, setShowEditData] = React.useState(null);
  const [deleteNodeData, setDeleteNodeData] = React.useState({
    ...emptyNodeData,
  });
  const [editNodeData, setEditNodeData] = React.useState({ ...emptyNodeData });
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
    <>
      <div
        className={`flex flex-row items-end absolute bottom-0 left-0 m-4 disableTouchActions`}
      >
        <div className="block bg-white cursor-pointer rounded-lg m-1 z-20">
          <CursorButton editType={editType} setEditType={setEditType} />
          <AddNodeButton editType={editType} setEditType={setEditType} />
          <AddEdgesButton editType={editType} setEditType={setEditType} />
          <DeleteElementButton editType={editType} setEditType={setEditType} />
        </div>
      </div>
      <div
        className={
          "cursor-default pointer-events-none absolute bottom-5 text-center w-full text-lg text-white z-10"
        }
      >
        {editType === "cursor"
          ? "Click concepts or topics to edit and drag to move them"
          : editType === "addEdges"
          ? "Click and hold to add a dependency"
          : editType === "addNode"
          ? "Click to add a concept"
          : "Delete a concept, subject or dependency by clicking on it"}
      </div>
      {showEditData === "concept" ? (
        <EditConceptDataSidebar
          editNodeData={editNodeData}
          setEditNodeData={setEditNodeData}
          setShowEditData={setShowEditData}
          saveEditNodeData={saveEditNodeData}
          deletebuttonClickFunction={(nodeId) =>
            setDeleteNodeData((prevState) => {
              return {
                ...prevState,
                ...window.cy.nodes(`[id = "${nodeId}"]`).data(),
              };
            })
          }
          userId={userId}
        />
      ) : (
        showEditData === "topic" && (
          <EditTopicDataSidebar
            editParentNodeData={editParentNodeData}
            setEditParentNodeData={setEditParentNodeData}
            saveEditParentNodeData={saveEditParentNodeData}
            deletebuttonClickFunction={(nodeId) =>
              setDeleteNodeData((prevState) => {
                return {
                  ...prevState,
                  ...window.cy.nodes(`[id = "${nodeId}"]`).data(),
                };
              })
            }
            setShowEditData={setShowEditData}
          />
        )
      )}
      <AreYouSureModal
        modalShown={!!deleteNodeData.id}
        setModalClosed={() => setDeleteNodeData(() => emptyNodeData)}
        titleText={`Delete ${deleteNodeData.nodetype} ${deleteNodeData.name}?`}
        descriptionText={
          deleteNodeData.id ? getAreYouSureDescriptionText(deleteNodeData) : ""
        }
        actionButtonText={`Delete ${deleteNodeData.nodetype}`}
        actionButtonFunction={() => removeElement(deleteNodeData.id)}
      />
    </>
  );
}
