import { fitCytoTo, updateMinZoom } from "./graph";

let cKeyPressed = false;

export function setupCtoCentre() {
  document.onkeydown = function (e) {
    if (!["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) {
      if (e.code === "KeyC" && !cKeyPressed) {
        fitCytoTo({ eles: window.cy.nodes(), padding: 50 }, function () {
          cKeyPressed = false;
        });
        cKeyPressed = true;
      }
    }
  };
}

export function setupEditorHotkeys(setEditMode) {
  document.onkeydown = function (e) {
    if (!["TEXTAREA", "INPUT"].includes(document.activeElement.tagName)) {
      if (e.ctrlKey || e.metaKey) {
        if (e.code === "KeyZ") window.ur.undo();
        else if (e.code === "KeyY") window.ur.redo();
        updateMinZoom();
      } else if (["Backspace", "Delete"].includes(e.code)) {
        const selecteds = window.cy.$(":selected");
        if (selecteds.length > 0) window.ur.do("remove", selecteds);
      } else {
        if (e.code === "KeyC") setEditMode("cursor");
        else if (e.code === "KeyA") setEditMode("addNode");
        else if (e.code === "KeyE") setEditMode("addEdges");
        else if (e.code === "KeyD") setEditMode("delete");
      }
    }
  };
}
