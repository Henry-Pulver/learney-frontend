import { ElementsDefinition, NodeDataDefinition } from "cytoscape";

export function getSearchArray(
  elements: ElementsDefinition
): Array<NodeDataDefinition> {
  const concepts: Array<NodeDataDefinition> = [];
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "concept") {
      concepts.push({ ...node.data });
    }
  });
  return concepts;
}

export function getSearchTopicDataLookup(
  elements: ElementsDefinition
): [object, object] {
  const topicNameToData = {};
  const conceptNameToData = {};
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "field") {
      topicNameToData[node.data.id] = { ...node.data };
    } else if (node.data.nodetype === "concept") {
      conceptNameToData[node.data.name] = { ...node.data };
    }
  });
  return [topicNameToData, conceptNameToData];
}
