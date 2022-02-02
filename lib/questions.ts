import { NodeSingular } from "cytoscape";
import { handleFetchResponses } from "./utils";
import { jsonHeaders } from "./headers";
import { ConceptInfo, NextConcept } from "../components/questions/types";

export function getNextNodeToLearn(
  newlyLearnedNode: NodeSingular = null
): NodeSingular | undefined {
  const learned = window.cy.nodes(".learned");
  const goals = window.cy.nodes(".goal").not(learned);
  if (window.cy.nodes(".goal").or(".path").not(".learned").size() === 0) {
    return undefined;
  } // goal(s) are set
  // Find possible next steps
  let possibleNextSteps = window.cy.collection();
  // target of learned or roots, not learned, on path & where all predecessors are learned!
  learned
    .outgoers("node")
    .or(goals.predecessors().roots())
    .and(goals.or(".path"))
    .not(learned)
    .forEach((node) => {
      if (
        node.predecessors("node").empty() ||
        node
          .predecessors("node")
          .toArray()
          .every((predecessor) => predecessor.hasClass("learned"))
      ) {
        possibleNextSteps = possibleNextSteps.or(node);
      }
    });
  // Prefer successor of newly learned if possible
  if (
    newlyLearnedNode !== null &&
    possibleNextSteps.and(newlyLearnedNode.successors()).size() > 1
  ) {
    possibleNextSteps = possibleNextSteps.and(newlyLearnedNode.successors());
  }
  // randomly pick amongst remaining options
  return possibleNextSteps.toArray()[
    Math.floor(Math.random() * possibleNextSteps.size())
  ] as NodeSingular;
}
export const fetchCurrentConcept = async (
  backendUrl: string,
  userId: string,
  mapUUID: string
): Promise<NextConcept> => {
  const response = await fetch(
    `${backendUrl}/api/v0/current_concept?` +
      new URLSearchParams({
        user_id: userId,
        map_uuid: mapUUID,
      }),
    {
      method: "GET",
      headers: jsonHeaders,
    }
  );
  return (await handleFetchResponses(response, backendUrl)) as NextConcept;
};

export async function fetchConceptInfo(
  backendUrl: string,
  userId: string,
  conceptId: string,
  questionsEnabled: boolean
): Promise<ConceptInfo> {
  if (!questionsEnabled) return { level: null, max_level: null };
  const response = await fetch(
    `${backendUrl}/api/v0/concept_info?` +
      new URLSearchParams({
        user_id: userId,
        concept_id: conceptId,
      }),
    {
      method: "GET",
      headers: jsonHeaders,
    }
  );
  return (await handleFetchResponses(response, backendUrl)) as ConceptInfo;
}
