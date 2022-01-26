import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { AcademicCapIcon } from "@heroicons/react/outline";
import { InlineMath, BlockMath } from "react-katex";
import { handleFetchResponses, isEven, isNumeric } from "../../lib/utils";
import { classNames } from "../../lib/reactUtils";
import { NextArrow } from "../svgs/icons";
import { jsonHeaders } from "../../lib/headers";
import {
  AnswersGiven,
  Question,
  QuestionSet,
  emptyQuestionSet,
  QuestionSetResponse,
  AnswerResponse,
} from "./types";
import { ReportQuestionButton } from "./buttons";
import { ButtonPressFunction } from "../../lib/types";
import Modal from "../modal";
import ProgressBar, { realPercentageToProgress } from "./progressBars";

export default function QuestionModal({
  modalShown,
  closeModal,
  onCompletion,
  conceptId,
  backendUrl,
  userId,
  sessionId,
  buttonPressFunction,
}: {
  modalShown: boolean;
  closeModal: () => void;
  onCompletion: (
    newKnowledgeLevel: number,
  ) => void;
  conceptId: string;
  backendUrl: string;
  userId: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [questionSet, setQuestionSet] = useState<QuestionSet>({
    ...emptyQuestionSet,
  });
  const [knowledgeLevel, setKnowledgeLevel] = useState<number>(null);
  const [answersGiven, setAnswersGiven] = useState<AnswersGiven>([]);
  const [progressBarPercentageFilled, setProgressBarPercentageFilled] =
    useState<number>(0);
  const [currentQidx, setCurrentQidx] = useState<number>(0);

  const getNewQuestionSet = async () => {
    const questionResponse = await fetch(`${backendUrl}/api/v0/question_set`, {
      method: "GET",
      headers: jsonHeaders,
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        concept_id: conceptId,
      }),
    });
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as QuestionSetResponse;

    if (responseJson.answers_given.length > 0) {
      // Returning to a question set, some questions may be answered
      setAnswersGiven([...responseJson.answers_given]);
      setCurrentQidx(responseJson.questions.length - 1);
    }
    delete responseJson.answers_given;

    setQuestionSet(responseJson as QuestionSet);
  };

  useEffect(() => {
    if (modalShown && questionSet.concept_id !== conceptId) getNewQuestionSet();
  }, [modalShown]);

  const getNextQuestion = async () => {
    const questionResponse = await fetch(`${backendUrl}/api/v0/questions`, {
      method: "GET",
      headers: jsonHeaders,
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        concept_id: conceptId,
        question_set_id: questionSet.id,
      }),
    });
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as Question;
    setQuestionSet({
      ...questionSet,
      questions: [...questionSet.questions, responseJson],
    });
  };

  useEffect(() => {
    if (questionSet.id) getNextQuestion();
  }, [answersGiven]);

  useEffect(() => {
    if (questionSet.questions.length === 0) {
      setAnswersGiven([]);
      setCurrentQidx(0);
    }
  }, [questionSet]);

  const onAnswerClick = async (answerText: string) => {
    setAnswersGiven([...answersGiven, answerText]);
    // Tell the backend about the answer given
    const questionResponse = await fetch(
      `${backendUrl}/api/v0/question_response`,
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          question: questionSet.id,
          response: answerText,
          correct:
            answerText ===
            questionSet.questions[questionSet.questions.length - 1]
              .correct_answer,
        }),
      }
    );
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as AnswerResponse;
    setProgressBarPercentageFilled(
      realPercentageToProgress(
        questionSet.questions,
        answersGiven,
        responseJson.level,
        responseJson.completed,
        progressBarPercentageFilled
      )
    );
    setQuestionSet({...questionSet, completed: responseJson.completed});
    setKnowledgeLevel(responseJson.level);
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
        {questionSet.id && ( // <-- Crushes a rare bug
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
                  {`Question ${currentQidx + 1}`}
                </Dialog.Title>
                <div className="mt-6 mb-4 text-black">
                  <QuestionText
                    text={questionSet.questions[currentQidx].question_text}
                  />
                </div>
                {/* TODO: Decide on report question button placement */}
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
                    questionSet.questions[currentQidx].answers_order_randomised
                  }
                  answerGiven={
                    answersGiven.length > currentQidx
                      ? answersGiven[currentQidx]
                      : null
                  }
                  correctAnswer={
                    questionSet.questions[currentQidx].correct_answer
                  }
                  onAnswerSelected={onAnswerClick}
                />
              </div>
            </div>
            {/*FEEBACK*/}
            {answersGiven.length > currentQidx && // Check that the question has been answered
              answersGiven[currentQidx] !==
                questionSet.questions[currentQidx].correct_answer && // Check that the answer is incorrect
              questionSet.questions[currentQidx].feedback && ( // Check that there is some feedback
                <div className="bg-gray-200 text-black py-2 my-2 rounded-sm text-center">
                  <h3 className="text-lg pt-2 font-semibold">Feedback</h3>
                  <QuestionText text={questionSet[currentQidx].feedback} />
                </div>
              )}
            {/*NEXT QUESTION BUTTON*/}
            <div className="mt-5 sm:mt-4 flex justify-between">
              <ReportQuestionButton
                question={questionSet[currentQidx]}
                buttonPressFunction={buttonPressFunction}
                backendUrl={backendUrl}
                userId={userId}
              />
              {/* TODO: Remove below button unless question is got wrong? */}
              <button
                className={classNames(
                  answersGiven.length > currentQidx
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-gray-300 cursor-default",
                  "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                )}
                onClick={
                  answersGiven.length <= currentQidx // Deactivated as question not yet answered
                    ? () => {}
                    : questionSet.completed
                    ? () => setCurrentQidx((prevState) => prevState + 1)
                    : () => onCompletion(knowledgeLevel)
                }
              >
                {!questionSet.completed ? "Next Question" : "Complete"}
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
