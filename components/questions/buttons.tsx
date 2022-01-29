import React, { useEffect, useState } from "react";
import { ExclamationIcon } from "@heroicons/react/outline";
import Tippy from "@tippyjs/react";
import Modal from "../modal";
import { Dialog } from "@headlessui/react";
import { classNames } from "../../lib/reactUtils";
import { ButtonPressFunction } from "../../lib/types";
import { jsonHeaders } from "../../lib/headers";
import { handleFetchResponses } from "../../lib/utils";
import { Question } from "./types";

const incorrectQuestion = "Question is incorrect";
const irrelevantQuestion = "Question is irrelevant to concept";
const typoQuestion = "Typo in question";
const otherQuestion = "Other problem";
type ProblemType =
  | ""
  | "Question is incorrect"
  | "Question is irrelevant to concept"
  | "Typo in question"
  | "Other problem";
type ProblemData = {
  type: ProblemType;
  message: string;
};
const emptyProblemData: ProblemData = {
  type: "",
  message: "",
};

export function ReportQuestionButton(props: {
  question: Question;
  userId: string;
  buttonPressFunction: ButtonPressFunction;
  backendUrl: string;
}) {
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [problemData, setProblemData] = useState<ProblemData>(emptyProblemData);
  useEffect(() => {
    setTimeout(
      () =>
        setProblemData((prevData) => {
          return { ...prevData, type: "" };
        }),
      300
    );
  }, [reportModalOpen]);
  return (
    <>
      <Tippy
        content="Report issue with question"
        placement="top"
        theme="dark"
        maxWidth="10em"
        className="text-center"
      >
        <button
          className="red-icon-btn"
          onClick={props.buttonPressFunction(
            () => {
              setReportModalOpen(true);
            },
            // () => {},
            "Report question button"
          )}
        >
          <ExclamationIcon className="h-7 w-7" />
        </button>
      </Tippy>
      <Modal
        open={reportModalOpen}
        setClosed={() => setReportModalOpen(false)}
        modalClassName="items-center"
        contentClassName="md:max-w-3xl"
      >
        {/*<Modal open={false} setClosed={() => {}}>*/}
        <div className="sm:flex sm:items-start">
          <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="md:my-auto mt-3 text-center sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg leading-6 font-medium text-gray-900"
            >
              {"What's the problem?"}
            </Dialog.Title>
          </div>
        </div>
        <div className="mt-4 grid grid-rows-2 grid-cols-2 sm:grid-rows-1 sm:grid-cols-4 gap-2">
          <ProblemTypeButton
            name={incorrectQuestion}
            problemType={problemData.type}
            setProblemType={setProblemData}
          />
          <ProblemTypeButton
            name={irrelevantQuestion}
            problemType={problemData.type}
            setProblemType={setProblemData}
          />
          <ProblemTypeButton
            name={typoQuestion}
            problemType={problemData.type}
            setProblemType={setProblemData}
          />
          <ProblemTypeButton
            name={otherQuestion}
            problemType={problemData.type}
            setProblemType={setProblemData}
          />
        </div>
        <div
          className={classNames(
            problemData.type === "" && "hidden",
            "relative mt-4 flex flex-col"
          )}
        >
          <div>
            <div className="flex flex-row">
              <label className="text-sm sm:text-base text-gray-700">
                Add a message (optional)
              </label>
            </div>
            <textarea
              className="h-32 resize-none transition ease-in-out duration-200 shadow-sm focus:ring-yellow-500 focus:border-yellow-500 block w-full sm:text-lg border-gray-300 rounded-md"
              value={problemData.message}
              onChange={(e) =>
                setProblemData({ ...problemData, message: e.target.value })
              }
              maxLength={8192}
            />
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:justify-center">
            <button
              className="btn-md btn-blue"
              onClick={() => {
                sendQuestionReport(
                  props.question,
                  props.userId,
                  { ...problemData },
                  props.backendUrl
                );
                setReportModalOpen(false);
                setTimeout(() => setProblemData({ ...emptyProblemData }), 300);
              }}
            >
              Report
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ProblemTypeButton(props: {
  name: ProblemType;
  problemType: ProblemType;
  setProblemType;
}) {
  return (
    <button
      className={classNames(
        props.problemType === props.name && "bg-yellow-400 hover:bg-yellow-500",
        props.problemType &&
          props.problemType !== props.name &&
          "bg-white hover:bg-yellow-50",
        "px-3 btn-md text-center justify-center btn-2-yellow"
      )}
      onClick={() =>
        props.setProblemType((prevData) => {
          return { ...prevData, type: props.name };
        })
      }
    >
      {props.name}
    </button>
  );
}

async function sendQuestionReport(
  question: Question,
  userId: string,
  problemData: ProblemData,
  backendUrl: string
): Promise<void> {
  const response = await fetch(`${backendUrl}/api/v0/report_broken_question`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      user_id: userId,
      ...problemData,
      question: question,
    }),
  });
  await handleFetchResponses(response, backendUrl);
}
