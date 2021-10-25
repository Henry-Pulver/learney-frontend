import { fitCytoTo } from "./graph_utils";

export var submapIdShown = null;

export function hideAllSubmapNodes() {
  let nodes_in_submaps = cy.nodes("[?submap_parent_id]");
  nodes_in_submaps.style.display = "none";
  nodes_in_submaps.connectedEdges().style.display = "none";
}

export function submapClicked(submapNode) {
  submapNode.style.display = "none";
  submapNode.connectedEdges().style.display = "none";

  let submapNodes = cy.nodes(`[submap_parent_id = ${submapNode.data().id}]`);
  submapNodes.style.display = undefined;
  submapNodes.connectedEdges().style.display = undefined;

  fitCytoTo({ eles: submapNodes, padding: 50 });
  // cy.animate()
}

export function returnToMainMap() {}
