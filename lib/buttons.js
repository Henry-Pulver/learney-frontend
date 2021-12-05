import { fitCytoTo, updateMinZoom } from "./graph";

let cKeyPressed = false;

export function setupCtoCentre(editMap) {
  document.onkeydown = function (e) {
    if (
      document.activeElement !==
        document.getElementsByClassName("select2-search__field")[0] &&
      !["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)
    ) {
      if (e.code === "KeyC" && !cKeyPressed) {
        fitCytoTo({ eles: window.cy.nodes(), padding: 50 }, function () {
          cKeyPressed = false;
        });
        cKeyPressed = true;
      }
      if (editMap) {
        if (e.ctrlKey || e.metaKey) {
          if (e.code === "KeyZ") window.ur.undo();
          else if (e.code === "KeyY") window.ur.redo();
          updateMinZoom();
        } else if (["Backspace", "Delete"].includes(e.code)) {
          const selecteds = window.cy.$(":selected");
          if (selecteds.length > 0) window.ur.do("remove", selecteds);
        }
      }
    }
  };
}
