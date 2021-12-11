import React from "react";
import { searchArray } from "../lib/searchArray";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

const _formatDropDownData = (dropDownData) => {
  const formattedData = dropDownData.map((concept) => {
    const formattedChildren = concept.children.map((child) => {
      return {
        id: child.id,
        name: `${child.text}:${concept.text}`,
      };
    });
    return formattedChildren;
  });
  return formattedData.flat();
};

// Component responsible for rendering the search bar.
export const SearchBox = ({ mapJson }) => {
  let originalMapJSON = JSON.parse(mapJson);
  let dropDownData = searchArray(originalMapJSON);
  let autocompleteData = _formatDropDownData(dropDownData);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    // Extra logic can be added here
  };

  const handleOnHover = (result) => {
    // the item hovered
    // Extra logic can be added here
  };

  const handleOnSelect = (item) => {
    window.cy.getElementById(item.id).emit("tap");
  };

  const handleOnFocus = () => {
    // Extra logic can be added here
    console.log("Focused");
  };

  const formatResult = (item) => {
    const itemArr = item.split(":");
    return (
      <p
        dangerouslySetInnerHTML={{
          __html:
            itemArr[0] +
            "             " +
            "<strong>" +
            ":" +
            itemArr[1] +
            "</strong>",
        }}
      ></p>
    ); //To format result as html
  };

  return (
    <div style={{ width: "90%", zIndex: "2", padding: "10px" }}>
      <ReactSearchAutocomplete
        items={autocompleteData}
        onSearch={handleOnSearch}
        onHover={handleOnHover}
        onSelect={handleOnSelect}
        onFocus={handleOnFocus}
        autoFocus
        formatResult={formatResult}
        placeholder={"Find a concept.. "}
      />
    </div>
  );
};
