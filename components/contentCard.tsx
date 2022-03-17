import { urlObjectKeys } from "next/dist/shared/lib/utils";
import React from "react";
import { EyeIcon } from "./svgs/icons";

export const ContentCard = () => {
  const onVoteUpHandler = () => {
    //TODO: Do something here.
  };
  const onVoteDownHandler = () => {
    //TODO: Do something here.
  };
  return (
    <div className="flex w-full">
      <div
        className="overflow-hiddenbg-cover flex h-48 min-w-[30%] rounded-l text-center "
        title="Content Image"
      >
        <img src="/images/testImage.jpeg" className="rounded-l" />
      </div>
      <div className="flex w-full flex-col justify-between rounded-b border-r border-b border-l border-zinc-100 bg-white p-4 leading-normal lg:rounded-b-none lg:rounded-r lg:border-l-0 lg:border-t ">
        <div className="flex justify-between">
          <div className="flex items-center">
            <span className=" mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-lg font-semibold text-gray-700">
              blog
            </span>
            <span className="mr-2 inline-block rounded-full bg-green-200 px-3 py-1 text-lg font-semibold text-gray-700">
              easy
            </span>
          </div>
          <div className="flex-col justify-center">
            <EyeIcon />
            <span className="font-sans text-xs">2 mins</span>
          </div>
        </div>
        <div className="mb-8">
          <div className="mb-2 flex text-xl font-bold text-gray-900">
            What is a Generative Model?
          </div>
        </div>
        <div className="flex w-full items-center">
          <div className="flex w-1/2 items-center">
            <img
              className="mr-4 h-10 w-10 rounded-full"
              src="/images/testImage.jpeg"
              alt="Avatar of Jonathan Reinink"
            />
            <div className="text-sm">
              <p className="leading-none text-gray-900">Google Developers</p>
            </div>
          </div>
          <div className="flex w-1/2 items-center justify-end">
            <button onClick={onVoteDownHandler} className="hover:bg-violet-50 ">
              <img src="/images/Thumbsup.svg" alt="Vote up" className="pr-2" />
            </button>
            <button onClick={onVoteUpHandler}>
              <img src="/images/ThumbsDown.svg" alt="Vote down" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
