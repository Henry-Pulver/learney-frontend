import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  CogIcon,
  MapIcon,
  PlusCircleIcon,
} from "@heroicons/react/outline";
import { classNames } from "../../lib/reactUtils";
import Tippy from "@tippyjs/react";
import { IconButtonTippy } from "../buttons";
import { dagreLayout, dagreOnSubjects } from "../../lib/graph";

function autoGenerateLayout() {
  window.cy.layout(dagreLayout).run();
  dagreOnSubjects();
}

export function MapSettingsIconButton({ buttonPressFunction }) {
  return (
    <Menu as="div" className="ml-3 relative">
      {({ open }) => (
        <>
          <div>
            <IconButtonTippy
              content={"Map layout settings"}
              placement={"bottom"}
              disabled={open}
            >
              <Menu.Button className="gray-icon-btn">
                <span className="sr-only">Map layout settings</span>
                <div className="relative h-7 w-7">
                  <MapIcon className="absolute h-6 w-6 right-0.5 top-0.5" />
                  <CogIcon className="bg-white rounded-full absolute h-4 w-4 left-4 bottom-3.5" />
                </div>
              </Menu.Button>
            </IconButtonTippy>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg z-20 py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={buttonPressFunction(
                      () => window.ur.undoAll(),
                      "Editor - Reset Layout"
                    )}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 w-48 text-sm text-left text-gray-700"
                    )}
                  >
                    Reset Layout
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={buttonPressFunction(
                      autoGenerateLayout,
                      "Editor - Auto-Generate Layout"
                    )}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 w-48 text-sm text-left text-gray-700"
                    )}
                  >
                    Auto-generate Layout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
}

const editToolsButtonClasses =
  "transition duration-200 ease-in-out rounded-md m-1.5 h-14 w-14";

export function CursorButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Edit nodes"
      placement={"right"}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "cursor" ? "bg-blue-500" : "",
          "hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={() => setEditType("cursor")}
      >
        <svg className={"scale-90"} viewBox="0 0 28 28">
          <rect
            x="12.5"
            y="13.6"
            transform="matrix(0.9221 -0.3871 0.3871 0.9221 -5.7605 6.5909)"
            width="1.5"
            height="8"
          />
          <polygon points="9.2,7.3 9.2,18.5 12.2,15.6 12.6,15.5 17.4,15.5 " />
        </svg>
      </div>
    </Tippy>
  );
}

export function AddNodeButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Add concept"
      placement={"right"}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "addNode" ? "bg-blue-500" : "",
          "grid content-center justify-center hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={() => setEditType("addNode")}
      >
        <PlusCircleIcon className="text-black w-10 h-10" />
      </div>
    </Tippy>
  );
}

export function AddEdgesButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Add dependency"
      placement={"right"}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "addEdges" ? "bg-blue-500" : "",
          "hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={() => setEditType("addEdges")}
      >
        <svg className={"scale-50"} viewBox="0 0 347.341 347.341">
          <polygon points="347.341,107.783 347.339,0 239.559,0.002 282.843,43.285 0,326.128 21.213,347.341 304.056,64.498 " />
        </svg>
      </div>
    </Tippy>
  );
}

export function DeleteElementButton({ editType, setEditType }) {
  return (
    <Tippy content="Delete" placement={"right"} delay={[500, 0]} theme="light">
      <div
        className={classNames(
          editType === "delete" ? "bg-red-500" : "",
          "hover:bg-red-600",
          editToolsButtonClasses
        )}
        onClick={() => setEditType("delete")}
      >
        <svg className={"scale-40"} viewBox="0 0 460.775 460.775">
          <path
            d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
	c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
	c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
	c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
	l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
	c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
          />
        </svg>
      </div>
    </Tippy>
  );
}
