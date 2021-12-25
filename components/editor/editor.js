import React, { useEffect } from "react";
import {
  AddEdgesButton,
  AddNodeButton,
  CursorButton,
  DeleteElementButton,
  saveMap,
} from "./buttons";
import { AreYouSureModal, getAreYouSureDescriptionText } from "../modal";
import {
  EditConceptDataSidebar,
  EditTopicDataSidebar,
} from "./editConceptDataSidebar";
import {
  resetTopicColour,
  unhighlightNodes,
  updateMinZoom,
} from "../../lib/graph";
import { setupEditorHotkeys } from "../../lib/hotkeys";

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
  editType,
  setEditType,
}) {
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
    let nodesToAdd = [newNode];
    if (newParentNodeData !== undefined) nodesToAdd.push(newParentNodeData);
    window.ur.do("addNode", nodesToAdd);
  };
  const deleteModeClick = function (e) {
    if (e.target.data().id !== undefined) {
      if (e.target.isEdge()) {
        window.ur.do("remove", e.target);
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
    let actions = [{ name: "remove", param: element }];
    // if this is the last child node, delete the parent
    if (parentNode.children().size() === 1)
      actions.push({ name: "remove", param: parentNode });
    window.ur.do("batch", actions);
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
        case "cursor":
          window.cy.on("tap", 'node[nodetype = "concept"]', handleEditNodeData);
          window.cy.on(
            "tap",
            'node[nodetype = "field"]',
            handleEditParentNodeData
          );
          break;
        case "addNode":
          window.cy.on("tap", addNode);
          break;
        case "addEdges":
          eh = window.cy.edgehandles({
            canConnect: function (sourceNode, targetNode) {
              // whether an edge can be created between source and target
              return (
                !sourceNode.same(targetNode) && // No loops to itself
                !sourceNode.outgoers().contains(targetNode) && // No repeated edges
                !sourceNode.predecessors().contains(targetNode) && // No loops directions
                !sourceNode.isParent() && // No links from parent nodes
                !targetNode.isParent() // No links to parent nodes
              );
            },
            noEdgeEventsInDraw: false,
            snap: false,
          });

          eh.enableDrawMode();
          // TODO: Add on("tap", ... ) to allow tap-based edge adding
          break;
        case "delete":
          window.cy.on("tap", deleteModeClick);
          break;
        default:
          break;
      }
    }
  }, [editType]);

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
      if (window.cy.getElementById(newNodeData.parent) !== undefined) {
        const newParentNode = {
          group: "nodes",
          data: {
            colour:
              topicColours[Math.floor(Math.random() * topicColours.length)],
            id: newNodeData.parent,
            name: newNodeData.parent,
            nodetype: "field",
          },
          renderedPosition: {
            x: window.cy.getElementById(newNodeData.id).x,
            y: window.cy.getElementById(newNodeData.id).y,
          },
        };
        window.ur.do("add", [newParentNode]);
      }

      // [3.2] Move node to new parent
      window.cy
        .getElementById(newNodeData.id)
        .move({ parent: newNodeData.parent });

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
    nodetype: "field",
  });

  const handleEditParentNodeData = function (e) {
    setEditParentNodeData(e.target.data());
    setShowEditData("topic");
  };
  const saveEditParentNodeData = (newParentNodeData) => {
    const prevId = newParentNodeData.id;
    const newId = newParentNodeData.name;
    if (newId !== prevId) {
      newParentNodeData.id = newId;
      // TODO: Undo-ing this doesn't work - try changing the topic name and then
      //  undo-ing. Figure this out & then delete lines before 'else' below!
      // window.ur.do("batch", [
      //   { name: "add", param: { group: "nodes", data: newParentNodeData } },
      //   // {
      //   //   name: "move",
      //   //   param: {
      //   //     location: { parent: newId },
      //   //     eles: window.cy.filter(`[parent = "${prevId}"]`),
      //   //   },
      //   // },
      //   {
      //     name: "changeParent",
      //     param: {
      //       parentData: newParentNodeData,
      //       // parentData: { id: newId },
      //       nodes: window.cy.filter(`[parent = "${prevId}"]`),
      //     },
      //   },
      //   // { name: "remove", param: window.cy.getElementById(prevId) },
      // ]);
      window.cy.add([{ group: "nodes", data: newParentNodeData }]);
      window.cy.filter(`[parent = "${prevId}"]`).move({ parent: newId });
      window.cy.getElementById(prevId).remove();
    } else {
      window.cy.getElementById(prevId).data(newParentNodeData);
    }
    setEditParentNodeData(newParentNodeData);
    setShowEditData(null);
  };

  function addNodeClick(nodesToAdd) {
    /** nodesToAdd is either an object or a cytoscape collection of elements (when redo-ing!) **/
    const added = window.cy.add(nodesToAdd);
    if (typeof nodesToAdd[0].data === "object") {
      setEditNodeData(nodesToAdd[0].data);
      nodesToAdd.forEach((node) => {
        if (node.data.nodetype === "concept") {
          unhighlightNodes(window.cy.getElementById(node.data.id));
        } else {
          resetTopicColour(window.cy.getElementById(node.data.id));
        }
      });
      setEditType("cursor");
    } else {
      setEditNodeData(nodesToAdd.filter('[nodetype = "concept"]').data());
      unhighlightNodes(nodesToAdd.filter('[nodetype = "concept"]'));
      resetTopicColour(nodesToAdd.filter('[nodetype = "field"]'));
    }
    updateMinZoom();
    setShowEditData("concept");
    return added;
  }
  function undoAddNodeClick(eles) {
    let removed = eles.remove();
    setEditNodeData({ ...emptyNodeData });
    updateMinZoom();
    setShowEditData(null);
    return removed;
  }
  useEffect(() => {
    if (pageLoaded) {
      setEditType("cursor");
      setupEditorHotkeys(setEditType);
      window.ur.action("addNode", addNodeClick, undoAddNodeClick);
      window.cy.on("ehcomplete", (event, sourceNode, targetNode, addedEles) => {
        window.cy.remove(addedEles[0]); // remove auto-added edge
        // Add undo-able edge
        window.ur.do("add", {
          group: "edges",
          data: {
            id: addedEles[0].id(),
            source: sourceNode.id(),
            target: targetNode.id(),
          },
        });
      });
    }
  }, [pageLoaded]);
  return (
    <>
      <div
        className={`flex flex-row items-end absolute bottom-0 left-0 m-4 disableTouchActions`}
      >
        <div className="block bg-white cursor-pointer rounded-lg m-1 z-20">
          <CursorButton
            editType={editType}
            setEditType={setEditType}
            buttonPressFunction={buttonPressFunction}
          />
          <AddNodeButton
            editType={editType}
            setEditType={setEditType}
            buttonPressFunction={buttonPressFunction}
          />
          <AddEdgesButton
            editType={editType}
            setEditType={setEditType}
            buttonPressFunction={buttonPressFunction}
          />
          <DeleteElementButton
            editType={editType}
            setEditType={setEditType}
            buttonPressFunction={buttonPressFunction}
          />
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
          buttonPressFunction={buttonPressFunction}
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
            buttonPressFunction={buttonPressFunction}
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
        setModalClosed={() =>
          setDeleteNodeData(() => {
            return { ...emptyNodeData };
          })
        }
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
