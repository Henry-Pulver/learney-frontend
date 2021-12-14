export function getSearchArray(elements) {
  let concepts = [];
  elements.nodes.forEach((node) => {
    if (node.data.nodetype === "concept") {
      concepts.push({ ...node.data });
    }
  });
  return concepts;
}
