import { Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import { EyeIcon, VideoCameraIcon } from "./svgs/icons";

export const ContentCard = () => {
  const onVoteUpHandler = () => {
    //TODO: Do something here.
  };
  const onVoteDownHandler = () => {
    //TODO: Do something here.
  };
  const [showDescription, setshowDescription] = React.useState(false);
  const displayCardRef = React.useRef(null);
  const fullCardRef = React.useRef(null);
  return (
    <>
      <div
        className=" flex max-h-40 w-full hover:bg-neutral-50 "
        ref={fullCardRef}
      >
        <div className="mr-4 flex max-w-[6%] items-center">
          <input
            type="checkbox"
            className="ml-2 h-6 w-6 cursor-pointer select-none rounded-full border-gray-300 text-green-600 focus:ring-0 focus:ring-offset-0"
          />
        </div>
        <div className="flex max-h-40 w-full " ref={displayCardRef}>
          <div
            className="overflow-hiddenbg-cover relative flex h-auto min-w-[28%] rounded-l text-center"
            title="Content Image"
          >
            <img src="/images/testImage.jpeg" className="rounded-l" />
            <div className="absolute bottom-1 right-1 z-10 font-sans text-xs">
              2 mins
            </div>
          </div>
          <div
            className="flex w-full max-w-[66%] flex-col justify-between rounded-b border-r border-b border-l border-zinc-100 bg-white p-4 leading-normal lg:rounded-b-none lg:rounded-r lg:border-l-0 lg:border-t"
            onMouseEnter={() => {
              setshowDescription(true);
            }}
            onMouseLeave={() => {
              setshowDescription(false);
            }}
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
            <div className="mb-2 text-left">
              <div
                className={`text-l text-ellipises mb-2 inline-block w-full max-w-xs truncate text-left font-bold text-gray-900`}
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
                  onClick={onVoteDownHandler}
                  className="mr-2 rounded-full hover:bg-green-100"
                >
                  <img
                    src="/images/Thumbsup.svg"
                    alt="Vote up"
                    className="p-1"
                  />
                </button>
                <button
                  onClick={onVoteUpHandler}
                  className="rounded-full hover:bg-red-100 "
                >
                  <img
                    src="/images/ThumbsDown.svg"
                    alt="Vote down"
                    className="p-1"
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
            width: `${displayCardRef.current.offsetWidth}px`,
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
