export function searchArray(elements) {
  // Build array for search
  let conceptsAndFields = [];
  let fieldLocation = {};
  elements.nodes.forEach(function (node) {
    if (node.data.nodetype === "field") {
      fieldLocation[node.data.id] = conceptsAndFields.length;
      conceptsAndFields.push({
        text: node.data.name,
        children: [],
      });
    }
  });

  elements.nodes.forEach(function (node) {
    if (node.data.nodetype !== "field") {
      conceptsAndFields[fieldLocation[node.data.parent]].children.push({
        id: node.data.id,
        text: node.data.name,
      });
    }
  });
  return conceptsAndFields;
}
