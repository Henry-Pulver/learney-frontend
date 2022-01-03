import { NodeSingular, SingularElementArgument } from "cytoscape";

export function getNextNodeToLearn(
  newlyLearnedNode: NodeSingular = null
): SingularElementArgument | undefined {
  let learned = window.cy.nodes(".learned");
  let goals = window.cy.nodes(".goal").not(learned);

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
          .every((predecessor) =>
            (predecessor.classes() as any).includes("learned")
          )
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
