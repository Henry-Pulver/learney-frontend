import { initCy, panByAndZoom } from "./graph";
import { isAnonymousUser, updateQuestionAnswerUsers } from "./utils";
import { setupCtoCentre } from "./buttons";
import { getDataFromStorage, initialiseVotes } from "./tooltips";
import {
  initialiseLearnedGoals,
  initialiseSignInTooltip,
} from "./learningAndPlanning";

export async function setupSite(
  backendUrl,
  userId,
  allowSuggestions,
  editMap,
  mapJson,
  mapUUID,
  sessionId
  // updateSearchOptions
) {
  let [initLearnedNodes, initGoalNodes, initVotes] = await getDataFromStorage(
    backendUrl,
    userId,
    mapUUID
  );
  initialiseVotes(initVotes);
  initialiseLearnedGoals(initLearnedNodes, initGoalNodes, mapUUID);
  if (isAnonymousUser(userId)) {
    initialiseSignInTooltip();
  }

  const styleResponse = await fetch(`/knowledge_graph.cycss`);
  const styleText = await styleResponse.text();
  await initCy(
    mapJson,
    styleText,
    backendUrl,
    userId,
    mapUUID,
    editMap,
    sessionId
  );
  // TODO: if goal is set, zoom there instead of to the bottom?
  panByAndZoom(-cy.width() / 6, (-cy.height() * 4) / 9, 1.5, function () {});
  // Promise.all([stylePromise, graphPromise]).then((promiseResult) => initCy(promiseResult, updateSearchOptions)).then(introSequence);

  updateQuestionAnswerUsers(userId);
  setupCtoCentre();
}
