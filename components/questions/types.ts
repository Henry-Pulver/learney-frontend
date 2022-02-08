export type KnowledgeLevel = { level: number };

export type ConceptInfo = KnowledgeLevel & { max_level: number };
export type NextConcept = {
  concept_id: string;
};

export type Completed =
  | "completed_concept"
  | "doing_poorly"
  | "max_num_of_questions"
  | "review_completed"
  | null;

export type AnswerResponse =
  | (KnowledgeLevel & {
      completed: Completed;
      next_questions: Array<Question>;
    })
  | { response: string };

export type AnswersGiven = Array<string>;

export type Question = {
  id: string;
  template_id: string;
  question_text: string;
  answers_order_randomised: Array<string>;
  correct_answer: string;
  feedback: string;
  params: object;
};

export type QuestionArray = Array<Question>;

export type QuestionSet = {
  id: string;
  questions: QuestionArray;
  completed: Completed;
  concept_id: string;
  initial_knowledge_level: number;
  max_num_questions: number;
};

export type QuestionSetResponse = QuestionSet & {
  answers_given: AnswersGiven;
};

export const emptyQuestionSet: QuestionSet = {
  id: null,
  questions: [],
  completed: null,
  concept_id: null,
  initial_knowledge_level: null,
  max_num_questions: null,
};
