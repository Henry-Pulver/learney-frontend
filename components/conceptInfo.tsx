import React from "react";
import { useAsync } from "react-async";
import {
  getValidURLs,
  handleFetchResponses,
  logContentClick,
} from "../lib/utils";
import { CheckCircleIcon, FlagIcon } from "@heroicons/react/outline";
import { IconToggleButtonWithCheckbox, MakeSuggestionButton } from "./buttons";
import { appendToArray, classNames } from "../lib/reactUtils";
import { LoadingSpinner } from "./animations";
import { NodeSingular } from "cytoscape";
import { cacheHeaders } from "../lib/headers";
import Overlay from "./overlay";

export function ConceptInfo({
  visible,
  hideConceptInfo,
  node,
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  learnedNodes,
  goalNodes,
  onLearnedClick,
  onSetGoalClick,
  allowSuggestions,
  buttonPressFunction,
  userEmail,
  onVote,
  userVotes,
  allVotes,
}: {
  visible: boolean;
  node: NodeSingular | undefined;
  backendUrl: string;
  userId: string;
  userEmail: string;
  mapUUID: string;
  sessionId: string;
  hideConceptInfo: () => void;
  learnedNodes: object;
  goalNodes: object;
  onLearnedClick: Function;
  onSetGoalClick: Function;
  allowSuggestions: boolean;
  buttonPressFunction: Function;
  userVotes: object;
  onVote: Function;
  allVotes: object;
}) {
  if (node === undefined) return <></>;
  return (
    <Overlay
      open={visible}
      hide={
        node
          ? buttonPressFunction(hideConceptInfo, "Top Right Close Concept X")
          : () => {}
      }
    >
      <div className="flex flex-col text-center h-excl-toolbar w-full overflow-hidden">
        <h4 className="text-gray-900 text-2xl font-bold sm:text-4xl mb-2 px-4 text-center">
          {node && node.data().name}
        </h4>
        <div className="text-left text-black mt-0 mx-auto mb-4 px-4 max-h-1/5">
          {node && node.data().description}
        </div>
        {node && (
          <div className="absolute bottom-0 left-0 sm:relative w-full left-0 bottom-0 z-20 bg-white justify-around border-t border-solid border-gray-300 px-2 py-4 grid items-center grid-flow-col">
            <IconToggleButtonWithCheckbox
              checked={!!learnedNodes[node.id()]}
              onCheck={() => onLearnedClick(node, userId, sessionId)}
              Icon={CheckCircleIcon}
              text={"I Know This!"}
              colour={"green"}
            />
            <IconToggleButtonWithCheckbox
              checked={!!goalNodes[node.id()]}
              onCheck={() => onSetGoalClick(node, userId, sessionId)}
              Icon={FlagIcon}
              text={"Set Goal"}
              colour={"blue"}
            />
          </div>
        )}
        <ol className="shrink grow list-none pl-0 m-0 overflow-auto mb-20 md:mb-0 pb-2 sm:pb-20 sm:px-2 w-full">
          {node &&
            appendToArray(
              getAndSortLinkPreviewURLs(node, allVotes).map((url) => (
                <ConceptLinkPreview
                  key={url}
                  node={node}
                  url={url}
                  userId={userId}
                  backendUrl={backendUrl}
                  mapUUID={mapUUID}
                  sessionId={sessionId}
                  userVotes={userVotes}
                  allVotes={allVotes}
                  onVote={onVote}
                />
              )),
              allowSuggestions && (
                // <div> necessary as otherwise the button grows to the width of the list element
                <div>
                  <MakeSuggestionButton
                    buttonPressFunction={buttonPressFunction}
                    userEmail={userEmail}
                    buttonName={"Suggest Content"}
                    text={"Suggest Content"}
                  />
                </div>
              )
            )}
        </ol>
      </div>
    </Overlay>
  );
}

type LinkPreviewData = {
  status: number;
  title: string;
  description: string;
  image_url: string;
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
}: {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  userId: string;
  mapUUID: string;
  sessionId: string;
  userVotes: object;
  allVotes: object;
  onVote: Function;
}) {
  const { data } = useAsync({
    promiseFn: fetchLinkPreview,
    node,
    url,
    backendUrl,
    mapUUID,
  });

  return (
    <li className="text-gray-900 relative z-10">
      <a
        href={url}
        className="hover:bg-gray-100 hover:shadow-lg h-24 rounded-sm overflow-hidden flex text-left m-0.5"
        target="_blank"
        rel="noreferrer"
        onClick={() =>
          logContentClick(
            url,
            Number(node.id()),
            backendUrl,
            userId,
            mapUUID,
            sessionId
          )
        }
      >
        <div className="flex items-center max-h-full w-20 sm:w-32">
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
        <div className="w-[calc(100%-8.25rem)] w-[calc(100%-10.75rem)] mr-0 ml-1 no-underline overflow-hidden">
          <h4 className="text-lg sm:text-xl sm:py-1 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {data ? (data as LinkPreviewData).title : "Loading..."}
          </h4>
          <p
            className={classNames(
              data && (data as LinkPreviewData).description ? "h-15" : "h-10",
              "-mt-0.5 mb-0.5 text-sm overflow-hidden overflow-ellipsis text-gray-800 sm:max-h-40"
            )}
          >
            {data ? (data as LinkPreviewData).description : ""}
          </p>
          <p
            className={classNames(
              data &&
                (data as LinkPreviewData).description &&
                "hidden sm:block",
              "text-xxs sm:text-sm text-gray-500 whitespace-nowrap overflow-ellipsis overflow-hidden max-w-xs my-0"
            )}
          >
            {url}
          </p>
        </div>
      </a>
      <div className="absolute right-1 top-0 w-8">
        <div className="h-8 w-8">
          <div
            className={classNames(
              userVotes[url]
                ? "border-b-green-500 hover:border-b-green-400"
                : "border-b-gray-500 hover:border-b-gray-400",
              "w-0 h-0 border-[1rem] border-t-0 border-t-transparent border-b-[2rem] cursor-pointer border-t-transparent border-l-transparent border-r-transparent"
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
        <div className={"text-sm font-semibold py-1.5"}>
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
              "w-0 h-0 border-[1rem] border-b-0 border-b-transparent border-t-[2rem] cursor-pointer border-b-transparent border-l-transparent border-r-transparent"
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
  );
}

function getAndSortLinkPreviewURLs(
  node: NodeSingular,
  allVotes: object
): Array<string> {
  let urls;
  if (node !== undefined && node.data().urls !== undefined)
    urls = getValidURLs(node.data().urls);
  else urls = [];

  if (allVotes) {
    urls.sort((urlA, urlB) => {
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
}: {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  mapUUID: string;
}): Promise<object> => {
  const response = await fetch(
    `${backendUrl}/api/v0/link_previews?` +
      new URLSearchParams({
        map: mapUUID,
        concept: node.data().name,
        concept_id: node.id(),
        url: url,
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
    responseJson = { title: "", description: "", image_url: "", status: 400 };
  if (responseJson.title === "") responseJson.title = node.data().name;
  if (responseJson.image_url === "")
    responseJson.image_url = "/images/learney_logo_256x256.png";
  return responseJson;
};
