import Tippy from "@tippyjs/react";
import React from "react";
import { useAsync } from "react-async";
import { getValidURLs, logContentClick } from "../lib/utils";
import { CheckCircleIcon, FlagIcon } from "@heroicons/react/outline";
import { IconToggleButtonWithCheckbox, MakeSuggestionButton } from "./buttons";
import { handleFetchResponses } from "../lib/utils";
import { classNames } from "../lib/reactUtils";
import { cacheHeaders } from "../lib/headers";
import { XIcon } from "@heroicons/react/outline";
import { LoadingSpinner } from "./animations";

export function ConceptTippy({
  visible,
  node,
  backendUrl,
  userId,
  userEmail,
  mapUUID,
  sessionId,
  hideTippy,
  reference,
  learnedNodes,
  goalNodes,
  onLearnedClick,
  onSetGoalClick,
  allowSuggestions,
  buttonPressFunction,
  userVotes,
  onVote,
}) {
  const { data } = useAsync({
    promiseFn: fetchTotalVotes,
    backendUrl,
    mapUUID,
  });
  return (
    <Tippy
      placement="auto"
      allowHTML={true}
      arrow={true}
      maxWidth={"auto"}
      visible={visible}
      duration={[250, 0]}
      theme={"light"}
      interactive={true}
      reference={reference}
      getReferenceClientRect={
        node ? node.popperRef().getBoundingClientRect : () => {}
      }
      onClickOutside={
        node ? () => hideTippy(node, userId, sessionId) : () => {}
      }
      content={
        node ? (
          <ConceptInfo
            node={node}
            backendUrl={backendUrl}
            userId={userId}
            userEmail={userEmail}
            mapUUID={mapUUID}
            sessionId={sessionId}
            hideTippy={hideTippy}
            learnedNodes={learnedNodes}
            goalNodes={goalNodes}
            onLearnedClick={onLearnedClick}
            onSetGoalClick={onSetGoalClick}
            allowSuggestions={allowSuggestions}
            buttonPressFunction={buttonPressFunction}
            userVotes={userVotes}
            onVote={onVote}
            allVotes={data}
          />
        ) : (
          ""
        )
      }
    />
  );
}

function ConceptInfo({
  node,
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  hideTippy,
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
}) {
  let urls;
  if (node.data().urls !== undefined) urls = getValidURLs(node.data().urls);
  else urls = [];

  let linkPreviews = urls.map((url) => (
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
  ));

  let linkPreviewOrder = urls.map((url, index) => index);

  if (allVotes) {
    linkPreviewOrder.sort((a, b) => {
      let bNumVotes;
      if (allVotes[urls[b]] === undefined) bNumVotes = 0;
      else bNumVotes = allVotes[urls[b]];
      let aNumVotes;
      if (allVotes[urls[a]] === undefined) aNumVotes = 0;
      else aNumVotes = allVotes[urls[a]];
      return bNumVotes - aNumVotes;
    });
  }

  return (
    <div className={`text-center bg-white disableTouchActions`}>
      <h4 className="text-black text-4xl m-0 mb-1 text-center">
        {node.data().name}
      </h4>
      <div className="text-left text-black max-w-screen-sm mt-0 mx-auto mb-4">
        {node.data().description}
      </div>
      <div
        className="absolute cursor-pointer m-1 sm:m-2 top-0 right-0"
        onClick={
          node
            ? buttonPressFunction(hideTippy, "Top Right Close Concept X")
            : () => {}
        }
      >
        <span className="sr-only">Close</span>
        <XIcon className="text-gray-400 w-6 h-6 hover:text-gray-500" />
      </div>
      <div className="justify-around border-t border-solid border-gray-600 px-2 py-4 grid items-center grid-flow-col">
        <div>
          <IconToggleButtonWithCheckbox
            checked={learnedNodes[node.data().id]}
            onCheck={() => onLearnedClick(node, userId, sessionId)}
            Icon={CheckCircleIcon}
            text={"I Know This!"}
            colour={"green"}
          />
        </div>
        <div>
          <IconToggleButtonWithCheckbox
            checked={goalNodes[node.data().id]}
            onCheck={() => onSetGoalClick(node, userId, sessionId)}
            Icon={FlagIcon}
            text={"Set Goal"}
            colour={"blue"}
          />
        </div>
      </div>
      <ol className="list-none pl-0 m-0">
        {linkPreviewOrder.map((index) => linkPreviews[index])}
      </ol>
      {allowSuggestions && (
        <div className="">
          {allowSuggestions && (
            <MakeSuggestionButton
              buttonPressFunction={buttonPressFunction}
              userEmail={userEmail}
              buttonName={"Suggest Content"}
              text={"Suggest Content!"}
            />
          )}
        </div>
      )}
    </div>
  );
}

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
}) {
  const { data } = useAsync({
    promiseFn: fetchLinkPreview,
    node,
    url,
    backendUrl,
    mapUUID,
  });

  return (
    <li className="text-black relative">
      <a
        href={url}
        style={{ paddingRight: "60px", height: "100px" }}
        className="bg-gray-100 hover:bg-white visited:bg-gray-300 rounded-sm w-screen-sm overflow-hidden flex text-left m-0.5"
        target="_blank"
        rel="noreferrer"
        onClick={() =>
          logContentClick(
            url,
            node.data().id,
            backendUrl,
            userId,
            mapUUID,
            sessionId
          )
        }
      >
        <div className="flex items-center max-h-full w-1/4">
          {data ? (
            <img
              src={data.image_url}
              className="m-auto max-h-full"
              alt={data.title}
            />
          ) : (
            <LoadingSpinner classes="h-3/5 w-3/5 m-auto" />
          )}
        </div>
        <div className="max-h-full w-full my-0 ml-1 no-underline overflow-hidden">
          <h4 className="py-2 overflow-hidden whitespace-nowrap overflow-ellipsis text-xl">
            {data ? data.title : "Loading..."}
          </h4>
          <p className="mt-0 mb-1 font-lg sm:font-base overflow-hidden overflow-ellipsis text-black max-h-70 sm:max-h-40">
            {data ? data.description : ""}
          </p>
          <p className="hidden sm:block font-sm text-gray-500 whitespace-nowrap overflow-ellipsis overflow-hidden max-w-xs my-0">
            {url}
          </p>
        </div>
      </a>
      <div className="absolute right-0 top-0 w-8 h-24 m-3">
        <div className="vote-arrow upvote">
          {/*<div className={classNames(allVotes[urlInfo.url] ? "" : "", "triangle up cursor-pointer")} onClick={voteFunction(true, )}/>*/}
          <div
            className={classNames(
              userVotes[url]
                ? "border-b-green-500 hover:border-b-green-400"
                : "border-b-gray-500 hover:border-b-gray-400",
              "triangle up cursor-pointer border-t-transparent border-l-transparent border-r-transparent"
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
        <div className={"text-sm font-semibold py-1"}>
          {allVotes && Math.abs(allVotes[url]) > 5
            ? userVotes[url] === true
              ? allVotes[url] + 1
              : userVotes[url] === false
              ? allVotes[url] - 1
              : allVotes[url]
            : "Vote"}
        </div>
        <div className="vote-arrow downvote">
          {/*<div className={classNames(allVotes[urlInfo.url] === false ? "" : "", "triangle down cursor-pointer")} onClick={voteFunction(false, )}/>*/}
          <div
            className={classNames(
              userVotes[url] === false
                ? "border-t-red-500 hover:border-t-red-400"
                : "border-t-gray-500 hover:border-t-gray-400",
              "triangle down cursor-pointer border-b-transparent border-l-transparent border-r-transparent"
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

const fetchLinkPreview = async ({ node, url, backendUrl, mapUUID }) => {
  const response = await fetch(
    `${backendUrl}/api/v0/link_previews?` +
      new URLSearchParams({
        map_uuid: mapUUID,
        concept: node.data().name,
        concept_id: node.data().id,
        url: url,
      }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  let responseJson = await handleFetchResponses(response, backendUrl);
  if (response.status !== 200 && responseJson.status !== 201)
    responseJson = { title: "", description: "", image_url: "" };
  if (responseJson.title === "") responseJson.title = node.data().name;
  if (responseJson.image_url === "")
    responseJson.image_url = "/images/learney_logo_256x256.png";
  return responseJson;
};

const fetchTotalVotes = async ({ backendUrl, mapUUID }) => {
  const response = await fetch(
    `${backendUrl}/api/v0/total_vote_count?` +
      new URLSearchParams({ map_uuid: mapUUID }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  if (!response.ok) throw new Error(response.status.toString());
  return handleFetchResponses(response, backendUrl);
};
