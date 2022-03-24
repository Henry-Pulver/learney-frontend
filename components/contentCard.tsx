import { Transition } from "@headlessui/react";
import { NodeSingular } from "cytoscape";
import React, { Fragment } from "react";
import { classNames } from "../lib/reactUtils";
import { handleFetchResponses, isAnonymousUser } from "../lib/utils";
import { VideoCameraIcon } from "./svgs/icons";
import { jsonHeaders } from "../lib/headers";
import { signInTooltip } from "../lib/learningAndPlanning/learningAndPlanning";
import { ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/solid";

type OnVote = (node: NodeSingular, url: string, up: boolean | null) => void;
interface IProps {
  node: NodeSingular;
  url: string;
  backendUrl: string;
  userId: string;
  mapUUID: string;
  userVotes: object;
  onVote: OnVote;
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

export const ContentCard = ({
  node,
  url,
  backendUrl,
  mapUUID,
  userId,
  userVotes,
  onVote,
}: IProps) => {
  const onVoteUpHandler = () => {
    userVotes[url]
      ? () => onVote(node, url, null) // true  ->  null
      : userVotes[url] === null || userVotes[url] === undefined
      ? () => onVote(node, url, true) // null  ->  true
      : () => onVote(node, url, null); // false ->  null
  };
  const onVoteDownHandler = () => {
    userVotes[url] === false
      ? () => onVote(node, url, null) // false ->  null
      : userVotes[url] === null || userVotes[url] === undefined
      ? () => onVote(node, url, false) // null  ->  false
      : () => onVote(node, url, null); // true  ->  null
  };
  const [showDescription, setshowDescription] = React.useState(false);
  const displayCardRef = React.useRef(null);
  const fullCardRef = React.useRef(null);
  const [checked, setChecked] = React.useState(false);
  return (
    <>
      <div
        className="flex max-h-36 w-full hover:bg-neutral-50 "
        ref={fullCardRef}
        onMouseEnter={() => {
          setshowDescription(true);
        }}
        onMouseLeave={() => {
          setshowDescription(false);
        }}
      >
        <div className="mr-4 flex w-[6%] items-center">
          <input
            type="checkbox"
            className={classNames(
              checked &&
                "ring-2 !ring-green-500 ring-offset-2 focus:!ring-2 focus:!ring-offset-2",
              "ml-2 h-6 w-6 cursor-pointer select-none rounded-full border-gray-300 text-green-600 focus:ring-0 focus:ring-offset-0"
            )}
            onChange={() => {
              setChecked(!checked);
              postChecked(node, url, backendUrl, mapUUID, userId);
            }}
          />
        </div>
        <div className="flex max-h-40 w-full " ref={displayCardRef}>
          <div
            className="overflow-hiddenbg-cover relative flex h-auto w-[26%] rounded-l text-center"
            title="Content Image"
          >
            <img src="/images/testImage.jpeg" className="w-fit rounded-l" />
            <div className="z-2 absolute bottom-1 right-1 font-sans text-xs">
              2 mins
            </div>
          </div>
          <div
            className={classNames(
              "flex w-[72%] w-full flex-col justify-between rounded-b border-r border-b border-l border-zinc-100 bg-white p-4 leading-normal lg:rounded-b-none lg:rounded-r lg:border-l-0 lg:border-t",
              checked && "bg-green-100 hover:bg-green-200 "
            )}
          >
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="mr-2 inline-block rounded-full bg-green-200 px-3 py-1 text-sm font-semibold text-gray-700">
                  easy
                </span>
              </div>
              <div className="bg-ray-500 flex flex-col justify-center rounded-full bg-[#ededed]">
                <VideoCameraIcon />
              </div>
            </div>
            <div className="mt-2  mb-2 text-left">
              <div
                className={`text-l text-ellipises inline-block w-full max-w-xs truncate text-left font-bold text-gray-900`}
              >
                What is a Generative Model? This is an overflowing text
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-10/12 items-center">
                <img
                  className="mr-4 h-10 w-10 rounded-full"
                  src="/images/testImage.jpeg"
                  alt="Avatar of Jonathan Reinink"
                />
                <div className="text-sm">
                  <p className="leading-none text-gray-900">
                    Google Developers
                  </p>
                </div>
              </div>
              <div className="flex w-2/12 items-center justify-end">
                <button
                  onClick={onVoteUpHandler}
                  className={classNames(
                    "mr-2 flex items-center justify-center rounded-full hover:bg-green-100"
                  )}
                >
                  {/* <ThumbsUp classes={"p-1"} /> */}
                  <ThumbUpIcon
                    className={classNames(
                      "h-6 w-6 p-0.5",
                      userVotes[url] !== undefined && userVotes[url]
                        ? "text-green-300"
                        : ""
                    )}
                  />
                </button>
                <button
                  onClick={onVoteDownHandler}
                  className={classNames(
                    "flex items-center justify-center rounded-full hover:bg-red-100 ",
                    userVotes[url] !== undefined && userVotes[url]
                      ? "bg-red-300"
                      : ""
                  )}
                >
                  {/* <ThumbsDown classes={`p-1`} /> */}
                  <ThumbDownIcon
                    className={classNames(
                      "h-6 w-6 p-0.5 ",
                      userVotes[url] !== undefined && userVotes[url]
                        ? "text-red-500"
                        : ""
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDescription && (
        <div
          className={`-mt-2 mb-2 flex flex-col justify-between rounded-b border-r border-b border-l border-zinc-100 bg-white p-4 text-left leading-normal`}
          style={{
            width: `${0.98 * displayCardRef.current.offsetWidth}px`,
            marginLeft: `${
              fullCardRef.current.offsetWidth -
              displayCardRef.current.offsetWidth
            }px`,
            transition: "10s",
          }}
          id="descDiv"
        >
          This place is for description and we can write the content description
          here. Should we put a cap after 4 -6 lines maybe?
        </div>
      )}
    </>
  );
};
