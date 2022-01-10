import {
  learnedNodesString,
  goalNodesString,
} from "./learningAndPlanning/learningAndPlanning";
import { initialiseFromStorage, handleFetchResponses } from "./utils";
import { jsonHeaders } from "./headers";
import { NodeSingular } from "cytoscape";

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
  url: string,
  vote: boolean | null,
  selectedNode: NodeSingular,
  backendUrl: string,
  userId: string,
  mapUUID: string,
  sessionId: string
) {
  const response = await fetch(`${backendUrl}/api/v0/votes`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      map: mapUUID,
      user_id: userId,
      session_id: sessionId,
      concept: selectedNode.data().name,
      url: url,
      vote: vote,
    }),
  });
  handleFetchResponses(response, backendUrl);
}
