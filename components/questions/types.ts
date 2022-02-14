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
  title: string;
  question_text: string;
  answers_order_randomised: Array<string>;
  correct_answer: string;
  feedback: string;
  difficulty: number;
  params: object;
};

export const emptyQuestion: Question = {
  id: "",
  template_id: "",
  title: "",
  question_text: "",
  answers_order_randomised: ["", "", "", ""],
  correct_answer: "",
  feedback: "",
  difficulty: 0,
  params: {},
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

export type Template = {
  id: string;
  title: string;
  template_text: string;
  difficulty: number;
  question_type: "conceptual" | "practice" | "";
  correct_answer_letter: "a" | "b" | "c" | "d" | "";
  active: boolean;
};

export type QuestionEditingResponse = Question & { error?: string };

export const emptyTemplate: Template = {
  id: "",
  title: "",
  template_text: "",
  difficulty: 0,
  question_type: "",
  correct_answer_letter: "a",
  active: false,
};

export type QuestionType = "conceptual" | "practice" | "";
