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
import { ButtonPressFunction } from "../../lib/types";
import { EditType, NodeData, ParentNodeData, ShowEditData } from "./types";
import {
  EdgeSingular,
  ElementDefinition,
  EventObject,
  NodeCollection,
  NodeSingular,
} from "cytoscape";
import { trackCyEvent } from "../../lib/utils";

declare global {
  interface Window {
    ur: any;
  }
}

let eh: any; // Edge handles variable
const topicColours = [
  "#001d4d",
  "#006161",
  "#001975",
  "#001d4d",
  "#210042",
  "#610061",
];
const emptyNodeData: NodeData = {
  id: "",
  name: "",
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
}: {
  buttonPressFunction: ButtonPressFunction;
  backendUrl: string;
  userId: string;
  mapUUID: string;
  pageLoaded: boolean;
  editType: string;
  setEditType: (editType: EditType) => void;
}) {
  const addNode = (e: EventObject): void => {
    trackCyEvent(e, "Editor Add Node", backendUrl, userId);
    // [1.0] Create the next node ID
    let nextNodeID = 0;
    window.cy
      .nodes('[nodetype = "concept"]') // Get concept nodes only
      .forEach((node) => {
        // Find the largest concept ID number
        if (Number(node.id()) > nextNodeID) nextNodeID = Number(node.id());
      });
    // The next node ID is the largest previous node ID number + 1
    nextNodeID += 1;
    const nodeClicked = e.target;

    // [2.0] Get parent node if one was clicked!
    let parentNodeId;
    let newParentNodeData;
    if ("nodetype" in nodeClicked.data()) {
      // Clicked on a node or parent node!
      if (nodeClicked.data().nodetype === "field") {
        parentNodeId = nodeClicked.id();
      } else {
        parentNodeId = nodeClicked.parent().id();
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
    const nodesToAdd = [newNode];
    if (newParentNodeData !== undefined) nodesToAdd.push(newParentNodeData);
    window.ur.do("addNode", nodesToAdd);
  };
  const deleteModeClick = function (e) {
    if (e.target !== window.cy) {
      if (e.target.id() !== undefined) {
        if (e.target.isEdge()) {
          window.ur.do("remove", e.target);
          trackCyEvent(e, "Editor Delete Edge", backendUrl, userId);
        } else if (e.target.isNode()) {
          setDeleteNodeData((prevState) => {
            return { ...prevState, ...e.target.data() };
          });
          trackCyEvent(e, "Editor Delete Node", backendUrl, userId);
        }
      }
    }
  };
  const removeElement = function (elementId: string): void {
    const element = window.cy.getElementById(elementId);
    const parentNode = element.parent();
    const actions: Array<{ name: "remove"; param: NodeCollection }> = [
      { name: "remove", param: element },
    ];
    // if this is the last child node, delete the parent
    if (parentNode.children().size() === 1)
      actions.push({ name: "remove", param: parentNode });
    window.ur.do("batch", actions);
    updateMinZoom();
  };
  const handleEditNodeData = (e: EventObject) => {
    setEditNodeData(e.target.data());
    setShowEditData("concept");
    trackCyEvent(e, "Editor Select Node", backendUrl, userId);
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
            canConnect: (sourceNode, targetNode) => {
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

  const [showEditData, setShowEditData] = React.useState<ShowEditData>(null);

  const [deleteNodeData, setDeleteNodeData] = React.useState<NodeData>({
    ...emptyNodeData,
  });
  const [editNodeData, setEditNodeData] = React.useState<NodeData>({
    ...emptyNodeData,
  });
  const saveEditNodeData = function (userId: number): void {
    // [1.0] Copy Previous Data
    const newNodeData = { ...editNodeData };

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
            x: window.cy.getElementById(newNodeData.id).position().x,
            y: window.cy.getElementById(newNodeData.id).position().y,
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
  const [editParentNodeData, setEditParentNodeData] =
    React.useState<ParentNodeData>({
      colour: "",
      id: "",
      name: "",
      nodetype: "field",
    });

  const handleEditParentNodeData = function (e: EventObject): void {
    setEditParentNodeData(e.target.data());
    setShowEditData("topic");
    trackCyEvent(e, "Editor Select Topic", backendUrl, userId);
  };
  const saveEditParentNodeData = (newParentNodeData: ParentNodeData) => {
    const prevId = newParentNodeData.id;
    const newId = newParentNodeData.name;
    // Make new id match the name if it's not empty
    if (newId && newId !== prevId) {
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

  function addNodeClick(nodesToAdd: NodeCollection | Array<ElementDefinition>) {
    /** nodesToAdd is either an object or a cytoscape collection of elements (when redo-ing!) **/
    const added = window.cy.add(nodesToAdd);
    if (typeof nodesToAdd[0].data === "object") {
      // @ts-ignore
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
      // @ts-ignore
      const concept: NodeSingular = nodesToAdd.filter('[nodetype = "concept"]');
      setEditNodeData(concept.data());
      // @ts-ignore
      unhighlightNodes(nodesToAdd.filter('[nodetype = "concept"]'));
      // @ts-ignore
      resetTopicColour(nodesToAdd.filter('[nodetype = "field"]'));
    }
    updateMinZoom();
    setShowEditData("concept");
    return added;
  }
  function undoAddNodeClick(eles: NodeCollection) {
    const removed = eles.remove();
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
      window.cy.on("ehcomplete", (event, ...extraParams: any[]) => {
        const sourceNode: NodeSingular = extraParams[0];
        const targetNode: NodeSingular = extraParams[1];
        const addedEdge: EdgeSingular = extraParams[2][0];
        trackCyEvent(event, "Editor Add Dependency", backendUrl, userId, {
          "Source Node": sourceNode.data().name || sourceNode.id(), // ids as alternatives in case name empty
          "Target Node": targetNode.data().name || targetNode.id(),
          "Edge ID": addedEdge.id(),
        });
        window.cy.remove(addedEdge); // remove auto-added edge
        // Add undo-able edge
        window.ur.do("add", {
          group: "edges",
          data: {
            id: addedEdge.id(),
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
        className={`disableTouchActions absolute bottom-0 left-0 m-4 flex flex-row items-end`}
      >
        <div className="z-20 m-1 block cursor-pointer rounded-lg bg-white">
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
          "pointer-events-none absolute bottom-5 z-10 w-full cursor-default text-center text-lg text-white"
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
                ...window.cy.getElementById(nodeId).data(),
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
                  ...window.cy.getElementById(nodeId).data(),
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
        actionButtonFunction={buttonPressFunction(
          () => removeElement(deleteNodeData.id),
          "Confirm Delete Node"
        )}
      />
    </>
  );
}
