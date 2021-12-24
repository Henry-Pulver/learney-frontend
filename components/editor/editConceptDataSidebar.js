import React from "react";
import { classNames } from "../../lib/reactUtils";
import { XIcon } from "@heroicons/react/outline";

export function EditConceptDataSidebar({
  editNodeData,
  setEditNodeData,
  setShowEditData,
  saveEditNodeData,
  deletebuttonClickFunction,
  userId,
  buttonPressFunction,
}) {
  return (
    <div className="absolute right-1 top-24 py-6 bg-white rounded-lg max-h-screen-80 w-120 overflow-y-auto">
      {/* Close X in top right */}
      <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
        <button
          type="button"
          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={buttonPressFunction(
            () => setShowEditData(null),
            `Edit Concept Top Right Close X (Concept: ${editNodeData.name})`
          )}
        >
          <span className="sr-only">Close</span>
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
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
        className="text-black"
        type="text"
        value={editNodeData.parent}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, parent: e.target.value })
        }
      />
      <EditDataLabel>Resource URLs (separate with a comma)</EditDataLabel>
      <EditDataInput
        type="text"
        value={editNodeData.urls}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, urls: e.target.value })
        }
      />
      <EditDataLabel>Node Size</EditDataLabel>
      <EditDataInput
        type="number"
        value={editNodeData.relative_importance}
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
          }, `Edit Concept Delete Button (Concept=${editNodeData.name})`)}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 btn-sm mt-3 mr-6"
            onClick={buttonPressFunction(
              () => setShowEditData(null),
              `Edit Concept Cancel Button (Concept: ${editNodeData.name})`
            )}
          >
            Cancel
          </span>
          <span
            className="btn-green btn-sm px-6 mt-3 mr-6"
            onClick={buttonPressFunction(
              () => saveEditNodeData(userId),
              `Edit Concept Save Button (Concept: ${editNodeData.name})`
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
    <div className="absolute right-1 top-24 py-6 bg-white rounded-lg max-h-screen-80 w-120">
      {/* Close X in top right */}
      <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
        <button
          type="button"
          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={buttonPressFunction(
            () => setShowEditData(null),
            `Edit Concept Top Right Close X (Concept: ${editParentNodeData.name})`
          )}
        >
          <span className="sr-only">Close</span>
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
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
      <div className="flex justify-between">
        <span
          className="btn-4 btn-sm ml-7 mt-3"
          onClick={buttonPressFunction(() => {
            deletebuttonClickFunction(editParentNodeData.id);
            setShowEditData(null);
          }, `Edit Topic Delete Button (Topic: ${editParentNodeData.name})`)}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 btn-sm mt-3 mr-6"
            onClick={buttonPressFunction(
              () => setShowEditData(null),
              `Edit Topic Cancel Button (Topic: ${editParentNodeData.name})`
            )}
          >
            Cancel
          </span>
          <span
            className="btn-green btn-sm px-6 mt-3 mr-6"
            onClick={buttonPressFunction(
              () => saveEditParentNodeData(editParentNodeData),
              `Edit Topic Save Button (Topic: ${editParentNodeData.name})`
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
    <div className="text-gray-600 font-xs font-medium mx-7 my-1">
      {props.children}
    </div>
  );
}

function EditDataTextArea({ value, editValue }) {
  return (
    <textarea
      className="mt-0.5 mb-4 mx-6 min-h-30 w-108 resize-none border-sm rounded-lg"
      value={value}
      onChange={editValue}
    />
  );
}

function EditDataInput({ type, classes, value, onChange }) {
  return (
    <input
      className={classNames(
        classes && classes,
        "text-black rounded-lg mt-0.5 mb-4 mx-6 w-108"
      )}
      type={type}
      value={value}
      onChange={onChange}
    />
  );
}
