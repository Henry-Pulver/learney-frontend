import { fitCytoTo } from "./graph";

var cKeyPressed = false;

export function setupCtoCentre(editMap) {
  document.onkeydown = function (e) {
    if (
      !editMap &&
      document.activeElement !==
        document.getElementsByClassName("select2-search__field")[0]
    ) {
      if (e.code === "KeyC" && !cKeyPressed) {
        fitCytoTo({ eles: cy.nodes(), padding: 50 }, function () {
          cKeyPressed = false;
        });
        cKeyPressed = true;
      }
    }
  };
}
