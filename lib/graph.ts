import {
  goalNodes,
  pathNodes,
  learnedNodes,
} from "./learningAndPlanning/variables";
import cytoscape, {
  EdgeCollection,
  EdgeSingular,
  ElementsDefinition,
  NodeCollection,
  NodeSingular,
} from "cytoscape";
import popper from "cytoscape-popper";
import dagre from "cytoscape-dagre";
import edgehandles from "cytoscape-edgehandles";
import undoRedo from "cytoscape-undo-redo";
import {
  getOpacityEquivalentColour,
  parseQuery,
  setURLQuery,
  trackCyEvent,
  URLQuerySet,
} from "./utils";
import { ParsedUrlQuery } from "querystring";
import { NextRouter } from "next/router";

declare global {
  interface Window {
    cy: cytoscape.Core;
  }
}

export function isMobile(): boolean {
  return screen.width < 768;
}

let isAnimated = false;

export function setIsAnimated(animated: boolean): void {
  isAnimated = animated;
}

const fieldOpacity = 0.7;
const cyColours = {
  background: "#000000",
  nodeDark: "#475569",
  nodeMed: "#546379",
  nodeMedBright: "#7C8CA2",
  nodeBright: "#94a3b8",
  edgeDark: "#334155",
  edgeMed: "#3D4A5E",
  edgeMedBright: "#546379",
  edgeBright: "#64748b",
  edgeArrowDark: "#475569",
  edgeArrowMed: "#546379",
  edgeArrowMedBright: "#7C8CA2",
  edgeArrowBright: "#94a3b8",
  path: "#1D4ED8",
  pathArrow: "#93C5FD",
  goal: "#ff9e00",
  learned: "#059669",
  learnedArrow: "#34D399",
};
const nodeBaseSize = 48;

let selectedNodeID = "";

export function initCy(
  mapJson: ElementsDefinition,
  styleText: any,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  editMap: boolean
): void {
  /** Initialise Cytoscape graph.*/
  if (editMap) {
    cytoscape.use(edgehandles);
    cytoscape.use(dagre);
    cytoscape.use(undoRedo);
  } else cytoscape.use(popper);

  let wheelSensitivity: number;
  if (!isMobile()) wheelSensitivity = 0.25;
  else wheelSensitivity = 1;

  // Initialise cytoscape
  window.cy = cytoscape({
    elements: mapJson,
    container: document.getElementById("cy"),
    layout: { name: "preset" },
    style: styleText,
    maxZoom: 1.5,
    wheelSensitivity: wheelSensitivity,
  });

  if (isMobile()) {
    // Performance enhancements
    const concepts = window.cy.nodes('[nodetype = "concept"]');
    concepts.style("min-zoomed-font-size", "2.5em");
  }
  // set initial viewport state
  updateMinZoom(editMap);

  if (editMap) {
    window.ur = (window.cy as any).undoRedo();
  } else {
    (window.cy.elements() as any).panify();
  }

  resetTopicColour(window.cy.nodes().parents());
  unhighlightNodes(window.cy.nodes('[nodetype = "concept"]'));
}

export function fitCytoTo(fitParams, onComplete: () => void = () => {}): void {
  if (isMobile()) {
    window.cy.fit(fitParams.eles, fitParams.padding);
    onComplete();
  } else {
    window.cy.animate({
      fit: fitParams,
      duration: 400,
      easing: "ease-in-out",
      complete: onComplete,
    });
  }
}

export function handleIntroAnimation(
  query: ParsedUrlQuery,
  goals: object
): void {
  let animationParams = {};
  if (URLQuerySet(query)) {
    const parsedQuery = parseQuery(query);
    if (parsedQuery.topic) {
      animationParams = {
        fit: {
          eles: window.cy.getElementById(parsedQuery.topic),
          padding: 50,
        },
      };
    } else if (parsedQuery.concept) {
      let queryConcept = window.cy.getElementById(parsedQuery.concept);
      if (queryConcept.size() > 0) queryConcept.emit("tap");
    } else {
      animationParams = {
        pan: { x: Number(parsedQuery.x), y: Number(parsedQuery.y) },
        zoom: Number(parsedQuery.zoom),
      };
    }
  } else if (Object.keys(goals).length > 0) {
    animationParams = {
      fit: {
        eles: window.cy.nodes(".learned").or(".path"),
        padding: 50,
      },
    };
  } else {
    animationParams = {
      panBy: {
        x: -window.cy.width() / 6,
        y: (-window.cy.height() * 4) / 9,
      },
      zoom: 1.5 * window.cy.zoom(),
    };
  }
  if (animationParams) {
    animationParams = {
      ...animationParams,
      duration: 1200,
      easing: "ease-in-out",
    };
    handleAnimation(animationParams);
  }
}

function handleAnimation(
  animationParams,
  onComplete: () => void = () => {}
): void {
  if (isMobile()) {
    if (animationParams.pan !== undefined) {
      window.cy.pan(animationParams.pan);
    } else if (animationParams.panBy !== undefined) {
      const panBy = animationParams.panBy;
      window.cy.panBy({ x: panBy.x, y: panBy.y / 2 });
    }
    if (animationParams.relativeZoom !== undefined) {
      window.cy.zoom(window.cy.zoom() * animationParams.relativeZoom);
    } else if (animationParams.zoom !== undefined) {
      window.cy.zoom(animationParams.zoom);
    }
    if (animationParams.fit !== undefined) {
      window.cy.fit(animationParams.fit);
    }
    onComplete();
  } else {
    window.cy.animate({
      ...animationParams,
      complete: onComplete,
    });
  }
}

export function updateMinZoom(editMap = true) {
  const boundingBox = window.cy.elements().boundingBox({}); // bounding box of all elements
  let multFactor;
  if (editMap) multFactor = 1.8;
  else multFactor = 1;
  const relativeHeightDiff =
    (100 + multFactor * boundingBox.h) / window.cy.extent().h;
  const relativeWidthDiff =
    (100 + multFactor * boundingBox.w) / window.cy.extent().w;
  window.cy.minZoom(
    window.cy.zoom() / Math.max(relativeHeightDiff, relativeWidthDiff)
  );
}

function resizeNodes(nodes: NodeCollection, newSize: "big" | "small"): void {
  nodes.forEach((node) => {
    if (node.id() !== selectedNodeID) {
      let nodeSize;
      if (newSize === "big") {
        nodeSize = 1.5 * node.data().relative_importance * nodeBaseSize;
      } else {
        nodeSize = node.data().relative_importance * nodeBaseSize;
      }
      node.style("width", nodeSize.toString() + "px");
      node.style("height", nodeSize.toString() + "px");
      const fontSize = 1.25 * node.data().relative_importance * 24;
      node.style("font-size", fontSize.toString() + "px");
    }
  });
}

function setGraphBrightness(
  nodes: NodeCollection,
  brightnessLevel: number
): void {
  setNodeBrightness(nodes, brightnessLevel);
  setEdgeBrightness(nodes.connectedEdges(), brightnessLevel);
}

export function setNodeBrightness(
  nodes: NodeCollection,
  brightnessLevel = 0
): void {
  nodes.forEach((node) => {
    const nId = node.id();
    const parentColour: string | undefined = node
      .parent()
      .style("background-color");
    node.removeStyle("background-color");
    if (nId in learnedNodes && learnedNodes[nId]) {
      node.style("background-color", cyColours.learned);
    } else if (nId in goalNodes) {
      node.style("background-color", cyColours.goal);
    } else if (nId in pathNodes) {
      node.style("background-color", cyColours.path);
    } else if (nId !== selectedNodeID) {
      switch (brightnessLevel) {
        case 0:
          node.style(
            "background-color",
            getOpacityEquivalentColour(
              cyColours.nodeDark,
              parentColour || cyColours.nodeDark,
              0.6
            )
          );
          break;
        case 1:
          node.style("background-color", cyColours.nodeMed);
          break;
        case 2:
          node.style("background-color", cyColours.nodeMedBright);
          break;
        case 3:
          node.style("background-color", cyColours.nodeBright);
          break;
      }
    }
  });
}

export function setEdgeBrightness(
  edges: EdgeCollection,
  brightnessLevel = 0
): void {
  edges.forEach((edge) => {
    const sId = edge.source().id();
    const tId = edge.target().id();

    edge.style("opacity", 1);
    if (
      sId in learnedNodes &&
      tId in learnedNodes &&
      learnedNodes[sId] &&
      learnedNodes[tId]
    ) {
      edge.style("line-color", cyColours.learned);
      edge.style("mid-target-arrow-color", cyColours.learnedArrow);
    } else if (
      (sId in pathNodes || sId in goalNodes) &&
      (tId in pathNodes || tId in goalNodes)
    ) {
      edge.style("line-color", cyColours.path);
      edge.style("mid-target-arrow-color", cyColours.pathArrow);
    } else {
      switch (brightnessLevel) {
        case 0: {
          let parentColour;
          const sourceParent = edge.source().parent()[0],
            targetParent = edge.target().parent()[0];
          if (
            edge.target().data().name !== undefined &&
            sourceParent.id() === targetParent.id()
          ) {
            parentColour = edge.source().parent().style("background-color");
            edge.style(
              "line-color",
              getOpacityEquivalentColour(cyColours.edgeDark, parentColour, 0.6)
            );
            edge.style(
              "mid-target-arrow-color",
              getOpacityEquivalentColour(
                cyColours.edgeArrowDark,
                parentColour,
                0.6
              )
            );
          } else {
            edge.style("line-color", cyColours.edgeDark);
            edge.style("mid-target-arrow-color", cyColours.edgeArrowDark);
            edge.style("opacity", 0.6);
          }
          if (checkEdgeInvisible(edge)) edge.style("opacity", 0.4);
          break;
        }
        case 1:
          edge.style("line-color", cyColours.edgeMed);
          edge.style("mid-target-arrow-color", cyColours.edgeArrowMed);
          if (checkEdgeInvisible(edge)) edge.style("opacity", 0.4);
          break;
        case 2:
          edge.style("line-color", cyColours.edgeMedBright);
          edge.style("mid-target-arrow-color", cyColours.edgeArrowMedBright);
          break;
        case 3:
          edge.style("line-color", cyColours.edgeBright);
          edge.style("mid-target-arrow-color", cyColours.edgeArrowBright);
          break;
      }
    }
  });
}

export function resetTopicColour(topics: NodeCollection): void {
  topics.forEach((topic) => {
    topic.style(
      "background-color",
      getOpacityEquivalentColour(
        topic.data().colour,
        cyColours.background,
        fieldOpacity
      )
    );
  });
}

function checkEdgeInvisible(edge: EdgeSingular): boolean {
  const source = edge.source(),
    target = edge.target();
  if (source.data().parent !== target.data().parent) {
    const sx = source.position("x");
    const sy = source.position("y");
    const tx = target.position("x");
    const ty = target.position("y");
    // Euclidean distance > 1500 (cytoscape distance!)
    return ((sx - tx) ** 2 + (sy - ty) ** 2) ** (1 / 2) > 1500;
  } else {
    return false;
  }
}

function highlightNodes(nodes, resize: boolean): void {
  setNodeBrightness(nodes, 3);
  if (resize) {
    resizeNodes(nodes, "big");
  }
}

export function unhighlightNodes(nodes: NodeCollection): void {
  setGraphBrightness(nodes, 0);
  resizeNodes(nodes, "small");
}

let cytoscapeEventOngoing = false;

export function bindRouters(
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string,
  showConceptInfo: (nodeSelected: NodeSingular) => void,
  hideConceptInfo: () => void,
  onSetGoalClick: (
    node: NodeSingular,
    userId: string,
    sessionId: string
  ) => void,
  editMap: boolean,
  router: NextRouter,
  setHoverNode: (hoverNode: boolean) => void
): void {
  /** Binds events to user interactions with the map **/
  // Removes tooltip when clicking elsewhere/panning/zooming
  window.cy.on("tap dragpan scrollzoom pinchzoom", (e) => {
    if (!cytoscapeEventOngoing && e.target === window.cy) {
      cytoscapeEventOngoing = true;
      trackCyEvent(e, e.type, backendUrl, userId);
      // There's no zoomend event, so this counts each zoom outside of a 500ms window as a new zoom
      if (e.type.endsWith("zoom"))
        setTimeout(() => {
          cytoscapeEventOngoing = false;
        }, 500);
    }
    if (e.target === window.cy) setURLQuery(router, {});
  });

  // So only 1 tap is tracked per drag or tap
  window.cy.on("tapend", () => {
    cytoscapeEventOngoing = false;
  });

  // Updates the min zoom each time you let go of dragging an element
  if (editMap) {
    window.cy.on("dragfree", (e) => {
      updateMinZoom();
      if (e.target !== window.cy) {
        if (e.target.isParent())
          trackCyEvent(e, "Editor Move Topic", backendUrl, userId);
        else trackCyEvent(e, "Editor Move Concept", backendUrl, userId);
      }
    });
  }
  // Mouse over fields
  window.cy.on("mouseover", 'node[nodetype = "field"]', (e) => {
    const field = e.target;

    // Set field opacity to 1
    field.style("background-color", field.data().colour);

    // Increase opacity of all edges and nodes
    setGraphBrightness(field.children(), 1);
  });
  window.cy.on("mouseout", 'node[nodetype = "field"]', (e) => {
    const topic = e.target;
    resetTopicColour(topic);

    setGraphBrightness(topic.children(), 0);
  });

  // Mouse over concept nodes
  window.cy.on("mouseover", 'node[nodetype = "concept"]', (e) => {
    const concept = e.target;
    setHoverNode(true);

    // 1. Everything for fields
    concept.parent().style("background-color", concept.parent().data().colour);
    setGraphBrightness(concept.parent().children(), 1);

    // 2. Make connected nodes & edges opacity = 1
    setNodeBrightness(concept.neighborhood("node"), 2);
    setEdgeBrightness(concept.connectedEdges(), 2);

    // 3. Make highlighted node opacity=1 and bigger
    highlightNodes(concept, true);
  });
  window.cy.on("mouseout", 'node[nodetype = "concept"]', (e) => {
    const concept = e.target;
    setHoverNode(false);
    resetTopicColour(concept.parent());
    setGraphBrightness(concept.parent().children(), 1);
    unhighlightNodes(concept);
  });

  // Mouse over edges
  window.cy.on("mouseover", "edge", (e) => {
    const edge = e.target;

    // Everything for fields, plus:
    edge
      .connectedNodes()
      .parents()
      .forEach((topic) => topic.style("background-color", topic.data().colour));
    setGraphBrightness(edge.connectedNodes().parents().children(), 1);

    // 1. Make connected nodes opacity=1
    highlightNodes(edge.connectedNodes(), false);

    // 2. Make highlighted edge opacity = 1
    setEdgeBrightness(edge, 3);
  });
  window.cy.on("mouseout", "edge", (e) => {
    const edge = e.target;
    const nodes = edge.connectedNodes();

    resetTopicColour(edge.connectedNodes().parents());
    setGraphBrightness(edge.connectedNodes().parents().children(), 0);
    unhighlightNodes(nodes);
  });

  if (!editMap) {
    // Show concept info overlay when clicked
    window.cy.on("tap", 'node[nodetype = "concept"]', (e) => {
      trackCyEvent(e, "Concept Click", backendUrl, userId);
      const concept = e.target as NodeSingular;
      if (!isAnimated) {
        setIsAnimated(true);
        showConceptInfo(concept);
        fitCytoTo({ eles: concept.neighborhood(), padding: 50 }, () => {
          const previousSelectedNodeID = selectedNodeID;
          selectedNodeID = concept.id();
          unhighlightNodes(window.cy.getElementById(previousSelectedNodeID));
          highlightNodes(concept, true);
          setIsAnimated(false);
          setURLQuery(router, { concept: concept.id() });
        });
      }
    });

    // Right click concepts sets goal
    window.cy.on("cxttap", 'node[nodetype = "concept"]', (e) => {
      trackCyEvent(e, "Goal Set (Right Click)", backendUrl, userId);
      onSetGoalClick(e.target as NodeSingular, userId, sessionId);
    });
  }

  window.cy.on("tap", 'node[nodetype = "field"]', (e) => {
    trackCyEvent(e, "Topic Click", backendUrl, userId);
    const topic = e.target as NodeSingular;
    if (!isAnimated) {
      setIsAnimated(true);
      fitCytoTo({ eles: topic, padding: 25 }, () => {
        setIsAnimated(false);
        setURLQuery(router, { topic: topic.id() });
      });
    }
  });

  window.cy.on("tap", "edge", (e) => {
    trackCyEvent(e, "Edge Click", backendUrl, userId);
    const edge = e.target as EdgeSingular;
    if (!isAnimated) {
      setIsAnimated(true);
      fitCytoTo({ eles: edge.connectedNodes(), padding: 50 }, () =>
        setIsAnimated(false)
      );
    }
  });
}
