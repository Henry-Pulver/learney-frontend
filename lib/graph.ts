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
  Stylesheet,
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
};
const nodeBaseSize = 48;

let selectedNodeID = "";

export function initCy(
  mapJson: ElementsDefinition,
  styleText: Stylesheet[],
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
  router: NextRouter,
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
      const queryConcept = window.cy.getElementById(parsedQuery.concept);
      if (queryConcept.size() > 0) {
        queryConcept.emit("tap");
        queryConcept.select();
      }
    } else {
      animationParams = {
        pan: { x: Number(parsedQuery.x), y: Number(parsedQuery.y) },
        zoom: Number(parsedQuery.zoom),
      };
      setURLQuery(router, {}); // Empty url params
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
      // These are default values - changed if newSize === "big"!
      let nodeSize = node.data().relative_importance * nodeBaseSize;
      let fontSize = 1.25 * node.data().relative_importance * 24;
      let textMaxWidth = 240;
      let minZoomFontSize = 1.25;
      const zoom = window.cy.zoom();

      if (newSize === "big") {
        nodeSize *= 1.5;
        if (zoom < 0.5) {
          fontSize *=
            1 / (Math.sqrt(zoom) * Math.sqrt(node.data().relative_importance));
          textMaxWidth *= 1 / (zoom * 2);
          minZoomFontSize *= Math.sqrt(zoom);
        }
      }

      node.style({
        width: nodeSize.toString() + "px",
        height: nodeSize.toString() + "px",
        "font-size": fontSize.toString() + "px",
        "text-max-width": textMaxWidth.toString() + "px",
        "min-zoomed-font-size": minZoomFontSize.toString() + "em",
      });
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
  nodes.forEach((node: NodeSingular) => {
    const nId = node.id();
    node.removeStyle("background-color");
    node.removeClass("node-med node-med-bright node-bright");

    if (
      !node.hasClass("current-concept") &&
      !(nId in learnedNodes && learnedNodes[nId]) &&
      !(nId in goalNodes) &&
      !(nId in pathNodes) &&
      nId !== selectedNodeID &&
      !(selectedNodeID in node.neighborhood())
    ) {
      switch (brightnessLevel) {
        case 0: {
          const parentColour: string | undefined = node
            .parent()
            .style("background-color");
          node.style(
            "background-color",
            getOpacityEquivalentColour(
              cyColours.nodeDark,
              parentColour || cyColours.nodeDark,
              0.6
            )
          );
          break;
        }
        case 1:
          node.classes("node-med");
          break;
        case 2:
          node.classes("node-med-bright");
          break;
        case 3:
          node.classes("node-bright");
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
    const sId = edge.source().id(); // source id
    const tId = edge.target().id(); // target id

    if (
      !(
        sId in learnedNodes &&
        tId in learnedNodes &&
        learnedNodes[sId] &&
        learnedNodes[tId]
      ) &&
      !(
        (sId in pathNodes || sId in goalNodes) &&
        (tId in pathNodes || tId in goalNodes)
      )
    ) {
      edge.style("opacity", 1);
      switch (brightnessLevel) {
        case 0: {
          edge.classes("edge-dark");
          if (checkEdgeInvisible(edge)) edge.style("opacity", 0.4);
          else edge.style("opacity", 0.6);
          break;
        }
        case 1:
          edge.classes("edge-med");
          if (checkEdgeInvisible(edge)) edge.style("opacity", 0.4);
          break;
        case 2:
          edge.classes("edge-med-bright");
          break;
        case 3:
          edge.classes("edge-bright");
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

export function highlightNodes(nodes, resize: boolean): void {
  setNodeBrightness(nodes, 3);
  if (resize) resizeNodes(nodes, "big");
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
    setHoverNode(true);
    const concept = e.target;

    // 1. Everything for fields
    concept.parent().style("background-color", concept.parent().data().colour);
    setGraphBrightness(concept.parent().children(), 1);

    // 2. Make connected nodes & edges opacity = 1
    setNodeBrightness(concept.neighborhood("node"), 2);
    setEdgeBrightness(concept.connectedEdges(), 3);

    // 3. Make highlighted node opacity=1 and bigger
    highlightNodes(concept, true);
  });
  window.cy.on("mouseout", 'node[nodetype = "concept"]', (e) => {
    const concept = e.target;
    setHoverNode(false);
    setNodeBrightness(concept.neighborhood("node"), 0);
    resizeNodes(concept, "small");
  });

  // Mouse over edges
  window.cy.on("mouseover", "edge", (e) => {
    const edge = e.target;

    // Everything for fields, plus:
    const connectedNodes = edge.connectedNodes();
    window.cy.startBatch();
    connectedNodes
      .parents()
      .forEach((topic) => topic.style("background-color", topic.data().colour));
    const nodes = connectedNodes.parents().children();
    setNodeBrightness(nodes, 1);
    setEdgeBrightness(nodes.connectedEdges(), 1);
    window.cy.endBatch();
  });
  window.cy.on("mouseout", "edge", (e) => {
    const edge = e.target;
    const connectedNodes = edge.connectedNodes();

    window.cy.startBatch();
    resetTopicColour(edge.connectedNodes().parents());
    if (edge.target().parent().id() !== edge.source().parent().id())
      setGraphBrightness(edge.connectedNodes().parents().children(), 0);
    unhighlightNodes(connectedNodes);
    window.cy.endBatch();
  });

  if (!editMap) {
    // Show concept info overlay when clicked
    window.cy.on("tap", 'node[nodetype = "concept"]', (e) => {
      trackCyEvent(e, "Concept Click", backendUrl, userId);
      const concept = e.target as NodeSingular;
      localStorage.setItem(`lastConceptClickedMap${mapUUID}`, concept.id());
      if (!isAnimated) {
        setIsAnimated(true);
        showConceptInfo(concept);

        window.cy.resize(); // .resize() forces cytoscape to recalculate the viewport bounds - since concept overlay
        // changes screen size, it's needed to make sure the animation takes the viewport to the right place

        fitCytoTo({ eles: concept.neighborhood(), padding: 50 }, () => {
          const previousSelectedNodeID = selectedNodeID;
          selectedNodeID = concept.id();
          unhighlightNodes(window.cy.getElementById(previousSelectedNodeID));
          highlightNodes(concept, true);
          setIsAnimated(false);
          setURLQuery(router, { ...router.query, concept: concept.id() });
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

export function selectConceptFromId(conceptId: string): void {
  const concept = window.cy.getElementById(conceptId);
  window.cy.$(":selected").unselect();
  if (concept.size() === 0) {
    throw new Error(`Concept with id: ${conceptId} not found!`);
  }
  concept.emit("tap");
  concept.select();
}
