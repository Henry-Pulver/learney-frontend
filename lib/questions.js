export function completeTest(
  answersGiven,
  node,
  learnedNodes,
  goalNodes,
  questionSet,
  correctThreshold,
  onSuccess,
  onFail
) {
  const correctAnswers = questionSet.map(
    (question, questionIdx) =>
      question.correct_answer === answersGiven[questionIdx]
  );
  const numberCorrect = correctAnswers.filter(Boolean).length;
  const thresholdReached = numberCorrect >= correctThreshold;

  if (thresholdReached) onSuccess();
  else onFail();
}

export function getNextNodeToLearn(newlyLearnedNode = null) {
  let learned = cy.nodes(".learned");
  let goals = cy.nodes(".goal").not(learned);

  if (goals.size() === 0) {
    return undefined;
  } // goal(s) are set

  // Find possible next steps
  let possibleNextSteps = cy.collection();
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
          .every((predecessor) => predecessor.classes().includes("learned"))
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
  ];
}
