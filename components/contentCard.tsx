import { NodeSingular } from "cytoscape";
import React, { Fragment, useEffect } from "react";
import { classNames } from "../lib/reactUtils";
import {
  handleFetchResponses,
  isAnonymousUser,
  logContentClick,
} from "../lib/utils";
import { jsonHeaders } from "../lib/headers";
import { signInTooltip } from "../lib/learningAndPlanning/learningAndPlanning";
import { ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/solid";
import { useAsync } from "react-async";
import { fetchLinkPreview } from "./conceptInfo";
import { LoadingSpinner } from "./animations";
import {
  BeakerIcon,
  CodeIcon,
  DocumentTextIcon,
  ExternalLinkIcon,
  PhotographIcon,
  PlayIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/outline";
import { GitHubIcon } from "./svgs/icons";
import Tippy from "@tippyjs/react";

type OnVote = (node: NodeSingular, url: string, up: boolean | null) => void;

export interface LinkPreviewData {
  status: number;
  map: string;
  concept: string;
  concept_id: string;
  url: string;
  title: string;
  description: string;
  image_url: string;
  content_type: string;
  estimated_time_to_complete: string;
  author: {
    id: string;
    name: string;
    image_url: string;
  };
  tags: {
    id: string;
    name: string;
    colour: string;
  }[];
  checked: boolean;
}

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

export const ContentCard = (props: {
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
}) => {
  const { data, isLoading } = useAsync<LinkPreviewData>({
    promiseFn: fetchLinkPreview,
    node: props.node,
    url: props.url,
    backendUrl: props.backendUrl,
    mapUUID: props.mapUUID,
    userId: props.userId,
  });
  const onVoteUpHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (props.userVotes[props.url] === true)
      // true  ->  null
      props.onVote(props.node, props.url, null);
    else if (
      props.userVotes[props.url] === null ||
      props.userVotes[props.url] === undefined
    )
      // null  ->  true
      props.onVote(props.node, props.url, true);
    else props.onVote(props.node, props.url, null); // false ->  null
  };
  const onVoteDownHandler = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (props.userVotes[props.url] === false) {
      // false ->  null
      props.onVote(props.node, props.url, null);
    } else if (
      props.userVotes[props.url] === null ||
      props.userVotes[props.url] === undefined
    )
      // null  ->  false
      props.onVote(props.node, props.url, false);
    else props.onVote(props.node, props.url, null); // true  ->  null
  };
  const conceptOnClickHandler = async () => {
    let extractedURL = "";
    let contentType = "";
    try {
      const res = await fetch("/api/iframe/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentURL: props.url,
        }),
      });
      const resJSON = await res.json();
      extractedURL = resJSON.url;
      contentType = resJSON.type;
    } catch (err) {
      console.warn("Error while handling iframe URL:", err);
    }
    if (extractedURL.length > 0) {
      props.setContentURL(extractedURL);
      props.setContentType(contentType);
      props.setIsContentModalOpen(true);
    } else {
      window.open(props.url, "_blank");
    }
    logContentClick(
      props.url,
      Number(props.node.id()),
      props.backendUrl,
      props.userId,
      props.mapUUID,
      props.sessionId
    );
  };
  const [checked, setChecked] = React.useState(false);
  useEffect(() => {
    if (data) setChecked(data.checked);
  }, [isLoading]);
  return (
    <div className="flex w-full">
      <div className="mr-4 flex h-36 items-center">
        <input
          type="checkbox"
          className={classNames(
            checked &&
              "ring-2 !ring-green-500 ring-offset-2 focus:!ring-2 focus:!ring-offset-2",
            "ml-2 h-6 w-6 cursor-pointer select-none rounded-full border-gray-300 text-green-600 focus:ring-0 focus:ring-offset-0"
          )}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {
            setChecked(!checked);
            postChecked(
              props.node,
              props.url,
              props.backendUrl,
              props.mapUUID,
              props.userId
            );
          }}
        />
      </div>
      {/* Below div contains card + description which pops out */}
      <div
        className="group border-b-none mb-2 flex w-full cursor-pointer flex-col rounded border border-zinc-100 shadow-sm transition-shadow hover:shadow-lg"
        onClick={conceptOnClickHandler}
      >
        <div className="z-20 flex h-36 border-b border-transparent bg-white group-hover:z-40 group-hover:border-zinc-100">
          <div className="relative flex h-auto w-32 place-items-center justify-center text-center sm:w-36">
            {data ? (
              <div
                className="m-auto h-full w-full overflow-hidden rounded-l bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${data.image_url})`,
                }}
              />
            ) : (
              <LoadingSpinner classes="h-3/5 w-3/5 m-auto" />
            )}
            <div className="absolute bottom-1 right-1 z-20 rounded bg-gray-900 px-0.5 opacity-80">
              <p className="font-sans text-xs text-white opacity-100">
                {data
                  ? convertToTimeString(data.estimated_time_to_complete)
                  : ""}
              </p>
            </div>
            {data && (
              <Tippy
                theme="dark"
                placement="bottom"
                content={data.content_type}
              >
                <div className="absolute top-1 right-1 rounded-full bg-gray-200 opacity-95">
                  <ContentTypeIcon
                    type={data.content_type}
                    className="m-1 h-5 w-5 opacity-100"
                  />
                </div>
              </Tippy>
            )}
          </div>
          <div
            className={classNames(
              "flex grow flex-col justify-between px-4 py-2 leading-normal lg:rounded-b-none lg:rounded-r",
              checked && "bg-green-100 hover:bg-green-200 "
            )}
          >
            <div className="flex justify-between">
              <div className="flex items-center gap-x-2">
                {data &&
                  data.tags &&
                  data.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                      style={{
                        backgroundColor: tag.colour,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
              </div>
            </div>
            {/* TITLE */}
            <div className="flex h-14 w-full max-w-xs flex-col justify-center text-left">
              <div
                className={`overflow-hidden text-ellipsis text-lg font-bold text-gray-900`}
              >
                {data && data.title}
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex w-10/12 items-center">
                <div className="flex h-10 place-items-center justify-center">
                  {data && data.author && data.author.image_url && (
                    <img
                      className="mr-3 w-10 rounded-full"
                      src={data && data.author && data.author.image_url}
                      alt={data && data.author && data.author.name}
                    />
                  )}
                </div>
                <div className="text-sm">
                  <p className="text-gray-900">
                    {data && data.author && data.author.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-end gap-x-2">
                  <button
                    onClick={onVoteUpHandler}
                    className={classNames(
                      "flex items-center justify-center rounded-full hover:bg-green-100"
                    )}
                  >
                    <ThumbUpIcon
                      className={classNames(
                        "h-6 w-6 p-0.5",
                        props.userVotes[props.url] ? "text-green-300" : ""
                      )}
                    />
                  </button>
                  <button
                    onClick={onVoteDownHandler}
                    className={classNames(
                      "flex items-center justify-center rounded-full hover:bg-red-100 ",
                      props.userVotes[props.url] === false ? "bg-red-300" : ""
                    )}
                  >
                    <ThumbDownIcon
                      className={classNames(
                        "h-6 w-6 p-0.5",
                        props.userVotes[props.url] == false
                          ? "text-red-500"
                          : ""
                      )}
                    />
                  </button>
                </div>
                {props.allVotes && (
                  <VoteBar
                    votes={{ for: props.allVotes[props.url], against: 0 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {data && data.description && (
          <div className="group-hover:duration-800 max-h-0 transition-[max-height] ease-in-out group-hover:z-30 group-hover:delay-500">
            <div className="duration-800 h-[6.5rem] max-w-[516px] -translate-y-full overflow-hidden whitespace-pre-line rounded-b bg-white px-4 py-2 text-left leading-normal text-black transition-transform ease-in-out group-hover:translate-y-0 group-hover:shadow-xl group-hover:delay-500">
              {data.description.slice(0, 512)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function convertToTimeString(timeString: string): string {
  // Get rid of everything after the decimal point if there is one
  timeString = timeString.split(".")[0];

  let outputString;
  const [hours, minutes, seconds] = timeString.split(":");
  if (hours !== "0") outputString = timeString;
  // If there are no hours, just show minutes and seconds
  else outputString = `${String(Number(minutes))}:${seconds}`;

  return outputString;
}

function ContentTypeIcon(props: { type: string; className: string }) {
  switch (props.type) {
    case "video":
      return <PlayIcon className={props.className} />;
    case "article":
      return <DocumentTextIcon className={props.className} />;
    case "image":
      return <PhotographIcon className={props.className} />;
    case "pdf":
      return <DocumentTextIcon className={props.className} />;
    case "website":
      return <ExternalLinkIcon className={props.className} />;
    case "code":
      return <CodeIcon className={props.className} />;
    case "github":
      return <GitHubIcon className={props.className} />;
    case "playground":
      return <BeakerIcon className={props.className} />;
    case "lecture_slides":
      return <PresentationChartLineIcon className={props.className} />;
    default:
      return <ExternalLinkIcon className={props.className} />;
  }
}

function VoteBar({ votes }: { votes: { for: number; against: number } }) {
  const totalVotes = votes.for + votes.against;
  return (
    <div className="h-1 w-full rounded-full">
      <div
        className="h-1 rounded-l-full bg-green-600"
        style={{ width: `${(votes.for * 100) / totalVotes}%` }}
      />
      <div
        className="h-1 rounded-r-full bg-red-600"
        style={{ width: `${(votes.against * 100) / totalVotes}%` }}
      />
    </div>
  );
}
