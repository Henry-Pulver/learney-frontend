import {
  initialiseGraphState,
  goalNodes,
  pathNodes,
  learnedNodes,
} from "./learningAndPlanning";
import { setupSearch } from "./search";
import cytoscape from "cytoscape";
import popper from "cytoscape-popper";
import dagre from "cytoscape-dagre";
import edgehandles from "cytoscape-edgehandles";
import undoRedo from "cytoscape-undo-redo";

cytoscape.use(popper);
cytoscape.use(edgehandles);
cytoscape.use(dagre);
cytoscape.use(undoRedo);

export function isMobile() {
  return screen.width < 768;
}

var isAnimated = false;

function setIsAnimated(value) {
  isAnimated = value;
}

const fieldOpacity = 0.7;
const lowestConceptOpacity = 0.4;

var selectedNodeID = Infinity;

export function initCy(
  mapJson,
  styleText,
  backendUrl,
  userId,
  mapUUID,
  editMap,
  sessionId,
  showConceptTippy,
  hideConceptTippy,
  onSetGoalClick
) {
  /** Initialise Cytoscape graph.*/
  let originalMapJSON = JSON.parse(mapJson);

  // Initialise cytoscape
  window.cy = cytoscape({
    elements: JSON.parse(JSON.stringify(originalMapJSON)),
    container: document.getElementById("cy"),
    layout: { name: "preset" },
    style: styleText,
    maxZoom: 1.5,
  });

  if (isMobile()) {
    // Performance enhancements
    let concepts = window.cy.nodes('[nodetype = "concept"]');
    concepts.style("min-zoomed-font-size", "2.5em");
  } else {
    window.cy.wheelSensitivity = 0.25;
  }
  // set initial viewport state
  updateMinZoom(editMap);

  if (!editMap) {
    window.cy.elements().panify();
  }

  unhighlightNodes(window.cy.nodes('[nodetype = "concept"]'));
  // Set initially learned or goal nodes
  initialiseGraphState(userId);

  if (editMap) {
    window.ur = window.cy.undoRedo();
  }

  bindRouters(
    backendUrl,
    userId,
    mapUUID,
    sessionId,
    showConceptTippy,
    hideConceptTippy,
    onSetGoalClick,
    editMap
  );
  setupSearch(originalMapJSON);
}

export function fitCytoTo(fitParams, onComplete = function () {}) {
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

export function panByAndZoom(xPan, yPan, zoomFactor, onComplete) {
  if (isMobile()) {
    window.cy.panBy({ x: xPan, y: yPan / 2 });
    window.cy.zoom(window.cy.zoom() * zoomFactor);
    onComplete();
  } else {
    window.cy.animate({
      panBy: { x: xPan, y: yPan },
      zoom: window.cy.zoom() * zoomFactor,
      duration: 1200,
      easing: "ease-in-out",
      complete: onComplete,
    });
  }
}

export function updateMinZoom(editMap = true) {
  const boundingBox = window.cy.elements().boundingBox(); // bounding box of all elements
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

function getConceptNodeOpacity(node, normalOpacity) {
  return (
    normalOpacity +
    ((node.data().relative_importance - 1) * (1 - normalOpacity)) / 2
  );
}

function resizeNodes(nodes, newBaseSize) {
  nodes.forEach(function (node) {
    if (node.data().id !== selectedNodeID) {
      let nodeSize = node.data().relative_importance * newBaseSize;
      node.style("width", nodeSize.toString() + "px");
      node.style("height", nodeSize.toString() + "px");
      let fontSize = 1.25 * node.data().relative_importance * 24;
      node.style("font-size", fontSize.toString() + "px");
    }
  });
}

function setGraphOpacity(nodes, multiplicativeFactor) {
  setNodeOpacity(nodes, multiplicativeFactor);
  setEdgeOpacity(nodes.connectedEdges(), multiplicativeFactor);
}

function setNodeOpacity(nodes, multiplicativeFactor) {
  nodes.forEach(function (node) {
    let nId = node.data().id;
    if (
      nId in learnedNodes ||
      nId in pathNodes ||
      nId in goalNodes ||
      nId === selectedNodeID
    ) {
      node.style("opacity", 1);
    } else {
      node.style(
        "opacity",
        Math.min(
          getConceptNodeOpacity(node, lowestConceptOpacity) *
            multiplicativeFactor,
          1
        )
      );
    }
  });
}

function setEdgeOpacity(edges, multiplicativeFactor) {
  edges.forEach(function (edge) {
    let sId = edge.source().data().id;
    let tId = edge.target().data().id;
    let sourceMaxOpacity =
      sId in learnedNodes ||
      sId in pathNodes ||
      sId in goalNodes ||
      sId === selectedNodeID;
    let targetMaxOpacity =
      tId in learnedNodes ||
      tId in pathNodes ||
      tId in goalNodes ||
      tId === selectedNodeID;
    if (sourceMaxOpacity && targetMaxOpacity) {
      edge.style("opacity", 1);
    } else if (checkEdgeInvisible(edge)) {
      edge.style("opacity", 0.1);
    } else {
      let sourceNodeOpacity = Math.min(
        multiplicativeFactor *
          getConceptNodeOpacity(edge.source(), lowestConceptOpacity),
        1
      );
      let targetNodeOpacity = Math.min(
        multiplicativeFactor *
          getConceptNodeOpacity(edge.target(), lowestConceptOpacity),
        1
      );
      let opacity = (sourceNodeOpacity + targetNodeOpacity) / 2;
      edge.style("opacity", opacity);
    }
  });
}

function checkEdgeInvisible(edge) {
  if (edge.source().data().parent !== edge.target().data().parent) {
    let sx = edge.source().position().x;
    let sy = edge.source().position().y;
    let tx = edge.target().position().x;
    let ty = edge.target().position().y;
    return ((sx - tx) ** 2 + (sy - ty) ** 2) ** (1 / 2) > 1500;
  } else {
    return false;
  }
}

function highlightNodes(nodes, resize) {
  nodes.style("opacity", 1);
  if (resize) {
    resizeNodes(nodes, 72);
  }
}

export function unhighlightNodes(nodes) {
  setGraphOpacity(nodes, 1);
  resizeNodes(nodes, 48);
}

function bindRouters(
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  showConceptTippy,
  hideConceptTippy,
  onSetGoalClick,
  editMap
) {
  // Removes tooltip when clicking elsewhere/panning/zooming
  window.cy.on("tap pan zoom", function (e) {
    if (e.target === window.cy) {
      if (selectedNodeID !== Infinity)
        hideConceptTippy(
          window.cy.getElementById(selectedNodeID),
          userId,
          sessionId
        );
      selectedNodeID = Infinity;
    }
  });

  // Updates the min zoom each time you let go of dragging an element
  window.cy.on("dragfree", () => {
    if (editMap) updateMinZoom();
  });

  // Mouse over fields
  window.cy.on("mouseover", 'node[nodetype = "field"]', function (e) {
    let field = e.target;

    // Set field opacity to 1
    field.style("opacity", 1);

    // Increase opacity of all edges and nodes
    setGraphOpacity(field.children(), 1.2);
  });
  window.cy.on("mouseout", 'node[nodetype = "field"]', function (e) {
    let field = e.target;
    field.style("opacity", fieldOpacity);
    setGraphOpacity(field.children(), 1);
  });

  // Mouse over concept nodes
  window.cy.on("mouseover", 'node[nodetype = "concept"]', function (e) {
    let concept = e.target;

    // 1. Everything for fields
    concept.parent().style("opacity", 1);
    setGraphOpacity(concept.parent().children(), 1.2);

    // 2. Make connected nodes & edges opacity = 1
    concept.neighborhood().style("opacity", 1);

    // 3. Make highlighted node opacity=1 and bigger
    highlightNodes(concept, true);
  });
  window.cy.on("mouseout", 'node[nodetype = "concept"]', function (e) {
    let concept = e.target;
    concept.parent().style("opacity", fieldOpacity);
    setGraphOpacity(concept.parent().children(), 1);
    unhighlightNodes(concept);
  });

  // Mouse over edges
  window.cy.on("mouseover", "edge", function (e) {
    let edge = e.target;

    // Everything for fields, plus:
    edge.connectedNodes().parents().style("opacity", 1);
    setGraphOpacity(edge.connectedNodes().parents().children(), 1.2);

    // 1. Make connected nodes opacity=1
    highlightNodes(edge.connectedNodes(), false);

    // 2. Make highlighted edge opacity = 1
    edge.style("opacity", 1);
  });
  window.cy.on("mouseout", "edge", function (e) {
    let edge = e.target;
    let nodes = edge.connectedNodes();
    edge.connectedNodes().parents().style("opacity", fieldOpacity);
    setGraphOpacity(edge.connectedNodes().parents().children(), 1);
    unhighlightNodes(nodes);
  });

  if (!editMap) {
    // Show tooltip when clicked
    window.cy.on("tap", 'node[nodetype = "concept"]', function (e) {
      let concept = e.target;
      if (!isAnimated) {
        setIsAnimated(true);
        if (selectedNodeID !== Infinity)
          hideConceptTippy(
            window.cy.getElementById(selectedNodeID),
            userId,
            sessionId
          );
        fitCytoTo({ eles: concept.neighborhood(), padding: 50 }, function () {
          showConceptTippy(concept);
          let previousSelectedNodeID = selectedNodeID;
          selectedNodeID = concept.data().id;
          unhighlightNodes(window.cy.getElementById(previousSelectedNodeID));
          highlightNodes(concept, true);
          setIsAnimated(false);
        });
      }
    });
  }

  window.cy.on("tap", 'node[nodetype = "field"]', function (e) {
    let field = e.target;
    if (!isAnimated) {
      setIsAnimated(true);
      fitCytoTo({ eles: field, padding: 25 }, () => setIsAnimated(false));
    }
  });

  window.cy.on("tap", "edge", function (e) {
    let edge = e.target;
    if (!isAnimated) {
      setIsAnimated(true);
      fitCytoTo({ eles: edge.connectedNodes(), padding: 50 }, () =>
        setIsAnimated(false)
      );
    }
  });

  // Right click concepts
  window.cy.on("cxttap", 'node[nodetype = "concept"]', function (e) {
    onSetGoalClick(e.target, userId, sessionId);
  });
}
