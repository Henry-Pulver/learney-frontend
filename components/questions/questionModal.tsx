import React, { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AcademicCapIcon } from "@heroicons/react/outline";
import { InlineMath, BlockMath } from "react-katex";
import { handleFetchResponses, isEven, isNumeric } from "../../lib/utils";
import { classNames } from "../../lib/reactUtils";
import { NextArrow } from "../svgs/icons";
import { jsonHeaders } from "../../lib/headers";
import { AnswersGiven, ProgressDots } from "./progressDots";
import { QuestionSet } from "../../lib/questions";

export default function QuestionModal({
  questionSet,
  modalShown,
  closeModal,
  onCompletion,
  backendUrl,
  userId,
  sessionId,
}: {
  questionSet: QuestionSet;
  modalShown: boolean;
  closeModal: () => void;
  onCompletion: (answersGiven: AnswersGiven, questionSet: QuestionSet) => void;
  backendUrl: string;
  userId: string;
  sessionId: string;
}) {
  const [answersGiven, setAnswersGiven] = useState<AnswersGiven>(
    questionSet.map(() => undefined)
  );
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
    handleFetchResponses(questionResponse, backendUrl);
  };

  const currentStepRef = useRef(null);

  return (
    <Transition.Root show={modalShown} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        initialFocus={currentStepRef}
        onClose={closeModal}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            {/*Model contents*/}
            {currentQuestionIndex in questionSet && ( // <-- Crushes a rare bug
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <ProgressDots
                    questionSet={questionSet}
                    answersGiven={answersGiven}
                    currentQuestionIndex={currentQuestionIndex}
                    currentStepRef={currentStepRef}
                  />
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
                    <div className="mt-6 text-black">
                      <QuestionText
                        text={questionSet[currentQuestionIndex].question_text}
                      />
                    </div>
                    <AnswerOptions
                      answerArray={
                        questionSet[currentQuestionIndex]
                          .answers_order_randomised
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
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
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
              </div>
            )}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function QuestionText({ text, className = "" }) {
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

function InlineTextAndMath({ text }) {
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

function PureTextBlock(text) {
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
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-5 sm:mt-6 sm:grid-flow-row-dense">
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
        "z-0 shadow-sm inline-flex justify-center items-center px-4 py-3 border rounded-md text-sm font-medium text-gray-700 "
      )}
      onClick={
        answerGiven === null ? () => onAnswerSelected(answerText) : () => {}
      }
    >
      {answerGiven === answerText && answerGiven === correctAnswer ? (
        <>
          <p>🎉</p> <QuestionText text={answerText} /> <p>🎉</p>
        </>
      ) : (
        <QuestionText text={answerText} />
      )}
    </span>
  );
}
