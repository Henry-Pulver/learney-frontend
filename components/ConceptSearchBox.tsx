import React from "react";
import { ReactSearchAutocomplete } from "./react-search-autocomplete";
import { classNames } from "../lib/reactUtils";
import { getSearchArray, getSearchTopicDataLookup } from "../lib/search";
import { ElementsDefinition } from "cytoscape";

export const ConceptSearchBox = ({
  mapJson,
  onSelect,
  classes = "",
  searchStyling = {},
  maxResults = 10,
  showTitle,
  setShowTitle,
}: {
  mapJson: ElementsDefinition;
  onSelect: (item: { id: string }) => void;
  classes?: string;
  searchStyling?: object;
  maxResults?: number;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
}) => {
  /** Component responsible for rendering the search bar. **/
  const autocompleteData = getSearchArray(mapJson);
  const [topicDataLookup, conceptDataLookup] =
    getSearchTopicDataLookup(mapJson);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    if (showTitle) setShowTitle(false);
  };
  const handleOnHover = (result) => {};
  const handleOnFocus = () => {};

  const formatResult = (conceptName) => {
    /** Format result as HTML **/
    const itemConceptData = conceptDataLookup[conceptName];
    const topicData = topicDataLookup[itemConceptData.parent];

    return (
      <p>
        <div className="flex justify-between align-middle">
          <p className="text-xs sm:text-lg">{conceptName}</p>
          <p
            className="absolute right-1 text-gray-300 px-2.5 py-0.5 hidden sm:block text-base rounded-lg"
            style={{ backgroundColor: `${topicData.colour}` }}
          >
            {itemConceptData.parent}
          </p>
        </div>
      </p>
    );
  };

  return (
    // z-20 so it shows above concept overlay
    <div className={classNames(classes, "z-20")}>
      <ReactSearchAutocomplete
        items={autocompleteData}
        fuseOptions={{ keys: ["name", "parent", "description"] }}
        onSearch={handleOnSearch}
        inputDebounce={0}
        onHover={handleOnHover}
        onSelect={(item) => {
          onSelect(item);
          setShowTitle(true);
        }}
        onHideResults={() => {
          if (!showTitle) setShowTitle(true);
        }}
        maxResults={maxResults}
        onFocus={handleOnFocus}
        autoFocus
        formatResult={formatResult}
        // TODO: Have animated placeholder-writing using examples on the map
        placeholder={`e.g. ${
          autocompleteData[Math.floor(Math.random() * autocompleteData.length)]
            .name
        }`}
        styling={searchStyling}
      />
    </div>
  );
};
