export type ConceptInfo = { level: number; max_level: number };

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
  completed: boolean;
  concept_id: string;
};

export type QuestionSetResponse = QuestionSet & {
  answers_given: AnswersGiven;
};

export const emptyQuestionSet: QuestionSet = {
  id: null,
  questions: [],
  completed: false,
  concept_id: null,
};
