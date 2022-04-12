import React, { useEffect, useState } from "react";
import { useAsync } from "react-async";
import { CheckCircleIcon, FlagIcon } from "@heroicons/react/outline";
import { IconToggleButtonWithCheckbox, MakeSuggestionButton } from "./buttons";
import { appendToArray, classNames } from "../lib/reactUtils";
import { NodeSingular } from "cytoscape";
import Overlay from "./overlay";
import { ButtonPressFunction } from "../lib/types";
import { OnGoalLearnedClick, UserData } from "./types";
import {
  getValidURLs,
  handleFetchResponses,
  isAnonymousUser,
  logContentClick,
  setURLQuery,
} from "../lib/utils";
import { LoadingSpinner } from "./animations";
import { cacheHeaders, jsonHeaders } from "../lib/headers";
import LevelBadge from "./questions/levelBadge";
import { LevelsProgressBar } from "./questions/progressBars";
import { useRouter } from "next/router";
import { signInTooltip } from "../lib/learningAndPlanning/learningAndPlanning";
import parse from "html-react-parser";

type OnVote = (node: NodeSingular, url: string, up: boolean | null) => void;

export function ConceptInfo({
  visible,
  hideConceptInfo,
  node,
  backendUrl,
  userData,
  mapUUID,
  sessionId,
  learnedNodes,
  goalNodes,
  knowledgeLevel,
  maxKnowledgeLevel,
  questionModalShown,
  setQuestionModalShown,
  onLearnedClick,
  onSetGoalClick,
  allowSuggestions,
  buttonPressFunction,
  onVote,
  userVotes,
  allVotes,
  questionsEnabled,
  setProgressModalOpen,
  setIsContentModalOpen,
  setContentURL,
  setContentType,
}: {
  visible: boolean;
  node: NodeSingular | undefined;
  backendUrl: string;
  userData: UserData;
  mapUUID: string;
  sessionId: string;
  hideConceptInfo: () => void;
  learnedNodes: object;
  goalNodes: object;
  knowledgeLevel: number;
  maxKnowledgeLevel: number;
  questionModalShown: boolean;
  setQuestionModalShown: (shown: boolean) => void;
  onLearnedClick: OnGoalLearnedClick;
  onSetGoalClick: OnGoalLearnedClick;
  allowSuggestions: boolean;
  buttonPressFunction: ButtonPressFunction;
  userVotes: object;
  onVote: OnVote;
  allVotes: object;
  questionsEnabled: boolean;
  setProgressModalOpen: (open: boolean) => void;
  setIsContentModalOpen: (open: boolean) => void;
  setContentURL: (url: string) => void;
  setContentType: (type: string) => void;
}) {
  const router = useRouter();
  if (node === undefined) return <></>;
  return (
    <>
      <Overlay
        open={visible}
        hide={
          node
            ? buttonPressFunction(() => {
                hideConceptInfo();
                localStorage.removeItem(`lastConceptClickedMap${mapUUID}`);
                localStorage.removeItem("quemodal");
                setQuestionModalShown(false);
                setURLQuery(router, {});
              }, "Top Right Close Concept X")
            : () => {}
        }
        className={questionModalShown ? "z-[15]" : ""}
      >
        <div
          className={classNames(
            !questionsEnabled && "hidden",
            "absolute left-2 top-1 flex flex-row place-items-center gap-4 lg:left-6 lg:top-3"
          )}
        >
          <LevelBadge
            knowledgeLevel={Math.min(
              Math.floor(knowledgeLevel),
              maxKnowledgeLevel
            )}
            achieved={true}
            onClick={() => setProgressModalOpen(true)}
            overallClassName={"cursor-pointer text-xs sm:text-sm"}
          />
          {knowledgeLevel > maxKnowledgeLevel && (
            <p className="w-20 font-bold"> Expert level achieved!</p>
          )}
        </div>
        <div className="h-excl-toolbar flex w-full flex-col items-center overflow-hidden text-center">
          <h4 className="mb-2 max-w-lg px-4 text-center text-2xl font-bold text-gray-900 sm:text-4xl">
            {node && node.data().name}
          </h4>
          <div className="max-h-1/5 mx-auto mt-2 mb-4 px-4 text-left text-black">
            {node && parse(node.data().description)}
          </div>
          {questionsEnabled && (
            <>
              <div className="mb-2 flex w-full flex-col items-center">
                <LevelsProgressBar
                  knowledgeLevel={knowledgeLevel ? knowledgeLevel : 0}
                  maxKnowledgeLevel={maxKnowledgeLevel ? maxKnowledgeLevel : 1}
                  onClick={() => setProgressModalOpen(true)}
                />
                <div
                  className={classNames(
                    "-mt-4 text-sm",
                    maxKnowledgeLevel ? "visible" : "invisible"
                  )}
                >
                  Progress
                </div>
              </div>
            </>
          )}
          {node && (
            <div className="absolute bottom-0 left-0 z-10 grid w-full grid-flow-col items-center justify-around border-t border-solid border-gray-300 bg-white px-2 py-4 sm:relative">
              <IconToggleButtonWithCheckbox
                text={
                  questionsEnabled
                    ? maxKnowledgeLevel && knowledgeLevel >= maxKnowledgeLevel
                      ? "Review concept"
                      : "Get questions"
                    : "I know this!"
                }
                checked={!!learnedNodes[node.id()]}
                onCheck={
                  maxKnowledgeLevel // question map + info loaded
                    ? () => {
                        localStorage.setItem("quemodal", "true");
                        setQuestionModalShown(true);
                      }
                    : // if on normal map
                      () => onLearnedClick(node, userData.id, sessionId)
                }
                Icon={CheckCircleIcon}
                colour={"green"}
                loading={questionsEnabled && knowledgeLevel === null}
                disabled={questionModalShown}
              />
              <IconToggleButtonWithCheckbox
                text={"Set Goal"}
                checked={!!goalNodes[node.id()]}
                onCheck={() => onSetGoalClick(node, userData.id, sessionId)}
                Icon={FlagIcon}
                colour={"blue"}
                disabled={questionModalShown}
              />
            </div>
          )}
          <p
            className={classNames(
              "ml-2.5 w-full text-left text-gray-500",
              getAndSortLinkPreviewURLs(node, allVotes).length === 0 && "hidden"
            )}
          >
            Done?
          </p>
          <ol className="m-0 mb-20 w-full shrink grow list-none overflow-auto pl-0 pb-2 sm:px-2 sm:pb-20 md:mb-0">
            {node &&
              appendToArray(
                getAndSortLinkPreviewURLs(node, allVotes).map((url, idx) => (
                  <ConceptLinkPreview
                    key={`${url}-${idx}`}
                    node={node}
                    url={url}
                    userId={userData.id}
                    backendUrl={backendUrl}
                    mapUUID={mapUUID}
                    sessionId={sessionId}
                    userVotes={userVotes}
                    allVotes={allVotes}
                    onVote={onVote}
                    setIsContentModalOpen={setIsContentModalOpen}
                    setContentURL={setContentURL}
                    setContentType={setContentType}
                  />
                )),
                getAndSortLinkPreviewURLs(node, allVotes).length === 0 && (
                  <div
                    key="No suggested content"
                    className="border-t border-solid border-gray-200 pt-4 text-lg text-gray-800"
                  >
                    No suggested content for {node.data().name}.
                  </div>
                ),
                allowSuggestions && (
                  // <div> necessary as otherwise the button grows to the width of the list element
                  <div key="Make suggestion button">
                    <MakeSuggestionButton
                      buttonPressFunction={buttonPressFunction}
                      userEmail={userData.email}
                      buttonName={"Suggest Content"}
                      text={"Suggest Content"}
                    />
                  </div>
                )
              )}
          </ol>
        </div>
      </Overlay>
    </>
  );
}

type LinkPreviewData = {
  status: number;
  title: string;
  description: string;
  image_url: string;
  checked: boolean;
};

function ConceptLinkPreview({
  node,
  url,
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  userVotes,
  allVotes,
  onVote,
  setIsContentModalOpen,
  setContentURL,
  setContentType,
}: {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  userId: string;
  mapUUID: string;
  sessionId: string;
  userVotes: object;
  allVotes: object;
  onVote: OnVote;
  setIsContentModalOpen: (open: boolean) => void;
  setContentURL: (url: string) => void;
  setContentType: (type: string) => void;
}) {
  const { data, isLoading } = useAsync({
    promiseFn: fetchLinkPreview,
    node,
    url,
    backendUrl,
    mapUUID,
    userId,
  });
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!isLoading) setChecked(data.checked);
  }, [data, isLoading]);
  const conceptOnClickHandler = async (externalURL: string) => {
    let extractedURL = "";
    let contentType = "";
    try {
      const res = await fetch("/api/iframe/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentURL: externalURL,
        }),
      });
      const resJSON = await res.json();
      extractedURL = resJSON.url;
      contentType = resJSON.type;
    } catch (err) {
      console.warn("Error while handling iframe URL:", err);
    }
    if (extractedURL.length > 0) {
      setContentURL(extractedURL);
      setContentType(contentType);
      setIsContentModalOpen(true);
    } else {
      window.open(url, "_blank");
    }
  };
  return (
    <>
      <li className="py-auto relative flex cursor-pointer flex-row text-gray-900">
        <div
          className={classNames(
            "mx-0.5 my-1 flex h-24 w-full overflow-hidden rounded bg-white text-left hover:bg-gray-100 hover:shadow-md ",
            checked && "bg-green-100 hover:bg-green-200 "
          )}
          onClick={async () => {
            await conceptOnClickHandler(url);
            logContentClick(
              url,
              Number(node.id()),
              backendUrl,
              userId,
              mapUUID,
              sessionId
            );
          }}
        >
          <div className="relative flex h-full flex-col justify-center pr-4">
            <input
              type="checkbox"
              checked={checked}
              onClick={(e) => e.stopPropagation()}
              onChange={() => {
                setChecked(!checked);
                postChecked(node, url, backendUrl, mapUUID, userId);
              }}
              className={classNames(
                checked &&
                  "ring-2 !ring-green-500 ring-offset-2 focus:!ring-2 focus:!ring-offset-2",
                "ml-2 h-6 w-6 cursor-pointer select-none rounded border-gray-300 text-green-600 focus:ring-0 focus:ring-offset-0"
              )}
            />
          </div>
          <div className="flex max-h-full w-20 items-center sm:w-32">
            {data ? (
              <img
                src={(data as LinkPreviewData).image_url}
                className="m-auto max-h-full"
                alt={(data as LinkPreviewData).title}
              />
            ) : (
              <LoadingSpinner classes="h-3/5 w-3/5 m-auto" />
            )}
          </div>
          <div className="mr-0 ml-1 w-[calc(100%-8.25rem)] grow overflow-hidden text-ellipsis no-underline sm:w-[calc(100%-13.25rem)]">
            <h4 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg sm:py-1 sm:text-xl">
              {data ? (data as LinkPreviewData).title : "Loading..."}
            </h4>
            <p
              className={classNames(
                data && (data as LinkPreviewData).description ? "h-15" : "h-10",
                "-mt-0.5 mb-0.5 overflow-hidden text-ellipsis text-sm text-gray-800 sm:max-h-40"
              )}
            >
              {data ? (data as LinkPreviewData).description : ""}
            </p>
            <p
              className={classNames(
                data &&
                  (data as LinkPreviewData).description &&
                  "hidden sm:block",
                "text-xxs my-0 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 sm:text-sm"
              )}
            >
              {url}
            </p>
          </div>
          <div className="w-10" />
        </div>
        <div className="absolute right-1 top-0 my-1 w-8">
          <div className="h-8 w-8">
            <div
              className={classNames(
                userVotes[url]
                  ? "border-b-green-500 hover:border-b-green-400"
                  : "border-b-gray-500 hover:border-b-gray-400",
                "h-0 w-0 cursor-pointer border-[1rem] border-t-0 border-b-[2rem] border-t-transparent border-t-transparent border-l-transparent border-r-transparent"
              )}
              onClick={
                userVotes[url]
                  ? () => onVote(node, url, null) // true  ->  null
                  : userVotes[url] === null || userVotes[url] === undefined
                  ? () => onVote(node, url, true) // null  ->  true
                  : () => onVote(node, url, null) // false ->  null
              }
            />
          </div>
          {/*Vote count number*/}
          <div className={"py-1.5 text-sm font-semibold"}>
            {allVotes && Math.abs(allVotes[url]) > 5
              ? userVotes[url] === true
                ? allVotes[url] + 1
                : userVotes[url] === false
                ? allVotes[url] - 1
                : allVotes[url]
              : "Vote"}
          </div>
          <div className="h-8 w-8">
            <div
              className={classNames(
                userVotes[url] === false
                  ? "border-t-red-500 hover:border-t-red-400"
                  : "border-t-gray-500 hover:border-t-gray-400",
                "h-0 w-0 cursor-pointer border-[1rem] border-b-0 border-t-[2rem] border-b-transparent border-b-transparent border-l-transparent border-r-transparent"
              )}
              onClick={
                userVotes[url] === false
                  ? () => onVote(node, url, null) // false ->  null
                  : userVotes[url] === null || userVotes[url] === undefined
                  ? () => onVote(node, url, false) // null  ->  false
                  : () => onVote(node, url, null) // true  ->  null
              }
            />
          </div>
        </div>
      </li>
    </>
  );
}

function getAndSortLinkPreviewURLs(
  node: NodeSingular,
  allVotes: object
): Array<string> {
  let urls;
  if (node !== undefined && node.data().urls !== undefined)
    urls = getValidURLs(node.data().urls);
  else return [];

  if (allVotes) {
    urls.sort((urlA: string, urlB: string) => {
      let bNumVotes;
      if (allVotes[urlB] === undefined) bNumVotes = 0;
      else bNumVotes = allVotes[urlB];
      let aNumVotes;
      if (allVotes[urlA] === undefined) aNumVotes = 0;
      else aNumVotes = allVotes[urlA];
      return bNumVotes - aNumVotes;
    });
  }
  return urls;
}

const fetchLinkPreview = async ({
  node,
  url,
  backendUrl,
  mapUUID,
  userId,
}: {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  mapUUID: string;
  userId: string;
}): Promise<LinkPreviewData> => {
  const response = await fetch(
    `${backendUrl}/api/v0/link_previews?` +
      new URLSearchParams({
        map: mapUUID,
        concept: node.data().name,
        concept_id: node.id(),
        url: url,
        user_id: userId,
      }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  let responseJson: LinkPreviewData = (await handleFetchResponses(
    response,
    backendUrl
  )) as LinkPreviewData;
  if (response.status !== 200 && responseJson.status !== 201)
    responseJson = {
      title: "",
      description: "",
      image_url: "",
      status: 400,
      checked: false,
    };
  if (responseJson.title === "") responseJson.title = node.data().name;
  if (responseJson.image_url === "")
    responseJson.image_url = "/images/learney_logo_256x256.png";
  return responseJson;
};

async function postChecked(
  node: NodeSingular,
  url: string,
  backendUrl: string,
  mapUUID: string,
  userId: string
) {
  if (isAnonymousUser(userId)) signInTooltip.show();
  const response = await fetch(`${backendUrl}/api/v0/check_off_link`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      map: mapUUID,
      user_id: userId,
      concept_id: node.data().id,
      url: url,
    }),
  });
  handleFetchResponses(response, backendUrl);
}
