import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  CogIcon,
  MapIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { classNames } from "../../lib/reactUtils";
import Tippy from "@tippyjs/react";
import { IconButtonTippy } from "../buttons";
import { jsonHeaders } from "../../lib/headers";
import { handleFetchResponses } from "../../lib/utils";
import { ButtonPressFunction } from "../../lib/types";

const dagreLayout = {
  name: "dagre",
  rankDir: "BT",
  nodeSep: 100,
  rankSep: 300,
};

function autoGenerateLayout(): void {
  const actions = [
    {
      name: "layout",
      param: { options: dagreLayout, eles: window.cy.elements() },
    },
  ];
  /** Run Dagre algorithm on each subject individually **/
  const subjects: Array<string> = [];
  window.cy
    .nodes('[nodetype= "field"]')
    // @ts-ignore
    .forEach((topic) => subjects.push(topic.data().name));

  subjects.forEach((subject) => {
    const subject_subgraph = window.cy.filter(`node[subject = "${subject}"]`);
    subject_subgraph.merge(subject_subgraph.connectedEdges());
    actions.push({
      name: "layout",
      param: { options: dagreLayout, eles: subject_subgraph },
    });
  });
  window.ur.do("batch", actions);
}

export function MapSettingsIconButton({
  buttonPressFunction,
  pageLoaded,
}: {
  buttonPressFunction: ButtonPressFunction;
  pageLoaded: boolean;
}) {
  return (
    <Menu as="div" className="relative ml-3">
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
                  <MapIcon className="absolute right-0.5 top-0.5 h-6 w-6" />
                  <CogIcon className="absolute left-4 bottom-3.5 h-4 w-4 rounded-full bg-white" />
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
            <Menu.Items className="focus:outline-none absolute left-0 z-20 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={
                      pageLoaded
                        ? buttonPressFunction(
                            () => window.ur.undoAll(),
                            "Editor - Reset Layout"
                          )
                        : buttonPressFunction(() => {},
                          "Editor - Reset Layout (void)")
                    }
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block w-48 px-4 py-2 text-left text-sm text-gray-700"
                    )}
                  >
                    Undo all
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={
                      pageLoaded
                        ? buttonPressFunction(
                            autoGenerateLayout,
                            "Editor - Auto-Generate Layout"
                          )
                        : buttonPressFunction(() => {},
                          "Editor - Auto-Generate Layout (void)")
                    }
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block w-48 px-4 py-2 text-left text-sm text-gray-700"
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

export function SaveMapButton({
  userId,
  buttonPressFunction,
  backendUrl,
  mapUUID,
  updateNotificationInfo,
  pageLoaded,
}: {
  userId: string;
  buttonPressFunction: ButtonPressFunction;
  backendUrl: string;
  mapUUID: string;
  updateNotificationInfo: (NotificationData) => void;
  pageLoaded: boolean;
}) {
  return (
    <button
      className="btn-blue btn-md ml-4 whitespace-nowrap"
      onClick={
        pageLoaded
          ? buttonPressFunction(() => {
              saveMap(userId, backendUrl, mapUUID);
              const pathElements = location.href.split("/");
              pathElements.splice(pathElements.length - 2, 1);
              const newState = {
                title: "Saved successfully!",
                message: (
                  <>
                    You can now see this map live at{" "}
                    <a
                      href={pathElements.join("/")}
                      className="text-semibold decoration-blue-300 underline-offset-4 hover:decoration-blue-400 text-gray-900 underline hover:text-blue-400"
                    >
                      {pathElements.join("/")}
                    </a>
                  </>
                ),
                Icon: CheckCircleIcon,
                colour: "green",
                show: true,
                side: "right",
              };
              updateNotificationInfo(newState);
            }, "Editor - Save Layout")
          : buttonPressFunction(() => {}, "Editor - Save Layout (void)")
      }
    >
      Save Map
    </button>
  );
}

export async function saveMap(userId, backendUrl, mapUUID) {
  const mapJson = { nodes: [], edges: [] };
  window.cy.edges().forEach(function (edge) {
    mapJson.edges.push({ data: edge.data() });
  });
  window.cy.nodes().forEach(function (node) {
    mapJson.nodes.push({ data: node.data(), position: node.position() });
  });
  const response = await fetch(`${backendUrl}/api/v0/knowledge_maps`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({
      user_id: userId,
      map: mapUUID,
      map_data: mapJson,
    }),
  });
  handleFetchResponses(response, backendUrl);
}

function EditorModeTippy(props) {
  return (
    <Tippy
      content={props.content}
      placement={"right"}
      delay={[500, 0]}
      theme="light"
      maxWidth="200px"
      allowHTML={true}
    >
      {props.children}
    </Tippy>
  );
}

const editToolsButtonClasses =
  "transition duration-200 ease-in-out rounded-md m-1.5 h-14 w-14";

export function CursorButton({ editType, setEditType, buttonPressFunction }) {
  return (
    <EditorModeTippy
      content={
        <div className="flex">
          Edit nodes <p className="hotkey-label-text">C</p>
        </div>
      }
    >
      <div
        className={classNames(
          editType === "cursor" ? "bg-blue-500" : "",
          "hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={buttonPressFunction(
          () => setEditType("cursor"),
          "Editor Cursor Tool"
        )}
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
    </EditorModeTippy>
  );
}

export function AddNodeButton({ editType, setEditType, buttonPressFunction }) {
  return (
    <EditorModeTippy
      content={
        <div className="flex">
          Add concept <p className="hotkey-label-text">A</p>
        </div>
      }
    >
      <div
        className={classNames(
          editType === "addNode" ? "bg-blue-500" : "",
          "grid content-center justify-center hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={buttonPressFunction(
          () => setEditType("addNode"),
          "Editor Add Node Tool"
        )}
      >
        <PlusCircleIcon className="h-10 w-10 text-black" />
      </div>
    </EditorModeTippy>
  );
}

export function AddEdgesButton({ editType, setEditType, buttonPressFunction }) {
  return (
    <EditorModeTippy
      content={
        <div className="flex">
          Add dependency <p className="hotkey-label-text">E</p>
        </div>
      }
    >
      <div
        className={classNames(
          editType === "addEdges" ? "bg-blue-500" : "",
          "hover:bg-blue-600",
          editToolsButtonClasses
        )}
        onClick={buttonPressFunction(
          () => setEditType("addEdges"),
          "Editor Add Dependency Tool"
        )}
      >
        <svg className={"scale-50"} viewBox="0 0 347.341 347.341">
          <polygon points="347.341,107.783 347.339,0 239.559,0.002 282.843,43.285 0,326.128 21.213,347.341 304.056,64.498 " />
        </svg>
      </div>
    </EditorModeTippy>
  );
}

export function DeleteElementButton({
  editType,
  setEditType,
  buttonPressFunction,
}) {
  return (
    <EditorModeTippy
      content={
        <div className="flex">
          Delete <p className="hotkey-label-text">D</p>
        </div>
      }
    >
      <div
        className={classNames(
          editType === "delete" ? "bg-red-500" : "",
          "grid content-center justify-center hover:bg-red-600",
          editToolsButtonClasses
        )}
        onClick={buttonPressFunction(
          () => setEditType("delete"),
          "Editor Delete Tool"
        )}
      >
        <TrashIcon className="h-9 w-9 text-black" />
      </div>
    </EditorModeTippy>
  );
}
