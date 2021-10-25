import { initCy, panByAndZoom } from "./graph";
import { updateQuestionAnswerUsers } from "./utils";
import { setupCtoCentre } from "./buttons";

export async function setupMap(
  backendUrl,
  userId,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
  sessionId,
  showConceptTippy,
  hideConceptTippy,
  onSetGoalClick
  // updateSearchOptions
) {
  const styleResponse = await fetch(`/knowledge_graph.cycss`);
  const styleText = await styleResponse.text();
  await initCy(
    mapJson,
    styleText,
    backendUrl,
    userId,
    mapUUID,
    editMap,
    sessionId,
    showConceptTippy,
    hideConceptTippy,
    onSetGoalClick
  );
  // TODO: if goal is set, zoom there instead of to the bottom?
  panByAndZoom(-cy.width() / 6, (-cy.height() * 4) / 9, 1.5, function () {});

  updateQuestionAnswerUsers(userId);
  setupCtoCentre();
}
