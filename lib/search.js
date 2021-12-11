import $ from "jquery";
import "select2";
import { searchArray } from "./searchArray";

export function setupSearch(elements) {
  let conceptsAndFields = searchArray(elements);
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
