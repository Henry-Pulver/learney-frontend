import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";
import { useAsync } from "react-async";
import { CheckCircleIcon, FlagIcon } from "@heroicons/react/outline";
import { IconToggleButtonWithCheckbox, MakeSuggestionButton } from "./buttons";
import { cacheHeaders, jsonHeaders } from "../lib/headers";
import QuestionModal from "./questionModal";
import { completeTest } from "../lib/questions";
import { classNames } from "../lib/reactUtils";
import {
  getValidURLs,
  logContentClick,
  handleFetchResponses,
} from "../lib/utils";
import buttonStyles from "../styles/buttons.module.css";

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
  onTestSuccess,
  onTestFail,
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
            onTestSuccess={onTestSuccess}
            onTestFail={onTestFail}
            onSetGoalClick={onSetGoalClick}
            onLearnedClick={onLearnedClick}
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
  onTestSuccess,
  onTestFail,
  onSetGoalClick,
  allowSuggestions,
  buttonPressFunction,
  userEmail,
  onVote,
  userVotes,
  allVotes,
}) {
  let urls;
  if (node.data().urls !== undefined) {
    urls = getValidURLs(node.data().urls);
  } else {
    urls = [];
  }

  // Question stuff
  const { data, isPending, reload } = useAsync({
    promiseFn: fetchQuestionSet,
    backendUrl: backendUrl,
    mapUUID: mapUUID,
    userId: userId,
    conceptId: node.data().id,
  });
  useEffect(() => reload(), [node]); // Each time a node is selected, rerun this
  const [questionModalShown, setQuestionModalShown] = React.useState(false);

  return (
    <>
      {data && data.correct_threshold !== 0 ? (
        <QuestionModal
          questionSet={data.question_set}
          modalShown={questionModalShown}
          setModalShown={setQuestionModalShown}
          onCompletion={(answersGiven) => {
            completeTest(
              answersGiven,
              node,
              learnedNodes,
              goalNodes,
              data.question_set,
              data.correct_threshold,
              () => onTestSuccess(node, userId, sessionId),
              () => {
                reload();
                onTestFail(node);
              }
            );
            setQuestionModalShown(false);
          }}
          backendUrl={backendUrl}
          userId={userId}
          sessionId={sessionId}
        />
      ) : (
        <></>
      )}

      <div className="tooltip-contents disableTouchActions">
        <h4 className="tooltip-heading">{node.data().name}</h4>
        <div className="tooltip-description">{node.data().description}</div>
        <button
          className={`close ${buttonStyles.button}`}
          onClick={
            node ? buttonPressFunction(hideTippy, "close-concept") : () => {}
          }
        >
          {"X"}
        </button>
        <div className="slider-container grid items-center grid-flow-col">
          <div>
            <IconToggleButtonWithCheckbox
              text={
                !learnedNodes[node.data().id] &&
                data &&
                data.correct_threshold > 0
                  ? "Test me!"
                  : "Set Known"
              }
              Icon={CheckCircleIcon}
              checked={learnedNodes[node.data().id]}
              // onCheck={}
              onCheck={
                !learnedNodes[node.data().id] &&
                data &&
                data.correct_threshold > 0
                  ? () => {
                      hideTippy();
                      setQuestionModalShown(true);
                    }
                  : () => onLearnedClick(node, userId, sessionId)
              }
              colour="green"
              loading={isPending} // Truthy value of data
            />
          </div>
          <div>
            <IconToggleButtonWithCheckbox
              text={"Set Goal"}
              Icon={FlagIcon}
              checked={goalNodes[node.data().id]}
              onCheck={() => onSetGoalClick(node, userId, sessionId)}
              colour={"blue"}
            />
          </div>
        </div>
        <ol className="tooltip-link">
          {urls.map((url) => (
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
          ))}
        </ol>
        {allowSuggestions && (
          <div>
            <MakeSuggestionButton
              allowSuggestions={allowSuggestions}
              buttonPressFunction={buttonPressFunction}
              userEmail={userEmail}
              buttonName={"content-suggestion"}
              text={"Suggest Content!"}
            />
          </div>
        )}
      </div>
    </>
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
    <li className="link-preview-list-element">
      <a
        href={url}
        className="link-preview"
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
        <div className="link-preview-image-container">
          <img
            src={data ? data.image_url : "/images/loading.jpg"}
            className="link-preview-image"
            alt={data ? data.title : node.data().name}
          />
        </div>
        <div className="link-preview-text-container">
          <h4 className="link-preview-title">
            {data ? data.title : "Loading..."}
          </h4>
          <p className="link-preview-description">
            {data ? data.description : ""}
          </p>
          <p className="link-preview-url">{url}</p>
        </div>
      </a>
      <div className="voting">
        <div className="vote-arrow upvote">
          {/*<div className={classNames(allVotes[urlInfo.url] ? "" : "", "triangle up cursor-pointer")} onClick={voteFunction(true, )}/>*/}
          <div
            className={classNames(
              userVotes[url]
                ? "border-b-green-500 hover:border-b-green-400"
                : "border-b-gray-500 hover:border-b-gray-400",
              "triangle up cursor-pointer border-t-transparent border-l-transparent border-r-transparent"
            )}
            // true  ->  null
            // null  ->  true
            // false ->  null
            onClick={
              userVotes[url]
                ? () => onVote(node, url, null)
                : userVotes[url] === null
                ? () => onVote(node, url, true)
                : () => onVote(node, url, true)
            }
          />
        </div>
        {/*Vote count number*/}
        <div className={"text-sm font-semibold py-1"}>
          {allVotes && Math.abs(allVotes[url]) > 5
            ? userVotes[url] === true
              ? `+${(allVotes[url] + 1).toString()}`
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
            // false ->  null
            // null  ->  false
            // true  ->  null
            onClick={
              userVotes[url] === false
                ? () => onVote(node, url, null)
                : userVotes[url] === null || userVotes[url] === undefined
                ? () => onVote(node, url, false)
                : () => onVote(node, url, null)
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
  let responseJson = await handleFetchResponses(response);
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
  return handleFetchResponses(response);
};

const fetchQuestionSet = async ({ backendUrl, mapUUID, userId, conceptId }) => {
  console.log("FETCHING QUESTIONS");
  const response = await fetch(
    `${backendUrl}/api/v0/questions?` +
      new URLSearchParams({
        map_uuid: mapUUID,
        user_id: userId,
        concept_id: conceptId,
      }),
    {
      method: "GET",
      headers: jsonHeaders,
    }
  );
  let responseJson = await handleFetchResponses(response);
  // {
  //  correct_threshold: 3,
  //  question_set: [{question_text: "...",
  //                  answer_text: ["...", "..."],
  //                  feedback_text: "..."}]
  // }
  responseJson.question_set.forEach((question) => {
    question.correct_answer = question.answer_text[0];
    question.answers_order_randomised = question.answer_text.sort(
      (a, b) => 0.5 - Math.random()
    );
  });
  return responseJson;
};
