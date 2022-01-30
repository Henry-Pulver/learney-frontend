import React, { useEffect, useRef, useState } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { handleFetchResponses, isEven, isNumeric } from "../../lib/utils";
import { classNames } from "../../lib/reactUtils";
import { NextArrow } from "../svgs/icons";
import { jsonHeaders } from "../../lib/headers";
import {
  AnswersGiven,
  QuestionSet,
  Completed,
  emptyQuestionSet,
  QuestionSetResponse,
  AnswerResponse,
} from "./types";
import { ReportQuestionButton } from "./buttons";
import { ButtonPressFunction } from "../../lib/types";
import Modal from "../modal";
import { LevelsProgressBar } from "./progressBars";
import { LoadingSpinner } from "../animations";

export default function QuestionModal({
  modalShown,
  closeModal,
  knowledgeLevel,
  setKnowledgeLevel,
  maxKnowledgeLevel,
  onCompletion,
  conceptId,
  backendUrl,
  userId,
  sessionId,
  buttonPressFunction,
}: {
  modalShown: boolean;
  closeModal: () => void;
  knowledgeLevel: number;
  setKnowledgeLevel: (knowledgeLevel: number) => void;
  maxKnowledgeLevel: number;
  onCompletion: (conceptCompleted: Completed) => void;
  conceptId: string;
  backendUrl: string;
  userId: string;
  sessionId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [questionSet, setQuestionSet] = useState<QuestionSet>({
    ...emptyQuestionSet,
  });
  const [nextQuestionPressed, setNextQuestionPressed] =
    useState<boolean>(false);
  const [answersGiven, setAnswersGiven] = useState<AnswersGiven>([]);
  const [currentQidx, setCurrentQidx] = useState<number>(0);

  const getNewQuestionSet = async () => {
    const questionResponse = await fetch(
      `${backendUrl}/api/v0/question_set?` +
        new URLSearchParams({
          user_id: userId,
          session_id: sessionId,
          concept_id: conceptId,
        }),
      {
        method: "GET",
        headers: jsonHeaders,
      }
    );
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
  useEffect(() => {
    console.log(questionSet);
    if (nextQuestionPressed && questionSet.questions.length - 1 > currentQidx) {
      setNextQuestionPressed(false);
      setCurrentQidx((prevState) => prevState + 1);
    }
  }, [questionSet, nextQuestionPressed]);

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
          question_set: questionSet.id,
          concept_id: conceptId,
          response: answerText,
          correct:
            answerText ===
            questionSet.questions[questionSet.questions.length - 1]
              .correct_answer,
          session_id: sessionId,
        }),
      }
    );
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as AnswerResponse;
    console.log(responseJson);
    const questions = [...questionSet.questions];
    if (responseJson.next_question) questions.push(responseJson.next_question);
    setQuestionSet({
      ...questionSet,
      questions: [...questions],
      completed: responseJson.completed,
    });
    setKnowledgeLevel(responseJson.level);
  };

  const currentStepRef = useRef(null);

  return (
    <Modal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="items-center"
      contentClassName="max-h-excl-toolbar sm:max-w-2xl sm:p-8 sm:pb-4"
    >
      <div className="flex justify-center">
        {questionSet.id ? ( // <-- Stops a bug when loading questionSet
          <>
            <div className="w-full flex flex-col">
              <div className="w-full flex justify-center">
                <LevelsProgressBar knowledgeLevel={knowledgeLevel} />
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
                {/*<div className="my-8 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">*/}
                {/*  <AcademicCapIcon*/}
                {/*    className="h-6 w-6 text-blue-600"*/}
                {/*    aria-hidden="true"*/}
                {/*  />*/}
                {/*</div>*/}
                {/*<Dialog.Title*/}
                {/*  as="h3"*/}
                {/*  className="text-lg leading-6 font-medium text-gray-900"*/}
                {/*>*/}
                {/*  {`Question ${currentQidx + 1}`}*/}
                {/*</Dialog.Title>*/}
                <div className="w-full flex flex-row justify-center my-8">
                  <div className="max-w-lg text-black text-lg">
                    <QuestionText
                      text={questionSet.questions[currentQidx].question_text}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <AnswerOptions
                    answerArray={
                      questionSet.questions[currentQidx]
                        .answers_order_randomised
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
                  <div className="flex justify-center">
                    <div className="bg-gray-200 text-black px-6 py-4 my-6 rounded text-center max-w-xl">
                      {/*<h3 className="text-lg font-semibold">Feedback</h3>*/}
                      <QuestionText
                        text={questionSet.questions[currentQidx].feedback}
                      />
                    </div>
                  </div>
                )}
              {/*NEXT QUESTION BUTTON*/}
              <div className="flex justify-center">
                <div className="mt-5 sm:mt-6 flex justify-between w-full max-w-lg">
                  <ReportQuestionButton
                    question={questionSet.questions[currentQidx]}
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
                      answersGiven.length <= currentQidx || nextQuestionPressed // Deactivated as question not yet answered
                        ? () => {}
                        : !questionSet.completed
                        ? () => setNextQuestionPressed(true)
                        : () => onCompletion(questionSet.completed)
                    }
                  >
                    {nextQuestionPressed ? (
                      <LoadingSpinner classes="w-5 h-5 py-0.5 mx-9" />
                    ) : !questionSet.completed ? (
                      "Next Question"
                    ) : (
                      "Complete"
                    )}
                    <NextArrow />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-96 grid justify-center content-center">
            <LoadingSpinner classes="w-20 h-20" />
          </div>
        )}
      </div>
    </Modal>
  );
}

("In matrix addition, each element is added to the corresponding element in the other matrix.\nIn this case, that means:\n/$$\begin{bmatrix}0 + 7&10 + 6\\7 + 9&9 + 1 end{bmatrix}$$/\nLeading to:\n/$$\begin{bmatrix}7&16\\16&10 end{bmatrix}$$/");

function QuestionText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  if (isNumeric(text)) text = "$$" + text + "$$";
  const questionTextArr = [];

  const blockLatexDivs = text.split("/$$");
  blockLatexDivs.forEach((textBlock, idx) => {
    if (idx === 0) {
      questionTextArr.push(<InlineTextAndMath key={idx} text={textBlock} />);
    } else {
      const nestedDivs = textBlock.split("$$/");
      nestedDivs.forEach((nestedText, indx) => {
        if (isEven(indx)) {
          questionTextArr.push(
            <BlockMath key={`${idx}-${indx}`}>{nestedText}</BlockMath>
          );
        } else {
          questionTextArr.push(
            <InlineTextAndMath key={`${idx}-${indx}`} text={nestedText} />
          );
        }
      });
    }
  });
  return (
    <div className={`${className} whitespace-pre-line`}>{questionTextArr}</div>
  );
}

function InlineTextAndMath({ text }: { text: string }) {
  const outputArray = [];
  text.split("$$").forEach((textBlock, index) => {
    if (isEven(index)) {
      // outputArray.push(...PureTextBlock(textBlock));
      outputArray.push(textBlock);
    } else {
      outputArray.push(<InlineMath key={index}>{textBlock}</InlineMath>);
    }
  });
  return <div>{outputArray}</div>;
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
    <div className="w-full max-w-md grid grid-cols-2 gap-3 mt-5 sm:mt-2 sm:grid-flow-row-dense">
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
