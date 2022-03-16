import { ElementsDefinition, NodeDataDefinition } from "cytoscape";

export function getSearchArray(
  elements: ElementsDefinition,
  allowTopics: boolean
): Array<NodeDataDefinition> {
  const concepts: Array<NodeDataDefinition> = [];
  elements.nodes.forEach((node) => {
    if (
      node.data.nodetype === "concept" ||
      (allowTopics && node.data.nodetype === "field")
    ) {
      concepts.push({ ...node.data });
    }
  });
  return concepts;
}

export function getSearchTopicDataLookup(
  elements: ElementsDefinition,
  allowTopics: boolean
): [object, object] {
  const topicIdToData = {};
  const conceptNameToData = {};
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "field") {
      topicIdToData[node.data.id] = { ...node.data };
      if (allowTopics) {
        conceptNameToData[node.data.name] = { ...node.data };
      }
    } else if (node.data.nodetype === "concept") {
      conceptNameToData[node.data.name] = { ...node.data };
    }
  });
  return [topicIdToData, conceptNameToData];
}
