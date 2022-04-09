import React from "react";
import { classNames } from "../../lib/reactUtils";
import { NodeData } from "./types";
import { ButtonPressFunction } from "../../lib/types";
import { XCloseButton } from "../utils";

export function EditConceptDataSidebar({
  editNodeData,
  setEditNodeData,
  setShowEditData,
  saveEditNodeData,
  deletebuttonClickFunction,
  userId,
  buttonPressFunction,
}: {
  editNodeData: NodeData;
  setEditNodeData: (NodeData) => void;
  setShowEditData: (boolean) => void;
  saveEditNodeData: (NodeData) => void;
  deletebuttonClickFunction: (number) => void;
  userId: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <div className="max-h-screen-80 w-120 absolute right-1 top-24 overflow-y-auto rounded-lg bg-white py-6">
      {/* Close X in top right */}
      <XCloseButton
        onClick={buttonPressFunction(
          () => setShowEditData(null),
          `Edit Concept Top Right Close X (Concept: ${
            editNodeData.name || editNodeData.id
          })`
        )}
      />
      <EditDataLabel>Concept Name</EditDataLabel>
      <EditDataInput
        type="text"
        classes="text-xl"
        value={editNodeData.name}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, name: e.target.value })
        }
      />
      <EditDataLabel>Description</EditDataLabel>
      <EditDataTextArea
        value={editNodeData.description}
        editValue={(e) =>
          setEditNodeData({ ...editNodeData, description: e.target.value })
        }
      />
      <EditDataLabel>Topic Name</EditDataLabel>
      <EditDataInput
        classes="text-black"
        type="text"
        value={editNodeData.parent}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, parent: e.target.value })
        }
      />
      <EditDataLabel>Resource URLs (separate with a comma)</EditDataLabel>
      <EditDataTextArea
        value={
          typeof editNodeData.urls === "string"
            ? editNodeData.urls
            : editNodeData.urls.join(",")
        }
        editValue={(e) =>
          setEditNodeData({ ...editNodeData, urls: e.target.value })
        }
      />
      <EditDataLabel>Node Size</EditDataLabel>
      <EditDataInput
        type="number"
        value={editNodeData.relative_importance.toString()}
        onChange={(e) =>
          setEditNodeData({
            ...editNodeData,
            relative_importance: e.target.value,
          })
        }
      />
      <div className="flex justify-between">
        <span
          className="btn-4 btn-sm ml-7 mt-3"
          onClick={buttonPressFunction(() => {
            deletebuttonClickFunction(editNodeData.id);
            setShowEditData(null);
          }, `Edit Concept Delete Button (Concept=${editNodeData.name || editNodeData.id})`)}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 btn-sm mt-3 mr-6"
            onClick={buttonPressFunction(
              () => setShowEditData(null),
              `Edit Concept Cancel Button (Concept: ${
                editNodeData.name || editNodeData.id
              })`
            )}
          >
            Cancel
          </span>
          <span
            className="btn-green btn-sm mt-3 mr-6 px-6"
            onClick={buttonPressFunction(
              () => saveEditNodeData(userId),
              `Edit Concept Save Button (Concept: ${
                editNodeData.name || editNodeData.id
              })`
            )}
          >
            Save
          </span>
        </div>
      </div>
    </div>
  );
}

export function EditTopicDataSidebar({
  buttonPressFunction,
  editParentNodeData,
  setEditParentNodeData,
  saveEditParentNodeData,
  deletebuttonClickFunction,
  setShowEditData,
}) {
  return (
    <div className="max-h-screen-80 w-120 absolute right-1 top-24 rounded-lg bg-white py-6">
      {/* X IN THE TOP RIGHT */}
      <XCloseButton
        onClick={buttonPressFunction(
          () => setShowEditData(null),
          `Edit Concept Top Right Close X (Concept: ${
            editParentNodeData.name || editParentNodeData.id
          })`
        )}
      />
      <EditDataLabel>Topic Name</EditDataLabel>
      <EditDataInput
        classes="text-xl"
        type="text"
        value={editParentNodeData.name}
        onChange={(e) =>
          setEditParentNodeData({
            ...editParentNodeData,
            name: e.target.value,
          })
        }
      />
      <EditDataLabel>Colour</EditDataLabel>
      <div className="justify flex flex w-full items-center">
        <div className="w-3/4">
          <EditDataInput
            type="text"
            value={editParentNodeData.colour}
            onChange={(e) =>
              setEditParentNodeData({
                ...editParentNodeData,
                colour: e.target.value,
              })
            }
          />
        </div>
        <div className="w-1/4 rounded-full ">
          <input
            type="color"
            value={editParentNodeData.colour}
            className="mx-6 mt-0.5 mb-4"
            onChange={(e) =>
              setEditParentNodeData({
                ...editParentNodeData,
                colour: e.target.value,
              })
            }
          />
        </div>
      </div>
      <div className="flex justify-between">
        <span
          className="btn-4 btn-sm ml-7 mt-3"
          onClick={buttonPressFunction(() => {
            deletebuttonClickFunction(editParentNodeData.id);
            setShowEditData(null);
          }, `Edit Topic Delete Button (Topic: ${editParentNodeData.name || editParentNodeData.id})`)}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 btn-sm mt-3 mr-6"
            onClick={buttonPressFunction(
              () => setShowEditData(null),
              `Edit Topic Cancel Button (Topic: ${
                editParentNodeData.name || editParentNodeData.id
              })`
            )}
          >
            Cancel
          </span>
          <span
            className="btn-green btn-sm mt-3 mr-6 px-6"
            onClick={buttonPressFunction(
              () => saveEditParentNodeData(editParentNodeData),
              `Edit Topic Save Button (Topic: ${
                editParentNodeData.name || editParentNodeData.id
              })`
            )}
          >
            Save
          </span>
        </div>
      </div>
    </div>
  );
}

function EditDataLabel(props) {
  return (
    <div className="font-xs mx-7 my-1 font-medium text-gray-600">
      {props.children}
    </div>
  );
}

function EditDataTextArea({ value, editValue }) {
  /** This text area auto-grows using a hack I found on the internet:
      https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/ **/
  return (
    <div className="w-108 container mx-auto mx-6 mt-0.5 mb-4">
      <div className="min-h-16 relative flex max-h-36 w-full py-2.5 px-3">
        <div className="invisible w-full overflow-y-auto whitespace-pre-wrap break-words text-base">
          {value}
        </div>
        <textarea
          className="border-sm absolute inset-0 h-full w-full resize-none resize-none overflow-y-auto rounded-lg text-base"
          value={value}
          onChange={editValue}
        />
      </div>
    </div>
  );
}

function EditDataInput({
  type,
  classes,
  value,
  onChange,
}: {
  type: string;
  classes?: string;
  value: string;
  onChange: (event) => void;
}) {
  return (
    <input
      className={classNames(
        classes && classes,
        "w-108 mx-6 mt-0.5 mb-4 rounded-lg text-black"
      )}
      type={type}
      value={value}
      onChange={onChange}
    />
  );
}
