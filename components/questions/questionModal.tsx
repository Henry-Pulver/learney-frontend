import React, { useEffect, useRef, useState } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { handleFetchResponses, isEven, isNumeric } from "../../lib/utils";
import { classNames } from "../../lib/reactUtils";
import { NextArrow } from "../svgs/icons";
import { jsonHeaders } from "../../lib/headers";
import Markdown from "marked-react";
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
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";

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
    setNextQuestionPressed(false); // if this is true, it'll jump currentQidx to 1 when questionSet is loaded
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
  };

  useEffect(() => {
    if (modalShown && questionSet.concept_id !== conceptId) getNewQuestionSet();
  }, [modalShown]);

  useEffect(() => {
    console.log(
      "Num questions loaded",
      questionSet.questions.length,
      "Num questions asked",
      answersGiven.length
    );
    if (
      nextQuestionPressed &&
      (questionSet.completed ||
        (questionSet.questions.length - 1 > currentQidx &&
          questionSet.max_num_questions - 1 > currentQidx))
    ) {
      if (!questionSet.completed) {
        setNextQuestionPressed(false);
        setCurrentQidx((prevState) => prevState + 1);
      } else if (questionSet.completed === "completed_concept") {
        // Answers and current Question id reset automagically when the question set is emptied
        setTimeout(() => {
          setNextQuestionPressed(false);
          onCompletion(
            questionSet.completed,
            knowledgeLevel - questionSet.initial_knowledge_level
          );
          setQuestionSet({ ...emptyQuestionSet });
        }, 2000);
      } else {
        setNextQuestionPressed(false);
        onCompletion(
          questionSet.completed,
          knowledgeLevel - questionSet.initial_knowledge_level
        );
        setQuestionSet({ ...emptyQuestionSet });
      }
    }
  }, [questionSet, nextQuestionPressed]);
  useEffect(() => setFeedbackExpanded(false), [nextQuestionPressed]);

  useEffect(() => {
    if (questionSet.questions.length === 0) {
      setCurrentQidx(0);
      setAnswersGiven([]);
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
      return;
    } else {
      setKnowledgeLevel(responseJson.level);
      if (responseJson.next_questions.length > 0) {
        setQuestionSet((prevQuestionSet) => ({
          ...prevQuestionSet,
          questions: [
            ...prevQuestionSet.questions,
            ...responseJson.next_questions,
          ],
          completed: responseJson.completed,
        }));
      } else {
        setQuestionSet((prevQuestionSet) => ({
          ...prevQuestionSet,
          completed: responseJson.completed,
        }));
      }
    }
  };

  const [loadingMessage, setLoadingMessage] = useState<string>(null);
  useEffect(() => {
    // When the question batch is loading, change the message every 3 seconds
    if (
      !(
        questionSet.id &&
        !(
          questionSet.completed &&
          isCorrectArray(answersGiven, questionSet)[currentQidx]
        )
      )
    )
      setTimeout(() => setLoadingMessage(randomLoadingMessage()), 1500);
  }, [modalShown, loadingMessage]);

  const [feedbackExpanded, setFeedbackExpanded] = useState<boolean>(false);

  const currentStepRef = useRef(null);

  const colorMap = {
    Easy: "text-green-600 bg-green-100",
    Medium: "text-yellow-500 bg-yellow-100",
    Hard: "text-red-600 bg-red-100",
  };

  const getDifficultyLevel = (difficultyNumber: number) => {
    const eachLevelSpread = maxKnowledgeLevel / 3;
    if (difficultyNumber <= eachLevelSpread) {
      return "Easy";
    } else if (difficultyNumber <= 2 * eachLevelSpread) {
      return "Medium";
    } else if (difficultyNumber <= maxKnowledgeLevel) {
      return "Hard";
    }
    return "Hard";
  };
  return (
    <NotFullScreenModal
      open={modalShown}
      initialFocus={currentStepRef}
      setClosed={closeModal}
      modalClassName="h-full flex-col items-center"
      contentClassName={classNames(
        questionSet.completed &&
          nextQuestionPressed &&
          isCorrectArray(answersGiven, questionSet)[currentQidx] &&
          "bg-green-500 transition-colors duration-1000 ease-in-out",
        questionSet.questions.length > 0 &&
          isCorrectArray(answersGiven, questionSet)[currentQidx] &&
          !feedbackExpanded &&
          "overflow-y-hidden", // Stops tricky bug where a scroll bar shows up for the question modal unnecessarily
        "max-h-excl-toolbar sm:max-w-2xl sm:p-8 sm:pb-4"
      )}
    >
      <div className="flex justify-center">
        {questionSet.id && // <-- Stops a bug when loading questionSet
        !(questionSet.completed && nextQuestionPressed) ? (
          <>
            <div
              className={classNames(
                "absolute top-4 left-4 w-20 rounded-full border border-solid  border-stone-200 text-base",
                colorMap[
                  getDifficultyLevel(
                    questionSet.questions[currentQidx].difficulty
                  )
                ]
              )}
            >
              {getDifficultyLevel(
                questionSet.questions[currentQidx].difficulty
              )}
            </div>
            <div className="flex w-full flex-col">
              <ProgressDots
                questionArray={questionSet.questions}
                answersGiven={answersGiven}
                currentQIndex={currentQidx}
                currentStepRef={currentStepRef}
                maxSteps={questionSet.max_num_questions}
              />
              <div className="mt-3 text-left sm:mt-5">
                <div className="my-8 flex w-full flex-row justify-center">
                  <div className="max-w-lg text-lg text-black">
                    <QuestionText
                      text={
                        questionSet.questions.length > currentQidx &&
                        questionSet.questions[currentQidx].question_text
                      }
                    />
                  </div>
                </div>
                <div className="flex w-full justify-center">
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
              {/* FEEDBACK */}
              {answersGiven.length > currentQidx && // Check that the question has been answered
                questionSet.questions[currentQidx].feedback && ( // Check that there is some feedback
                  <div className="flex justify-center">
                    <div className="my-6 max-w-full rounded bg-gray-200 px-4 py-4 text-left text-black md:px-6 xl:max-w-xl">
                      {!isCorrectArray(answersGiven, questionSet)[
                        currentQidx
                      ] ? ( // If incorrect, simply show the feedback
                        <QuestionText
                          text={questionSet.questions[currentQidx].feedback}
                        />
                      ) : (
                        // If correct, show the feedback with a dropdown toggle
                        <div
                          className={classNames("relative z-10")}
                          onClick={
                            !feedbackExpanded
                              ? buttonPressFunction(
                                  () => setFeedbackExpanded(true),
                                  "Map Title Anywhere (Expand)"
                                )
                              : buttonPressFunction(() => {},
                                "Map Title Anywhere (Invalid)")
                          }
                        >
                          <QuestionText
                            text={questionSet.questions[currentQidx].feedback}
                            className={classNames(
                              "whitespace-pre-line py-1 text-lg text-gray-700",
                              !feedbackExpanded &&
                                "max-h-8 overflow-hidden text-ellipsis whitespace-nowrap pr-8"
                            )}
                          />
                          {questionSet.questions[currentQidx].feedback.length >
                            64 && (
                            <div className="absolute -right-2 -bottom-2">
                              <button
                                className="gray-icon-btn-no-padding z-20 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-600"
                                onClick={buttonPressFunction((e) => {
                                  e.stopPropagation(); // Stops parent div's onClick function from being called!
                                  setFeedbackExpanded((expanded) => !expanded);
                                }, "Expand/Minimise Correct   Question Feedback")}
                              >
                                <span className="sr-only">
                                  {feedbackExpanded
                                    ? "Minimise description"
                                    : "Expand description"}
                                </span>
                                {feedbackExpanded ? (
                                  <ChevronUpIcon className="h-7 w-7" />
                                ) : (
                                  <ChevronDownIcon className="h-7 w-7" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              {/*NEXT QUESTION BUTTON*/}
              <div className="flex justify-center">
                <div className="mt-5 flex w-full max-w-2xl justify-between sm:mt-6">
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
                        ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
                        : "cursor-default bg-gray-300",
                      "inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    )}
                    onClick={
                      answersGiven.length <= currentQidx || // Deactivated as question not yet answered
                      nextQuestionPressed
                        ? () => {}
                        : () => setNextQuestionPressed(true)
                    }
                  >
                    {nextQuestionPressed ? (
                      <LoadingSpinner classes="w-5 h-5 py-0.5 mx-9" />
                    ) : questionSet.max_num_questions ===
                      answersGiven.length ? (
                      "Complete"
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
          questionSet.completed === "completed_concept" ? (
          <div className="grid h-96 w-full content-center justify-center">
            <div className="text-4xl font-bold text-white">
              🎉 Congratulations! 🎉
            </div>
            <div className="text-2xl text-white">
              You&apos;ve reached expert level at &lsquo;
              {window.cy.getElementById(conceptId).data().name}&rsquo;
            </div>
          </div>
        ) : (
          <div className="grid h-96 w-full content-center justify-center">
            <div className="flex flex-col place-items-center gap-y-4 text-xl">
              <LoadingSpinner classes="w-20 h-20" />
              {loadingMessage}
            </div>
          </div>
        )}
      </div>
    </NotFullScreenModal>
  );
}

export function QuestionText({
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
      questionTextArr.push(<InlineTextMathImg key={idx} text={textBlock} />);
    } else {
      const nestedDivs = textBlock.split("$$/");
      nestedDivs.forEach((nestedText, indx) => {
        if (isEven(indx)) {
          questionTextArr.push(
            <BlockMath key={`${idx}-${indx}`}>{nestedText}</BlockMath>
          );
        } else {
          questionTextArr.push(
            <InlineTextMathImg key={`${idx}-${indx}`} text={nestedText} />
          );
        }
      });
    }
  });
  return (
    <div className={`${className} whitespace-pre-line`}>{questionTextArr}</div>
  );
}

function InlineTextMathImg({ text }: { text: string }) {
  const outputArray = [];
  const splitTextImg = text.split(/(<img [^/][^>]+\s+\/>)/);
  // Split into text and imgs
  splitTextImg.forEach((block, idx) => {
    if (block) {
      // .split() returns empty string between two matches - ignore these
      const isImgRegex = block.match("<img (.*\\S\\s)\\s*/>");
      if (isImgRegex) {
        const params = parseParams(isImgRegex[1]);
        const imgEle = (
          <img
            key={params.src}
            src={params.src}
            className={params.className}
            alt={params.alt}
          />
        );
        // Add <img/> tags to one horizontal div if they're adjacent!
        if (Array.isArray(outputArray[outputArray.length - 1]))
          outputArray[outputArray.length - 1].push(imgEle);
        else outputArray.push([imgEle]);
      } else {
        block.split("$$").forEach((textBlock, index) => {
          if (isEven(index)) {
            const textSplitByLine = textBlock.split("\n");
            // Markdown removes extra line-breaks, so we want to add them back
            textSplitByLine.forEach((text, idx) => {
              if (text)
                outputArray.push(
                  <p id="md" className="inline">
                    <Markdown>{text}</Markdown>
                  </p>
                );
              if (idx < textSplitByLine.length - 1) outputArray.push(<br />);
            });
          } else {
            outputArray.push(
              <InlineMath key={`${idx}_${index}`}>{textBlock}</InlineMath>
            );
          }
        });
      }
    }
  });
  return (
    <div>
      {outputArray.map((el) => {
        if (Array.isArray(el))
          return (
            <div className="flex flex-row justify-around">
              {el.map((el) => el)}
            </div>
          );
        else return el;
      })}
    </div>
  );
}

function parseParams(params: string): {
  src?: string;
  className?: string;
  alt?: string;
} {
  const paramsObj = {};
  const paramRegex = {
    src: /src=("\S*"|'\S*')/,
    className: /className=("[^"]*"|'[^']*')/,
    alt: /alt=(".*"|'.*')\s+/,
  };
  Object.entries(paramRegex).forEach(([key, regex]) => {
    const match = params.match(regex);
    if (match) paramsObj[key] = match[1].slice(1, -1);
  });
  return paramsObj;
}

export function AnswerOptions({
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
    <div className="mt-5 grid w-full max-w-md grid-cols-2 gap-3 sm:mt-2 sm:grid-flow-row-dense">
      {answerArray.map((answer, idx) => (
        <AnswerOption
          key={idx}
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
        !answerGiven ? "cursor-pointer border-gray-300" : "cursor-default",
        // Answered incorrectly, gave a different answer & this is correct
        answerGiven &&
          answerGiven !== correctAnswer &&
          answerText === correctAnswer &&
          "border-green-500 outline-none ring-1 ring-green-500",
        // Answered incorrectly & this is incorrect
        answerGiven &&
          answerGiven !== correctAnswer &&
          answerText !== correctAnswer &&
          "border-red-500 outline-none ring-1 ring-red-500",
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
        "z-0 flex inline-flex items-center justify-center justify-around rounded-md border px-4 py-3 text-sm font-medium text-gray-700 shadow-sm "
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

function randomLoadingMessage(): string {
  return [
    "Getting the flywheel spinning...",
    "Awakening the elves...",
    "Getting the juices flowing...",
    "Breaking out the highlighters...",
    "Turning on the lights...",
    "Generating more magic!",
    "More cowbell!!",
    "Getting the machines learning...",
    "Paying the elves generously...",
    "Caffeinating the question-writers...",
    "Alerting the gentry...",
    "Calling the cavalry...",
    "Turning up the heat...",
    "Cracking the whip...",
    "Fuelling the flames...",
    "Expanding our minds...",
    "Furiously writing questions...",
    "Blasting off...",
    "Fastening seatbelts...",
    "Putting on sunglasses...",
    "Adding a sprinkle of greatness...",
    "Giving motivational Ted talk...",
    "Seasoning to taste...",
    "Stirring the sauce...",
  ][Math.floor(Math.random() * 24)];
}
