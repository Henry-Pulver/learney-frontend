import React from "react";
import { classNames } from "../../lib/reactUtils";
import { CheckIcon, XIcon } from "@heroicons/react/outline";
import { QuestionArray, AnswersGiven } from "./types";

export function ProgressDots({
  questionSet,
  answersGiven,
  currentQuestionIndex,
  currentStepRef,
}: {
  questionSet: QuestionArray;
  answersGiven: AnswersGiven;
  currentQuestionIndex: number;
  currentStepRef;
}) {
  if (questionSet.length < 2) return <></>;
  else
    return (
      <nav
        aria-label="Progress"
        className="my-4 flex items-center justify-center"
      >
        <ol role="list" className="flex items-center">
          {questionSet.map((question, questionIdx) => (
            <li
              key={questionIdx}
              className={classNames(
                questionIdx !== questionSet.length - 1 ? "pr-8 sm:pr-20" : "",
                "relative"
              )}
            >
              {currentQuestionIndex > questionIdx &&
              answersGiven[questionIdx] ===
                questionSet[questionIdx].correct_answer ? (
                <CorrectPastProgressDot />
              ) : currentQuestionIndex > questionIdx &&
                answersGiven[questionIdx] !==
                  questionSet[questionIdx].correct_answer ? (
                <IncorrectPastProgressDot />
              ) : answersGiven[questionIdx] === null &&
                currentQuestionIndex === questionIdx ? (
                <UnansweredCurrentProgressDot currentStepRef={currentStepRef} />
              ) : answersGiven[questionIdx] ===
                  questionSet[questionIdx].correct_answer &&
                currentQuestionIndex === questionIdx ? (
                <CorrectCurrentProgressDot currentStepRef={currentStepRef} />
              ) : answersGiven[questionIdx] !==
                  questionSet[questionIdx].correct_answer &&
                currentQuestionIndex === questionIdx ? (
                <IncorrectCurrentProgressDot />
              ) : (
                <FutureProgressDot />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
}

function CorrectPastProgressDot() {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-green-600" />
      </div>
      <div className="relative w-8 h-8 flex items-center justify-center bg-green-600 rounded-full">
        <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
        <span className="sr-only">Correct past question</span>
      </div>
    </>
  );
}

function IncorrectPastProgressDot() {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-red-600" />
      </div>
      <div className="relative w-8 h-8 flex items-center justify-center bg-red-600 rounded-full">
        <XIcon className="w-5 h-5 text-white" aria-hidden="true" />
        <span className="sr-only">Incorrect past question</span>
      </div>
    </>
  );
}

function UnansweredCurrentProgressDot({ currentStepRef }) {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div
        ref={currentStepRef}
        className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full"
        aria-current="step"
      >
        <span
          className="h-2.5 w-2.5 bg-blue-600 rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Unanswered current question</span>
      </div>
    </>
  );
}

function CorrectCurrentProgressDot({ currentStepRef }) {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div
        ref={currentStepRef}
        className="relative w-8 h-8 flex items-center justify-center bg-green-200 rounded-full"
      >
        <CheckIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
        <span className="sr-only">Correct current question</span>
      </div>
    </>
  );
}

function IncorrectCurrentProgressDot() {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div className="relative w-8 h-8 flex items-center justify-center bg-red-200 rounded-full">
        <XIcon className="w-5 h-5 text-red-600" aria-hidden="true" />
        <span className="sr-only">Incorrect current question</span>
      </div>
    </>
  );
}

function FutureProgressDot() {
  return (
    <>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="h-0.5 w-full bg-gray-200" />
      </div>
      <div className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full">
        <span
          className="h-2.5 w-2.5 bg-transparent rounded-full"
          aria-hidden="true"
        />
        <span className="sr-only">Future question</span>
      </div>
    </>
  );
}
