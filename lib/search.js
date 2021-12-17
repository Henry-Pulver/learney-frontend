export function getSearchArray(elements) {
  let concepts = [];
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "concept") {
      concepts.push({ ...node.data });
    }
  });
  return concepts;
}

export function getSearchTopicDataLookup(elements) {
  let topicNameToData = {};
  let conceptNameToData = {};
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "field") {
      topicNameToData[node.data.id] = { ...node.data };
    } else if (node.data.nodetype === "concept") {
      conceptNameToData[node.data.name] = { ...node.data };
    }
  });
  return [topicNameToData, conceptNameToData];
}
