import React, { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { XCloseButton } from "./utils";
import { classNames } from "../lib/reactUtils";

export default function Overlay(props: {
  open: boolean;
  hide: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Transition.Root show={props.open} as={Fragment}>
      <div
        className={classNames(
          props.className,
          "fixed right-0 bottom-0 lg:relative shadow-md w-full sm:w-108 lg:w-168 flex overflow-hidden h-excl-toolbar z-0"
        )}
      >
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-400 sm:duration-600"
          enterFrom="translate-y-full sm:translate-y-0 sm:translate-x-full"
          enterTo="translate-y-0 sm:translate-x-0"
          leave="transform transition ease-in-out duration-400 sm:duration-600"
          leaveFrom="translate-y-0 sm:translate-x-0"
          leaveTo="translate-y-full sm:translate-x-full"
        >
          <div className="relative flex flex-col w-full sm:py-6 bg-white shadow-xl overflow-y-hidden">
            <XCloseButton onClick={props.hide} visibleOnMobile={true} />
            <div className="mt-4 sm:mt-6 flex-1 sm:px-2">{props.children}</div>
          </div>
        </Transition.Child>
      </div>
    </Transition.Root>
  );
}
