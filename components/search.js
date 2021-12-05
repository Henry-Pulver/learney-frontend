// import React from 'react';
// import Select2 from 'react-select2';
//
// export default function SearchBar({ searchOptions }){
//   // Add event handler for when an item is selected
//   const [value, setValue] = React.useState(null);
//   const clearValue = () => setValue(null);
//
//   return <Select2
//     multiple
//     style={{ width: "100%" }}
//     value={ value }
//     data={ searchOptions }
//     onSelect={function (event) {
//       window.cy.getElementById(event.params.data.id).emit("tap");
//       clearValue();
//     }}
//     options={
//       {
//         placeholder: "Find a concept...",
//         theme: "classic",
//         maximumSelectionLength: 1,
//         width: "resolve",
//       }
//     }
//   />
// }
//
// export function getSearchOptions(elements) {
//   let conceptsAndFields = [];
//   let fieldLocation = {};
//   elements.nodes.forEach(function (node) {
//     if (node.data.nodetype === "field") {
//       fieldLocation[node.data.id] = conceptsAndFields.length;
//       conceptsAndFields.push({
//         text: node.data.name,
//         children: [],
//       });
//     } else {
//       conceptsAndFields[fieldLocation[node.data.parent]].children.push({
//         id: node.data.id,
//         text: node.data.name,
//       });
//     }
//   });
//   return conceptsAndFields;
// }
