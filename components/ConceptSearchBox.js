import React from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { getSearchArray } from "../lib/getSearchArray";
import { classNames } from "../lib/reactUtils";

export const ConceptSearchBox = ({ mapJson, onSelect, className = "" }) => {
  /** Component responsible for rendering the search bar. **/
  let originalMapJSON = JSON.parse(mapJson);
  let autocompleteData = getSearchArray(originalMapJSON);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
  };
  const handleOnHover = (result) => {};
  const handleOnFocus = () => {};

  const formatResult = (conceptName) => {
    /** Format result as HTML **/
    const itemConcept = window.cy.filter(`[name = "${conceptName}"]`);
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: `<div class="flex justify-between align-middle"> <p class="text-xs sm:text-lg">${conceptName}</p> <p class="absolute right-0 text-gray-300 px-2.5 py-0.5 hidden sm:block text-base rounded-lg" style="background-color: ${
            itemConcept.parent().data().colour
          };"> ${itemConcept.data().parent} </p></div>`,
        }}
      />
    );
  };

  return (
    <div className={classNames(className, "w-5/6 z-10 px-3 py-2")}>
      <ReactSearchAutocomplete
        items={autocompleteData}
        fuseOptions={{ keys: ["name", "parent", "description"] }}
        onSearch={handleOnSearch}
        onHover={handleOnHover}
        onSelect={onSelect}
        onFocus={handleOnFocus}
        autoFocus
        formatResult={formatResult}
        // TODO: Have animated placeholder-writing using examples on the map
        placeholder={"e.g. Machine Learning"}
      />
    </div>
  );
};
