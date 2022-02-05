import React from "react";
import { classNames } from "../../lib/reactUtils";
import { CheckIcon, XIcon } from "@heroicons/react/outline";
import { QuestionArray, AnswersGiven } from "./types";

export function ProgressDots({
  questionSet: questionArray,
  answersGiven,
  currentQIndex,
  currentStepRef,
  maxSteps,
}: {
  questionSet: QuestionArray;
  answersGiven: AnswersGiven;
  currentQIndex: number;
  currentStepRef;
  maxSteps: number;
}) {
  if (questionArray.length < 1) return <></>;
  else {
    return (
      <nav
        aria-label="Progress"
        className="my-4 flex items-center justify-center w-full"
      >
        <ol role="list" className="flex justify-center">
          {/*@ts-ignore*/}
          {[...Array(maxSteps).keys()].map((questionIdx) => (
            <li
              key={questionIdx}
              className="flex justify-center items-center place-items-center"
            >
              {currentQIndex >= questionIdx ? (
                <PastOrCurrentProgressDot
                  past={currentQIndex > questionIdx}
                  correct={
                    answersGiven[questionIdx]
                      ? answersGiven[questionIdx] ===
                        questionArray[questionIdx].correct_answer
                      : null
                  }
                  currentStepRef={currentStepRef}
                  className={maxSteps <= 5 ? "w-8 h-8" : "w-6 h-6"}
                />
              ) : (
                <FutureProgressDot
                  className={maxSteps <= 5 ? "w-8 h-8" : "w-6 h-6"}
                />
              )}
              {questionIdx < maxSteps - 1 && (
                <div
                  className={classNames(
                    maxSteps === 2 && "w-32",
                    maxSteps === 3 && "w-20",
                    maxSteps === 4 && "w-16",
                    maxSteps === 5 && "w-14",
                    maxSteps === 6 && "w-10",
                    maxSteps > 6 && "w-5",
                    "h-0.5 flex items-center bg-gray-200"
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
}

function PastOrCurrentProgressDot(props: {
  past: boolean;
  correct: boolean | null;
  currentStepRef: React.RefObject<HTMLElement>;
  className?: string;
}) {
  return (
    <>
      {props.past ? (
        props.correct ? (
          <CorrectPastProgressDot className={props.className} />
        ) : (
          <IncorrectPastProgressDot className={props.className} />
        )
      ) : props.correct === null ? (
        <UnansweredCurrentProgressDot
          className={props.className}
          currentStepRef={props.currentStepRef}
        />
      ) : props.correct ? (
        <CorrectCurrentProgressDot
          className={props.className}
          currentStepRef={props.currentStepRef}
        />
      ) : (
        <IncorrectCurrentProgressDot className={props.className} />
      )}
    </>
  );
}

function CorrectPastProgressDot(props: { className?: string }) {
  return (
    <div
      className={classNames(
        props.className,
        "relative w-7 h-7 flex items-center justify-center bg-green-600 rounded-full"
      )}
    >
      <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
      <span className="sr-only">Correct past question</span>
    </div>
  );
}

function IncorrectPastProgressDot(props: { className?: string }) {
  return (
    <div
      className={classNames(
        props.className,
        "relative w-7 h-7 flex items-center justify-center bg-red-600 rounded-full"
      )}
    >
      <XIcon className="w-5 h-5 text-white" aria-hidden="true" />
      <span className="sr-only">Incorrect past question</span>
    </div>
  );
}

function UnansweredCurrentProgressDot(props: {
  currentStepRef;
  className?: string;
}) {
  return (
    <div
      ref={props.currentStepRef}
      className={classNames(
        props.className,
        "relative w-7 h-7 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full"
      )}
      aria-current="step"
    >
      <span
        className="h-2.5 w-2.5 bg-blue-600 rounded-full"
        aria-hidden="true"
      />
      <span className="sr-only">Unanswered current question</span>
    </div>
  );
}

function CorrectCurrentProgressDot(props: {
  currentStepRef;
  className?: string;
}) {
  return (
    <div
      ref={props.currentStepRef}
      className={classNames(
        props.className,
        "relative w-7 h-7 flex items-center justify-center bg-green-200 rounded-full"
      )}
    >
      <CheckIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
      <span className="sr-only">Correct current question</span>
    </div>
  );
}

function IncorrectCurrentProgressDot(props: { className?: string }) {
  return (
    <div
      className={classNames(
        props.className,
        "relative w-7 h-7 flex items-center justify-center bg-red-200 rounded-full"
      )}
    >
      <XIcon className="w-5 h-5 text-red-600" aria-hidden="true" />
      <span className="sr-only">Incorrect current question</span>
    </div>
  );
}

function FutureProgressDot(props: { className?: string }) {
  return (
    <div
      className={classNames(
        props.className,
        "group relative w-7 h-7 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full"
      )}
    >
      <span
        className="h-2.5 w-2.5 bg-transparent rounded-full"
        aria-hidden="true"
      />
      <span className="sr-only">Future question</span>
    </div>
  );
}
