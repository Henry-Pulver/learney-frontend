import React from "react";
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
  setURLQuery,
} from "../lib/utils";
import { cacheHeaders, jsonHeaders } from "../lib/headers";
import LevelBadge from "./questions/levelBadge";
import { LevelsProgressBar } from "./questions/progressBars";
import { useRouter } from "next/router";
import { signInTooltip } from "../lib/learningAndPlanning/learningAndPlanning";
import parse from "html-react-parser";
import { ContentModal } from "./contentModal";
import { ContentCard, LinkPreviewData } from "./contentCard";

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
                  <ContentCard
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
                allowSuggestions ? (
                  // <div> necessary as otherwise the button grows to the width of the list element
                  <div key="Make suggestion button">
                    <MakeSuggestionButton
                      buttonPressFunction={buttonPressFunction}
                      userEmail={userData.email}
                      buttonName={"Suggest Content"}
                      text={"Suggest Content"}
                    />
                  </div>
                ) : (
                  <div className="h-24" />
                ) // empty div to prevent description overflowing off screen
              )}
          </ol>
        </div>
      </Overlay>
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

export const fetchLinkPreview = async (props: {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  mapUUID: string;
  userId: string;
}): Promise<LinkPreviewData> => {
  console.log("fetchLinkPreview", props);
  const response = await fetch(
    `${props.backendUrl}/api/v0/link_previews?` +
      new URLSearchParams({
        map: props.mapUUID,
        concept: props.node.data().name,
        concept_id: props.node.id(),
        url: props.url,
        user_id: props.userId,
      }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  let responseJson: LinkPreviewData = (await handleFetchResponses(
    response,
    props.backendUrl
  )) as LinkPreviewData;
  if (response.status !== 200 && responseJson.status !== 201)
    responseJson = {
      status: 400,
      map: props.mapUUID,
      concept: props.node.data().name,
      concept_id: props.node.id(),
      url: props.url,
      title: "",
      description: "",
      image_url: "",
      content_type: "website",
      estimated_time_to_complete: "",
      author: {
        id: "",
        name: "",
        image_url: "",
      },
      tags: [],
      checked: false,
    };
  if (responseJson.title === "") responseJson.title = props.node.data().name;
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
