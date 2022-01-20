import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { AcademicCapIcon } from "@heroicons/react/outline";
import { InlineMath, BlockMath } from "react-katex";
import { handleFetchResponses, isEven, isNumeric } from "../../lib/utils";
import { classNames } from "../../lib/reactUtils";
import { NextArrow } from "../svgs/icons";
import { jsonHeaders } from "../../lib/headers";
import { AnswersGiven } from "./progressDots";
import { QuestionSet } from "../../lib/questions";
import { ReportQuestionButton } from "./buttons";
import { ButtonPressFunction } from "../../lib/types";
import Modal from "../modal";
import ProgressBar, { realPercentageToProgress } from "./progressBars";

// TODO: Tweak this when the representation on the backend is determined.
type KnowledgeState = { knowledge: number };

export default function QuestionModal({
  questionSet,
  modalShown,
  closeModal,
  onCompletion,
  backendUrl,
  userId,
  sessionId,
  buttonPressFunction,
}: {
  questionSet: QuestionSet;
  modalShown: boolean;
  closeModal: () => void;
  onCompletion: (answersGiven: AnswersGiven, questionSet: QuestionSet) => void;
  backendUrl: string;
  userId: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [knowledgeState, setKnowledgeState] = useState<KnowledgeState>();
  const [answersGiven, setAnswersGiven] = useState<AnswersGiven>(
    questionSet.map(() => undefined)
  );
  const [progressBarPercentageFilled, setProgressBarPercentageFilled] =
    useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const nextQuestion = () => setCurrentQuestionIndex(currentQuestionIndex + 1);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswersGiven(questionSet.map(() => null));
  }, [questionSet]);

  const onAnswerClick = async (answerText: string) => {
    const answers = [...answersGiven];
    answers[currentQuestionIndex] = answerText;
    setAnswersGiven(answers);
    // Tell the backend about the answer given
    const questionResponse = await fetch(
      `${backendUrl}/api/v0/question_response`,
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          question: questionSet[currentQuestionIndex].id,
          response: answerText,
          correct:
            answerText === questionSet[currentQuestionIndex].correct_answer,
        }),
      }
    );
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as KnowledgeState;
    setKnowledgeState(responseJson);
    setProgressBarPercentageFilled(
      realPercentageToProgress(
        questionSet,
        answersGiven,
        knowledgeState.knowledge, // TODO: change?
        knowledgeState.knowledge > 1, // TODO: change
        progressBarPercentageFilled
      )
    );
  };

  const currentStepRef = useRef(null);

  return (
    <Modal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="items-center"
      contentClassName="w-full max-h-excl-toolbar"
    >
      <div>
        {currentQuestionIndex in questionSet && ( // <-- Crushes a rare bug
          <>
            <div>
              <div className="flex justify-center">
                <ProgressBar
                  percentFilled={Math.max(
                    Math.min(progressBarPercentageFilled, 100),
                    0
                  )}
                />
              </div>
              {/*TODO: Remove? Being kept now in case we want to use progress dots in some way
                   (perhaps allowing you to jump back to previous questions easily?)*/}
              {/*<ProgressDots*/}
              {/*  questionSet={questionSet}*/}
              {/*  answersGiven={answersGiven}*/}
              {/*  currentQuestionIndex={currentQuestionIndex}*/}
              {/*  currentStepRef={currentStepRef}*/}
              {/*/>*/}
              <div className="mt-3 text-center sm:mt-5">
                <div className="my-8 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <AcademicCapIcon
                    className="h-6 w-6 text-blue-600"
                    aria-hidden="true"
                  />
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  {`Question ${currentQuestionIndex + 1}`}
                </Dialog.Title>
                <div className="mt-6 mb-4 text-black">
                  <QuestionText
                    text={questionSet[currentQuestionIndex].question_text}
                  />
                </div>
                {/*<div className="relative h-8 sm:h-10">*/}
                {/*  <div className="absolute right-2 sm:right-4">*/}
                {/*    <ReportQuestionButton*/}
                {/*      question={questionSet[currentQuestionIndex]}*/}
                {/*      buttonPressFunction={buttonPressFunction}*/}
                {/*      backendUrl={backendUrl}*/}
                {/*      userId={userId}*/}
                {/*    />*/}
                {/*  </div>*/}
                {/*</div>*/}
                <AnswerOptions
                  answerArray={
                    questionSet[currentQuestionIndex].answers_order_randomised
                  }
                  answerGiven={answersGiven[currentQuestionIndex]}
                  correctAnswer={
                    questionSet[currentQuestionIndex].correct_answer
                  }
                  onAnswerSelected={onAnswerClick}
                />
              </div>
            </div>
            {/*FEEBACK*/}
            {answersGiven[currentQuestionIndex] && // Check that the question has been answered
              answersGiven[currentQuestionIndex] !==
                questionSet[currentQuestionIndex].correct_answer && // Check that the answer is incorrect
              questionSet[currentQuestionIndex].feedback_text && ( // Check that there is some feedback
                <div className="bg-gray-200 text-black py-2 my-2 rounded-sm text-center">
                  <h3 className="text-lg pt-2 font-semibold">Feedback</h3>
                  <QuestionText
                    text={questionSet[currentQuestionIndex].feedback_text}
                  />
                </div>
              )}
            {/*NEXT QUESTION BUTTON*/}
            <div className="mt-5 sm:mt-4 flex justify-between">
              <ReportQuestionButton
                question={questionSet[currentQuestionIndex]}
                buttonPressFunction={buttonPressFunction}
                backendUrl={backendUrl}
                userId={userId}
              />
              <button
                className={classNames(
                  answersGiven[currentQuestionIndex] &&
                    "bg-blue-600 hover:bg-blue-700 cursor-pointer",
                  !answersGiven[currentQuestionIndex] &&
                    "bg-gray-300 cursor-default",
                  "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                )}
                onClick={
                  answersGiven[currentQuestionIndex] === null
                    ? () => {}
                    : currentQuestionIndex !== questionSet.length - 1
                    ? nextQuestion
                    : () => onCompletion(answersGiven, questionSet)
                }
              >
                {currentQuestionIndex !== questionSet.length - 1
                  ? "Next Question"
                  : "Complete"}
                <NextArrow />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function QuestionText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (isNumeric(text)) text = "$$" + text + "$$";
  const questionTextArray = [];

  const blockLatexDivs = text.split("/$$");
  blockLatexDivs.forEach((textBlock, index) => {
    if (isEven(index)) {
      questionTextArray.push(<InlineTextAndMath text={textBlock} />);
    } else {
      textBlock.split("$$/").forEach((nestedTextBlock, index) => {
        if (isEven(index)) {
          questionTextArray.push(<BlockMath>{nestedTextBlock}</BlockMath>);
        } else {
          questionTextArray.push(<InlineTextAndMath text={nestedTextBlock} />);
        }
      });
    }
  });
  return <div className={className}>{questionTextArray}</div>;
}

function InlineTextAndMath({ text }: { text: string }) {
  const outputArray = [];
  text.split("$$").forEach((textBlock, index) => {
    if (isEven(index)) {
      outputArray.push(...PureTextBlock(textBlock));
    } else {
      outputArray.push(<InlineMath>{textBlock}</InlineMath>);
    }
  });
  return <div>{outputArray}</div>;
}

function PureTextBlock(text: string): Array<string> {
  const outputArray = [];
  text.split("\n").forEach((textBlock, index) => {
    if (index !== 0) {
      outputArray.push(<br />);
    }
    outputArray.push(textBlock);
  });
  return outputArray;
}

function AnswerOptions({
  answerArray,
  answerGiven,
  correctAnswer,
  onAnswerSelected,
}: {
  answerArray: Array<string>;
  answerGiven: string;
  correctAnswer: string;
  onAnswerSelected: (answer: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-5 sm:mt-2 sm:grid-flow-row-dense">
      {answerArray.map((answer) => (
        <AnswerOption
          key={answer}
          answerText={answer}
          answerGiven={answerGiven}
          correctAnswer={correctAnswer}
          onAnswerSelected={onAnswerSelected}
        />
      ))}
    </div>
  );
}

function AnswerOption({
  answerText,
  answerGiven,
  correctAnswer,
  onAnswerSelected,
}: {
  answerText: string;
  answerGiven: string;
  correctAnswer: string;
  onAnswerSelected: (answer: string) => void;
}) {
  return (
    <span
      className={classNames(
        // Not answered
        !answerGiven ? "border-gray-300 cursor-pointer" : "cursor-default",
        // Answered incorrectly, gave a different answer & this is correct
        answerGiven &&
          answerGiven !== correctAnswer &&
          answerText === correctAnswer &&
          "outline-none ring-1 ring-green-500 border-green-500",
        // Answered incorrectly & this is incorrect
        answerGiven &&
          answerGiven !== correctAnswer &&
          answerText !== correctAnswer &&
          "outline-none ring-1 ring-red-500 border-red-500",
        // Gave different answer / unanswered
        answerGiven !== answerText && "bg-white hover:bg-gray-50",
        // Gave this answer & correct
        answerGiven === answerText &&
          answerGiven === correctAnswer &&
          "bg-green-500",
        // Gave this answer & incorrect
        answerGiven === answerText &&
          answerGiven !== correctAnswer &&
          "bg-red-500",
        "z-0 shadow-sm flex justify-around inline-flex justify-center items-center px-4 py-3 border rounded-md text-sm font-medium text-gray-700 "
      )}
      onClick={
        answerGiven === null ? () => onAnswerSelected(answerText) : () => {}
      }
    >
      {answerGiven === answerText && answerGiven === correctAnswer ? (
        <>
          <p className="text-2xl leading-5">🎉</p>
          <QuestionText text={answerText} />
          <p className="text-2xl leading-5">🎉</p>
        </>
      ) : (
        <QuestionText text={answerText} />
      )}
    </span>
  );
}
