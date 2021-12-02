import { learnedNodesString, goalNodesString } from "./learningAndPlanning";
import { initialiseFromStorage, handleFetchResponses } from "./utils";
import { jsonHeaders } from "./headers";

const votesKeyName = "votes";

export async function getDataFromStorage(backendUrl, userId, mapUUID) {
  const learnedNodesPromise = initialiseFromStorage(
    backendUrl,
    learnedNodesString,
    userId,
    mapUUID
  );
  const goalNodesPromise = initialiseFromStorage(
    backendUrl,
    goalNodesString,
    userId,
    mapUUID
  );
  const votesPromise = initialiseFromStorage(
    backendUrl,
    votesKeyName,
    userId,
    mapUUID
  );
  return await Promise.all([
    learnedNodesPromise,
    goalNodesPromise,
    votesPromise,
  ]);
}

export async function saveVote(
  url,
  vote,
  selectedNode,
  backendUrl,
  userId,
  mapUUID,
  sessionId
) {
  const response = await fetch(`${backendUrl}/api/v0/votes`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      map_uuid: mapUUID,
      user_id: userId,
      session_id: sessionId,
      concept: selectedNode.data().name,
      url: url,
      vote: vote,
    }),
  });
  handleFetchResponses(response, backendUrl);
}
