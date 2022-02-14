import React, { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationIcon } from "@heroicons/react/outline";
import { classNames } from "../lib/reactUtils";
import { XCloseButton } from "./utils";
import { NodeData } from "./editor/types";

export default function Modal(props: {
  open: boolean;
  initialFocus?: React.MutableRefObject<any>;
  setClosed: () => void;
  dialogClassName?: string;
  modalClassName?: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        className={classNames(
          props.dialogClassName,
          "fixed inset-0 z-10 overflow-y-auto"
        )}
        initialFocus={props.initialFocus}
        onClose={props.setClosed}
      >
        <div
          className={classNames(
            props.modalClassName,
            "flex min-h-screen items-end justify-center px-2 pt-4 pb-20 text-center sm:block sm:p-0"
          )}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={classNames(
                props.contentClassName,
                "inline-block transform overflow-hidden rounded-lg bg-white p-4 text-left text-center align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
              )}
            >
              {props.children}
              <XCloseButton onClick={props.setClosed} />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function NotFullScreenModal(props: {
  open: boolean;
  initialFocus?: React.MutableRefObject<any>;
  setClosed: () => void;
  modalClassName?: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Transition.Root show={props.open}>
      <div className="absolute inset-0 z-10">
        <div
          className={classNames(
            props.modalClassName,
            "h-excl-toolbar flex items-end justify-center text-center sm:block sm:p-0 lg:px-2 lg:pt-2 lg:pb-2"
          )}
        >
          {/* Grey background covering! */}
          <Transition.Child
            // as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 min-h-screen bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={props.setClosed}
            />
          </Transition.Child>

          {/* Modal itself, containing the content */}
          <Transition.Child
            // as={Fragment}
            className="flex h-full w-full flex-col place-items-center justify-center"
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={classNames(
                props.contentClassName,
                "inline-block w-full transform overflow-hidden overflow-y-auto bg-white p-4 text-left text-center align-bottom shadow-xl transition-all sm:max-w-xl sm:p-6 sm:align-middle lg:my-4 lg:rounded-lg"
              )}
            >
              {props.children}
              <XCloseButton
                onClick={props.setClosed}
                class={"invisible lg:visible"}
              />
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition.Root>
  );
}

export function AreYouSureModal(props: {
  modalShown: boolean;
  setModalClosed: () => void;
  titleText: string;
  descriptionText: string | Array<string>;
  actionButtonText: string;
  actionButtonFunction: () => void;
}) {
  const actionButtonRef = useRef(null);
  return (
    <Modal
      open={props.modalShown}
      setClosed={props.setModalClosed}
      initialFocus={actionButtonRef}
      contentClassName=""
      modalClassName=""
    >
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationIcon
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
            ref={actionButtonRef}
          />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            {props.titleText}
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500"> {props.descriptionText} </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="focus:outline-none inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            props.actionButtonFunction();
            props.setModalClosed();
          }}
        >
          {props.actionButtonText}
        </button>
        <button
          type="button"
          className="focus:outline-none mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={() => props.setModalClosed()}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function getAreYouSureDescriptionText(
  deleteNodeData: NodeData
): Array<string> {
  let detailedInfoText;
  if (deleteNodeData.nodetype === "field") {
    const numChildren = window.cy
      .nodes(`[id="${deleteNodeData.id}"]`)
      .children()
      .size();
    detailedInfoText = (
      <b>{`This topic has ${numChildren} concepts, which will all be deleted!`}</b>
    );
  } else {
    detailedInfoText = (
      <b>{`This concept has ${deleteNodeData.urls.length} URLs associated with it, which will all be lost if you delete it!`}</b>
    );
  }
  return [
    `Are you sure you want to delete ${deleteNodeData.nodetype} ${deleteNodeData.name}? `,
    detailedInfoText,
  ];
}
