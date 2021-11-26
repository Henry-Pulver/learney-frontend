import React from "react";
import { classNames } from "../../lib/reactUtils";

export function EditConceptDataSidebar({
  editNodeData,
  setEditNodeData,
  setShowEditData,
  saveEditNodeData,
  userId,
}) {
  return (
    <div className="absolute right-1 top-24 pt-4 pb-8 bg-white rounded-lg max-h-screen-80 w-120 overflow-y-auto">
      <EditDataLabel>Concept Name</EditDataLabel>
      <EditDataInput
        classes="text-xl"
        type="text"
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
      <EditDataLabel>Topic Group</EditDataLabel>
      <EditDataInput
        className="text-black"
        type="text"
        value={editNodeData.parent}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, parent: e.target.value })
        }
      />
      <EditDataLabel>URLs (separated by a comma)</EditDataLabel>
      <EditDataInput
        type="text"
        value={editNodeData.urls}
        onChange={(e) =>
          setEditNodeData({ ...editNodeData, urls: e.target.value })
        }
      />
      <EditDataLabel>Relative Size</EditDataLabel>
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
          className="btn-3 ml-3"
          onClick={() => {
            window.cy.getElementById(editNodeData.id).remove();
            setShowEditData(null);
          }}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 mt-3 mr-6"
            onClick={() => setShowEditData(null)}
          >
            Cancel
          </span>
          <span
            className="btn-green px-6 mt-3 mr-6"
            onClick={() => saveEditNodeData(userId)}
          >
            Save
          </span>
        </div>
      </div>
    </div>
  );
}

export function EditTopicDataSidebar({
  editParentNodeData,
  setEditParentNodeData,
  saveEditParentNodeData,
  setShowEditData,
}) {
  return (
    <div className="absolute right-1 top-24 pt-4 pb-8 bg-white rounded-lg max-h-screen-80 w-120">
      <EditDataLabel>Topic Name</EditDataLabel>
      <EditDataInput
        classes="text-xl"
        type="text"
        value={editParentNodeData.name}
        setValue={(e) =>
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
        setValue={(e) =>
          setEditParentNodeData({
            ...editParentNodeData,
            colour: e.target.value,
          })
        }
      />
      <div className="flex justify-between">
        <span
          className="btn-3 ml-3"
          onClick={() => {
            window.cy.getElementById(editParentNodeData.id).remove();
            setShowEditData(null);
          }}
        >
          Delete
        </span>
        <div>
          <span
            className="btn-2 mt-3 mr-6"
            onClick={() => setShowEditData(null)}
          >
            Cancel
          </span>
          <span
            className="btn-green px-6 mt-3 mr-6"
            onClick={saveEditParentNodeData}
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

function EditDataInput({ type, classes, value, setValue }) {
  return (
    <input
      className={classNames(
        classes && classes,
        "text-black rounded-lg mt-0.5 mb-4 mx-6 w-108"
      )}
      type={type}
      value={value}
      onChange={setValue}
    />
  );
}
