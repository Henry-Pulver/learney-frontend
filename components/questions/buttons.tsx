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
          onClick={props.buttonPressFunction(() => {
            setReportModalOpen(true);
          }, "Report question button")}
        >
          <ExclamationIcon className="h-7 w-7" />
        </button>
      </Tippy>
      <Modal
        open={reportModalOpen}
        setClosed={() => setReportModalOpen(false)}
        modalClassName="items-center"
        dialogClassName="sm:z-20"
        contentClassName="md:max-w-3xl"
      >
        {/*<Modal open={false} setClosed={() => {}}>*/}
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:text-left md:my-auto">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {"You're a hero for reporting mistakes!"}
            </Dialog.Title>
          </div>
        </div>
        <div className="mt-2">What&apos;s the problem?</div>
        <div className="mt-4 grid grid-cols-2 grid-rows-2 gap-2 sm:grid-cols-4 sm:grid-rows-1">
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
              <label className="text-sm text-gray-700 sm:text-base">
                Add a message (optional)
              </label>
            </div>
            <textarea
              className="block h-32 w-full resize-none rounded-md border-gray-300 shadow-sm transition duration-200 ease-in-out focus:border-yellow-500 focus:ring-yellow-500 sm:text-lg"
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
        "btn-md btn-2-yellow justify-center px-3 text-center"
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
