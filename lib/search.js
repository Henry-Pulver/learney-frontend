import $ from "jquery";
import "select2";

export function setupSearch(elements) {
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

  // Add search bar
  let searchBarDiv = $("#concept-search-bar");
  searchBarDiv.select2({
    theme: "classic",
    multiple: true,
    maximumSelectionLength: 1,
    placeholder: "Find a concept...",
    data: conceptsAndFields,
    width: "resolve",
  });

  // Add event handler for when an item is selected
  searchBarDiv.on("select2:select", function (event) {
    window.cy.getElementById(event.params.data.id).emit("tap");
    searchBarDiv.val(null).trigger("change");
  });
  searchBarDiv.focus();
}
