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
import { NotFullScreenModal } from "../modal";
import { LoadingSpinner } from "../animations";
import { ProgressDots } from "./progressDots";

export default function QuestionModal({
  modalShown,
  closeModal,
  knowledgeLevel,
  setKnowledgeLevel,
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
  onCompletion: (completed: Completed, levelsGained: number) => void;
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
    const questionBatchResponse = await fetch(
      `${backendUrl}/api/v0/question_batch?` +
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
    const qBatchResponseJson = (await handleFetchResponses(
      questionBatchResponse,
      backendUrl
    )) as QuestionSetResponse;

    if (qBatchResponseJson.answers_given.length > 0) {
      // Returning to a question set, some questions may be answered
      setAnswersGiven([...qBatchResponseJson.answers_given]);
      setCurrentQidx(qBatchResponseJson.answers_given.length);
    }
    delete qBatchResponseJson.answers_given;

    setQuestionSet(qBatchResponseJson as QuestionSet);
    // await getNextQuestion(qBatchResponseJson.id);
  };

  useEffect(() => {
    if (modalShown && questionSet.concept_id !== conceptId) getNewQuestionSet();
  }, [modalShown]);

  useEffect(() => {
    console.log("Num questions", questionSet.questions.length);
    if (nextQuestionPressed && questionSet.questions.length - 1 > currentQidx) {
      setNextQuestionPressed(false);
      setCurrentQidx((prevState) => prevState + 1);
    }
  }, [questionSet, nextQuestionPressed]);

  useEffect(() => {
    if (questionSet.questions.length === 0) {
      setCurrentQidx(0);
      setAnswersGiven([]);
    }
  }, [questionSet]);

  const onAnswerClick = async (answerText: string) => {
    setAnswersGiven([...answersGiven, answerText]);
    console.log(questionSet.questions[currentQidx]);
    console.log(questionSet.questions[currentQidx].id);
    // Tell the backend about the answer given
    const questionResponse = await fetch(
      `${backendUrl}/api/v0/question_response`,
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          question_response_id: questionSet.questions[currentQidx].id,
          user_id: userId,
          question_set: questionSet.id,
          concept_id: conceptId,
          response: answerText,
          correct:
            answerText === questionSet.questions[currentQidx].correct_answer,
          session_id: sessionId,
        }),
      }
    );
    const responseJson = (await handleFetchResponses(
      questionResponse,
      backendUrl
    )) as AnswerResponse;
    if ("response" in responseJson) {
      console.log(responseJson.response);
      return;
    } else {
      if (responseJson.completed) {
        onCompletion(
          responseJson.completed,
          responseJson.level - questionSet.initial_knowledge_level
        );
        // Answers and current Question id reset automagically when the question set is emptied
        setQuestionSet({ ...emptyQuestionSet });
      }
      setKnowledgeLevel(responseJson.level);
      if (responseJson.next_questions.length > 0) {
        const questions = [...questionSet.questions];
        questions.push(...responseJson.next_questions);
        setQuestionSet((prevQuestionSet) => ({
          ...prevQuestionSet,
          questions: [...questions],
          completed: responseJson.completed,
        }));
      }
    }
  };

  const currentStepRef = useRef(null);

  return (
    <NotFullScreenModal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="h-full flex-col items-center"
      contentClassName={classNames(
        questionSet.completed &&
          isCorrectArray(answersGiven, questionSet)[currentQidx] &&
          "bg-green-500 transition-colors duration-1000 ease-in-out",
        "max-h-excl-toolbar sm:max-w-2xl sm:p-8 sm:pb-4"
      )}
    >
      <div className="flex justify-center">
        {questionSet.id && // <-- Stops a bug when loading questionSet
        !(
          questionSet.completed &&
          isCorrectArray(answersGiven, questionSet)[currentQidx]
        ) ? (
          <>
            <div className="w-full flex flex-col">
              <ProgressDots
                questionSet={questionSet.questions}
                answersGiven={answersGiven}
                currentQIndex={currentQidx}
                currentStepRef={currentStepRef}
                maxSteps={questionSet.max_num_questions}
              />
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
                      text={
                        questionSet.questions.length > currentQidx &&
                        questionSet.questions[currentQidx].question_text
                      }
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
                !isCorrectArray(answersGiven, questionSet)[currentQidx] && // Check that the answer is incorrect
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
                  {/* TODO: Only show below button if user got question wrong? */}
                  <button
                    className={classNames(
                      answersGiven.length > currentQidx
                        ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        : "bg-gray-300 cursor-default",
                      "inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    )}
                    onClick={
                      answersGiven.length <= currentQidx || // Deactivated as question not yet answered
                      nextQuestionPressed ||
                      questionSet.completed // Completion happens automagically
                        ? () => {}
                        : () => setNextQuestionPressed(true)
                    }
                  >
                    {nextQuestionPressed || questionSet.completed ? (
                      <LoadingSpinner classes="w-5 h-5 py-0.5 mx-9" />
                    ) : (
                      "Next Question"
                    )}
                    <NextArrow />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : questionSet.completed &&
          isCorrectArray(answersGiven, questionSet)[currentQidx] ? (
          <div className="w-full h-96 grid justify-center content-center">
            <div className="font-bold text-4xl text-white">
              🎉 Congratulations! 🎉
            </div>
            <div className="text-2xl text-white">You completed the quiz.</div>
          </div>
        ) : (
          <div className="w-full h-96 grid justify-center content-center">
            <LoadingSpinner classes="w-20 h-20" />
          </div>
        )}
      </div>
    </NotFullScreenModal>
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

function isCorrectArray(
  answersGiven: AnswersGiven,
  questionSet: QuestionSet
): Array<boolean> {
  return answersGiven.map(
    (answerGiven: string, index: number) =>
      answerGiven === questionSet.questions[index].correct_answer
  );
}
