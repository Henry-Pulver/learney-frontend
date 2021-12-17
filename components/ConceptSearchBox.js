import React from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { classNames } from "../lib/reactUtils";
import { getSearchArray, getSearchTopicDataLookup } from "../lib/search";

export const ConceptSearchBox = ({
  mapJson,
  onSelect,
  classes = "",
  searchStyling = {},
}) => {
  /** Component responsible for rendering the search bar. **/
  let autocompleteData = getSearchArray(mapJson);
  const [topicDataLookup, conceptDataLookup] =
    getSearchTopicDataLookup(mapJson);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
  };
  const handleOnHover = (result) => {};
  const handleOnFocus = () => {};

  const formatResult = (conceptName) => {
    /** Format result as HTML **/
    const itemConceptData = conceptDataLookup[conceptName];
    const topicData = topicDataLookup[itemConceptData.parent];
    const conceptNameStr = `<p class="text-xs sm:text-lg">${conceptName}</p>`;
    const topicTagStr = `<p class="absolute right-1 text-gray-300 px-2.5 py-0.5 hidden sm:block text-base rounded-lg" style="background-color: ${topicData.colour};"> ${itemConceptData.parent} </p>`;
    return (
      <p
        dangerouslySetInnerHTML={{
          __html: `<div class="flex justify-between align-middle"> ${conceptNameStr} ${topicTagStr} </div>`,
        }}
      />
    );
  };

  return (
    <div className={classNames(classes, "z-10")}>
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
        styling={searchStyling}
      />
    </div>
  );
};
