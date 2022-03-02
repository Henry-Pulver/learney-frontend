import React, { Fragment, useEffect } from "react";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";
import {
  AnswerOptions,
  QuestionText,
} from "../../components/questions/questionModal";
import { cacheHeaders } from "../../lib/headers";
import {
  emptyQuestion,
  emptyTemplate,
  QuestionEditingResponse,
  Template,
  QuestionType,
} from "../../components/questions/types";
import { PlusIcon, RefreshIcon, SaveIcon } from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { classNames } from "../../lib/reactUtils";
import Tippy from "@tippyjs/react";

export default function TemplateEditor({
  backendUrl,
  templateId,
  templateJson,
}: {
  backendUrl: string;
  templateId: string;
  templateJson: Template;
}) {
  const router = useRouter();
  const [template, setTemplate] = React.useState<Template>({
    ...emptyTemplate,
    ...templateJson,
  });
  const [question, setQuestion] =
    React.useState<QuestionEditingResponse>(emptyQuestion);
  const [answerGiven, setAnswerGiven] = React.useState<string>(null);
  useEffect(() => {
    setAnswerGiven(null);
  }, [question]);

  return (
    <div className="grid h-screen grid-cols-2 gap-x-2 bg-gray-800">
      <div className="flex flex-col justify-around bg-white px-12 py-8">
        <div className="my-1 flex flex-row justify-between">
          <div className="mr-2 flex flex-row place-items-center text-xl">
            Title:{" "}
            <input
              type="text"
              value={template.title}
              className="ml-2 w-full rounded-lg text-xl"
              onChange={(e) => {
                if (e.target.value.length < 255)
                  setTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    title: e.target.value,
                  }));
              }}
            />
          </div>
          <div className="mr-2 flex flex-row place-items-center text-xl">
            Active:{" "}
            <input
              type="checkbox"
              checked={template.active}
              className="ml-2 rounded-lg text-xl"
              onClick={(e) => e.stopPropagation()}
              onChange={() => {
                setTemplate((prevTemplate) => ({
                  ...prevTemplate,
                  active: !prevTemplate.active,
                }));
              }}
            />
          </div>
          <div>
            <Tippy
              placement={"bottom"}
              maxWidth={"14em"}
              content={"Add new question template on this concept!"}
            >
              <button
                className="btn-green p-2"
                onClick={() => {
                  (async () => {
                    const saveResponse = await fetch(
                      `${backendUrl}/api/v0/question_template`,
                      {
                        method: "PUT",
                        headers: cacheHeaders,
                        body: JSON.stringify({ template_id: templateId }),
                      }
                    );
                    const saveJson = (await saveResponse.json()) as {
                      template_id: string;
                    };
                    await router.push(
                      {
                        pathname: router.pathname,
                        query: { templateId: saveJson.template_id },
                      },
                      undefined,
                      { shallow: false }
                    );
                    router.reload();
                  })();
                }}
              >
                <PlusIcon className="h-7 w-7" />
              </button>
            </Tippy>
          </div>
        </div>
        <div className="my-1 flex flex-row justify-between">
          <div className="mr-2 flex flex-row place-items-center text-xl">
            Difficulty:{" "}
            <input
              type="number"
              value={template.difficulty}
              className="ml-2 w-20 rounded-lg"
              onChange={(e) => {
                const difficulty = Number(e.target.value);
                // if (difficulty > 0 && difficulty <= 5)
                if (e.target.value.length < 5)
                  setTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    difficulty: difficulty,
                  }));
              }}
            />
          </div>
          <div className="mr-2 flex flex-row place-items-center text-xl">
            Correct Answer:{" "}
            <input
              type="text"
              value={template.correct_answer_letter}
              className="ml-2 w-12 rounded-lg"
              onChange={(e) => {
                const correct = e.target.value;
                if (["", "a", "b", "c", "d"].includes(correct))
                  // @ts-ignore
                  setTemplate((prevTemplate) => ({
                    ...prevTemplate,
                    correct_answer_letter: correct,
                  }));
              }}
            />
          </div>
          <div>
            <Menu as="div" className="relative inline-block text-left">
              <div className="flex flex-row place-items-center">
                <div className="mr-2 shrink-0">Question Type: </div>
                <Menu.Button className="inline-flex w-full shrink justify-center rounded-md border border-gray-800 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <div className="block py-1 text-base">
                    {template.question_type}
                  </div>
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {["conceptual", "practice", ""].map((questionType) => (
                      <Menu.Item key={questionType}>
                        {({ active }) => (
                          <div
                            className={classNames(
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700",
                              "block flex flex-row px-4 py-2 text-base"
                            )}
                            onClick={() =>
                              setTemplate((prevTemplate) => ({
                                ...prevTemplate,
                                question_type: questionType as QuestionType,
                              }))
                            }
                          >
                            {questionType}
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
        <textarea
          className="my-4 h-2/3 resize-none overflow-y-auto rounded-lg"
          value={template.template_text}
          onChange={(e) =>
            setTemplate((prevTemplate) => ({
              ...prevTemplate,
              template_text: e.target.value,
            }))
          }
        />
        <div className="flex flex-row justify-center">
          <button
            className="btn-green btn-lg"
            onClick={() =>
              (async () => {
                const saveResponse = await fetch(
                  `${backendUrl}/api/v0/question_template`,
                  {
                    method: "POST",
                    headers: cacheHeaders,
                    body: JSON.stringify({
                      template_id: templateId,
                      template: template,
                      save: true,
                    }),
                  }
                );
                // TODO: Should show that save was successful!
              })()
            }
          >
            <SaveIcon className="mr-2 h-6 w-6" />
            Save
          </button>
        </div>
      </div>
      <div>
        <div className="gap-none grid h-screen w-full grid-cols-1 grid-rows-6 justify-center bg-white">
          <div className="border-w-1 row-span-1 flex flex-row justify-between border-b">
            <div>
              <button
                className="btn-blue btn-lg m-2"
                onClick={() =>
                  (async () => {
                    const templateResponse = await fetch(
                      `${backendUrl}/api/v0/question_template`,
                      {
                        method: "POST",
                        headers: cacheHeaders,
                        body: JSON.stringify({
                          template_id: templateId,
                          template: template,
                          save: false,
                        }),
                      }
                    );
                    const questionJson =
                      (await templateResponse.json()) as QuestionEditingResponse;
                    setQuestion((prevQuestion) => ({
                      ...prevQuestion,
                      error: undefined,
                      ...questionJson,
                    }));
                  })()
                }
              >
                <RefreshIcon className="mr-2 h-6 w-6" />
                Refresh
              </button>
            </div>
            <div className="mt-4 text-xl">
              Title: <b>{question.title}</b>
            </div>
            <div className="mr-4 h-full">
              <h3 className="text-center text-2xl">Params</h3>
              <div className="grid h-[100%-2rem] grid-cols-2 justify-items-center gap-x-1 overflow-y-auto text-lg">
                {Object.entries(question.params).map(([key, value]) => (
                  <>
                    <b key={`${key}-k`}>{key}:</b>
                    <p key={`${key}-v`}>{value}</p>
                  </>
                ))}
              </div>
            </div>
          </div>
          <div className="row-span-5 bg-white">
            {!question.error ? (
              <div className="mt-3 text-center sm:mt-12">
                <div className="my-8 flex w-full flex-row justify-center">
                  <div className="max-w-lg text-lg text-black">
                    <QuestionText text={question.question_text} />
                  </div>
                </div>
                <div className="flex w-full justify-center">
                  <AnswerOptions
                    answerArray={question.answers_order_randomised}
                    answerGiven={answerGiven}
                    correctAnswer={question.correct_answer}
                    onAnswerSelected={(answer) => setAnswerGiven(answer)}
                  />
                </div>
                {/*FEEBACK*/}
                <div className="flex justify-center">
                  <div className="my-6 max-w-xl rounded bg-gray-200 px-6 py-4 text-center text-black">
                    <QuestionText text={question.feedback} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-6 whitespace-pre-line rounded-lg bg-red-100 p-4 text-left text-red-900 sm:mt-12">
                {question.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// @ts-ignore
export const getServerSideProps = withPageAuthRequired({
  returnTo: "",
  async getServerSideProps(ctx) {
    const session = getSession(ctx.req, ctx.res);
    // Currently we redirect if they're not authorised
    if (
      ![
        "matthew@learney.me",
        "henrypulver13@gmail.com",
        "samo.hromadka@gmail.com",
      ].includes(session.user.email.toLowerCase())
    ) {
      return {
        redirect: { destination: `/questions` },
      };
    }
    const templateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/question_template?` +
        // @ts-ignore
        new URLSearchParams({ template_id: ctx.params.templateId }),
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const templateJson = (await templateResponse.json()) as {
      template_text: string;
    };
    return {
      props: {
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        templateId: ctx.params.templateId,
        templateJson: templateJson,
      },
    };
  },
});
