import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  CogIcon,
  MapIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { classNames } from "../../lib/reactUtils";
import Tippy from "@tippyjs/react";
import { IconButtonTippy } from "../buttons";
import {jsonHeaders} from "../../lib/headers";
import {handleFetchResponses} from "../../lib/utils";

const dagreLayout = {
  name: "dagre",
  rankDir: "BT",
  nodeSep: 100,
  rankSep: 300,
};

function autoGenerateLayout() {
  let actions = [
    {
      name: "layout",
      param: { options: dagreLayout, eles: window.cy.elements() },
    },
  ];
  /** Run Dagre algorithm on each subject individually **/
  let subjects = [];
  window.cy
    .nodes('[nodetype= "field"]')
    .forEach((field) => subjects.push(field.name));

  subjects.forEach(function (subject) {
    let subject_subgraph = window.cy.filter(`node[subject = "${subject}"]`);
    subject_subgraph.merge(subject_subgraph.connectedEdges());
    actions.push({
      name: "layout",
      param: { options: dagreLayout, eles: subject_subgraph },
    });
  });
  window.ur.do("batch", actions);
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
                    Undo all
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

export function SaveMapButton({
  userId,
  buttonPressFunction,
  backendUrl,
  mapUUID,
}) {
  return (
    <button
      className="btn-blue ml-4 whitespace-nowrap"
      onClick={buttonPressFunction(
        () => saveMap(userId, backendUrl, mapUUID),
        "Editor - Save Layout"
      )}
    >
      Save Map
    </button>
  );
}

export async function saveMap(userId, backendUrl, mapUUID) {
  let mapJson = { nodes: [], edges: [] };
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
      map_uuid: mapUUID,
      map_data: mapJson,
    }),
  });
  handleFetchResponses(response, backendUrl);
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
          "grid content-center justify-center hover:bg-red-600",
          editToolsButtonClasses
        )}
        onClick={() => setEditType("delete")}
      >
        <TrashIcon className="text-black w-9 h-9" />
      </div>
    </Tippy>
  );
}
