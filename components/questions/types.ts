export type KnowledgeLevel = { level: number };

export type ConceptInfo = KnowledgeLevel & { max_level: number };

type Completed =
  | "completed_concept"
  | "doing_poorly"
  | "max_num_of_questions"
  | null;

export type AnswerResponse = KnowledgeLevel & {
  completed: Completed;
  next_question: Question;
};

export type AnswersGiven = Array<string>;

export type Question = {
  id: string;
  question_text: string;
  answers: Array<string>;
  correct_answer: string;
  answers_order_randomised: Array<string>;
  feedback: string;
};

export type QuestionArray = Array<Question>;

export type QuestionSet = {
  id: string;
  questions: QuestionArray;
  completed: Completed;
  concept_id: string;
};

export type QuestionSetResponse = QuestionSet & {
  answers_given: AnswersGiven;
};

export const emptyQuestionSet: QuestionSet = {
  id: null,
  questions: [],
  completed: null,
  concept_id: null,
};
