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
  allowTopics = false,
}: {
  mapJson: ElementsDefinition;
  onSelect: (item: { id: string }) => void;
  classes?: string;
  searchStyling?: object;
  maxResults?: number;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
  allowTopics?: boolean;
}) => {
  /** Component responsible for rendering the search bar. **/
  const autocompleteData = getSearchArray(mapJson, allowTopics);
  const [topicDataLookup, conceptDataLookup] = getSearchTopicDataLookup(
    mapJson,
    allowTopics
  );

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    if (showTitle) setShowTitle(false);
  };
  const handleOnHover = (result) => {};
  const handleOnFocus = () => {};

  const formatResult = (conceptName: string) => {
    /** Format result as HTML **/
    const itemConceptData = conceptDataLookup[conceptName];
    if (itemConceptData.nodetype === "concept") {
      const topicData = topicDataLookup[itemConceptData.parent];
      return (
        <p>
          <div className="flex justify-between align-middle">
            <p className="text-xs sm:text-lg">{conceptName}</p>
            <p
              className="absolute right-1 hidden rounded-lg px-2.5 py-0.5 text-base text-gray-300 sm:block"
              style={{ backgroundColor: `${topicData.colour}` }}
            >
              {itemConceptData.parent}
            </p>
          </div>
        </p>
      );
    }
    return (
      <p>
        <div className="flex justify-between align-middle">
          <p
            className="rounded-lg px-2.5 py-0.5 text-xs text-gray-300 sm:block sm:text-lg"
            style={{ backgroundColor: `${itemConceptData.colour}` }}
          >
            {conceptName}
          </p>
        </div>
      </p>
    );
  };

  return (
    // z-20 so it shows above concept overlay
    <div className={classNames(classes, "z-10")}>
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
