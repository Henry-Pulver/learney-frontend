import { NodeSingular } from "cytoscape";
import { handleFetchResponses } from "./utils";
import { jsonHeaders } from "./headers";

export type QuestionResponseFormat = {
  id: string;
  question_text: string;
  answer_text: Array<string>;
  correct_answer?: string;
  answers_order_randomised: Array<string>;
  feedback_text: string;
};

export type QuestionSet = Array<QuestionResponseFormat>;

export type QuestionResponseJSON = {
  question_set: QuestionSet;
  correct_threshold: number;
};

export function completeTest(
  answersGiven,
  node: NodeSingular,
  learnedNodes: object,
  goalNodes: object,
  questionSet,
  correctThreshold: number,
  onSuccess: () => void,
  onFail: () => void
): void {
  const correctAnswers = questionSet.map(
    (question, questionIdx) =>
      question.correct_answer === answersGiven[questionIdx]
  );
  const numberCorrect = correctAnswers.filter(Boolean).length;
  const thresholdReached = numberCorrect >= correctThreshold;

  if (thresholdReached) onSuccess();
  else onFail();
}

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

export const fetchQuestionSet = async ({
  backendUrl,
  mapUUID,
  userId,
  conceptId,
  questionsEnabled,
}: {
  backendUrl: string;
  mapUUID: string;
  userId: string;
  conceptId: string;
  questionsEnabled: boolean;
}): Promise<QuestionResponseJSON> => {
  if (!questionsEnabled) return { question_set: [], correct_threshold: 0 };
  console.log("FETCHING QUESTIONS");
  const response = await fetch(
    `${backendUrl}/api/v0/questions?` +
      new URLSearchParams({
        map_uuid: mapUUID,
        user_id: userId,
        concept_id: conceptId,
      }),
    {
      method: "GET",
      headers: jsonHeaders,
    }
  );
  const responseJson = (await handleFetchResponses(
    response,
    backendUrl
  )) as QuestionResponseJSON;
  // {
  //  correct_threshold: 3,
  //  question_set: [{question_text: "...",
  //                  answer_text: ["...", "..."],
  //                  feedback_text: "..."}]
  // }

  // DOES RANDOM ORDERING OF QUESTIONS
  responseJson.question_set.forEach((question) => {
    question.correct_answer = question.answer_text[0];
    question.answers_order_randomised = question.answer_text.sort(
      () => 0.5 - Math.random()
    );
  });
  return responseJson;
};
