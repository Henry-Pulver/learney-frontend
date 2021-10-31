import {
  initialiseGraphState,
  resetProgress,
} from "../lib/learningAndPlanning";
import { handleFetchResponses, LightenDarkenColorByFactor } from "../lib/utils";
import { goToFormFunction } from "../lib/suggestions";
import { jsonHeaders } from "../lib/headers";
import {
  fitCytoTo,
  dagreLayout,
  darkenFactor,
  unhighlightNodes,
  dagreOnSubjects,
  originalMapJSON,
  presetLayout,
} from "../lib/graph";
import buttonStyles from "../styles/buttons.module.css";
import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";
import { classNames } from "../lib/reactUtils";

export function IconToggleButtonWithCheckbox({
  checked,
  onCheck,
  Icon,
  text,
  colour = "blue",
}) {
  useEffect(() => {
    console.log(`${text} is checked: ${checked}`);
  }, [checked]);
  return (
    <span className="relative z-0 inline-flex items-center shadow-sm rounded-md">
      <button
        onClick={onCheck}
        className={classNames(
          colour === "blue"
            ? "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 "
            : "bg-green-600 hover:bg-green-500 focus:ring-green-500",
          "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white  focus:outline-none focus:ring-2 focus:ring-offset-2"
        )}
      >
        <Icon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        {text}
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}}
          className={classNames(
            checked ? "ring-white ring-2 " : "",
            colour === "blue" ? "text-blue-600 " : "text-green-600 ",
            `cursor-pointer h-4 w-4 ml-2 border-gray-300 rounded select-none`
          )}
        />
      </button>
    </span>
  );
}

// SIMPLE BUTTONS
export function FeedBackButton({ buttonPressFunction }) {
  return (
    <Tippy
      placement={"left"}
      theme={"light"}
      delay={[0, 1000]}
      animation={"scale"}
      maxWidth={"20em"}
      content={
        "Play your part in the future of Learney - we'd love to hear your feedback and suggestions!"
      }
    >
      <button
        className={`${buttonStyles.button} ${buttonStyles.circle} ${buttonStyles.flashing}`}
        id="feedback-button"
        onClick={buttonPressFunction(
          () =>
            window.open(
              "https://docs.google.com/forms/d/e/1FAIpQLSeWyrpKy0r4LbQuuHt5FIL9PYU7KFfLSxFnnuBDs3-zaofW7A/viewform",
              "_blank"
            ),
          "feedback-button"
        )}
      >
        <img
          src="/images/feedback_icon.png"
          id="feedbackIcon"
          alt="Feedback icon"
        />
      </button>
    </Tippy>
  );
}

export function SlackButton({ buttonPressFunction }) {
  return (
    <Tippy
      theme={"light"}
      placement={"left"}
      delay={[0, 1000]}
      animation={"scale"}
      maxWidth={"20em"}
      content={
        "Want to join our thriving community of learners and contributors? Join our Slack!"
      }
    >
      <button
        className={`${buttonStyles.button} ${buttonStyles.circle}`}
        id="slack-button"
        onClick={buttonPressFunction(function () {
          window.open(
            "https://join.slack.com/t/learneyalphatesters/shared_invite/zt-tf37n610-x8rIwDk6eeVctTVZqQkp7Q",
            "_blank"
          );
        }, "slack-button")}
      >
        <img src="/images/slack_logo.png" id="slackLogo" alt="Slack logo" />
      </button>
    </Tippy>
  );
}

export function MakeSuggestionButton({
  allowSuggestions,
  buttonPressFunction,
  userEmail,
  buttonName,
  text,
}) {
  return (
    <button
      onClick={buttonPressFunction(
        goToFormFunction("concept", userEmail),
        buttonName
      )}
      className={`${buttonStyles.button} ${buttonStyles.suggestionButton}`}
      style={!allowSuggestions ? { display: "none" } : {}}
    >
      {text}
    </button>
  );
}

export function SaveMapButton({
  buttonPressFunction,
  editMapEnabled,
  backendUrl,
  mapUUID,
}) {
  return (
    <button
      className={buttonStyles.button}
      style={!editMapEnabled ? { display: "none" } : {}}
      onClick={buttonPressFunction(
        () => saveMap(backendUrl, mapUUID),
        "save-layout"
      )}
      id={"save-layout"}
    >
      Save Map
    </button>
  );
}

async function saveMap(backendUrl, mapUUID) {
  let mapJson = { nodes: [], edges: [] };
  cy.nodes().forEach(function (node) {
    let nodeData = { data: node.data(), position: node.position() };
    if (nodeData.data.colour !== undefined) {
      nodeData.data.colour = LightenDarkenColorByFactor(
        nodeData.data.colour,
        1 / darkenFactor
      );
    }
    mapJson.nodes.push(nodeData);
  });
  cy.edges().forEach(function (edge) {
    mapJson.edges.push({ data: edge.data() });
  });
  const response = await fetch(`${backendUrl}/api/v0/knowledge_maps`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({
      map_uuid: mapUUID,
      map_data: mapJson,
    }),
  });
  handleFetchResponses(response);
  cy.nodes().forEach(function (node) {
    if (node.data().colour !== undefined) {
      node.data().colour = LightenDarkenColorByFactor(
        node.data().colour,
        darkenFactor
      );
    }
  });
}

export function ResetLayoutButton({ buttonPressFunction, userId, editMap }) {
  return (
    <button
      className={buttonStyles.button}
      style={!editMap ? { display: "none" } : {}}
      onClick={buttonPressFunction(() => resetLayout(userId), "reset-layout")}
      id={"reset-layout"}
    >
      Reset Layout
    </button>
  );
}

function resetLayout(userId) {
  cy.remove(cy.elements());
  cy.add(JSON.parse(JSON.stringify(originalMapJSON)));
  cy.layout(presetLayout).run();
  unhighlightNodes(cy.nodes());
  initialiseGraphState(userId);
}

export function RunDagreButton({ buttonPressFunction, editMapEnabled }) {
  return (
    <button
      className={buttonStyles.button}
      style={!editMapEnabled ? { display: "none" } : {}}
      onClick={buttonPressFunction(autoGenerateLayout, "run-dagre")}
      id={"run-dagre"}
    >
      Auto-generate Layout
    </button>
  );
}

function autoGenerateLayout() {
  cy.layout(dagreLayout).run();
  dagreOnSubjects();
}

export function ResetProgressButton({
  editMap,
  buttonPressFunction,
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  setGoalsState,
  setLearnedState,
}) {
  const [buttonAlreadyPressed, setValue] = React.useState(false);

  const buttonPressed = buttonPressFunction(
    function resetProgButtonPress() {
      if (buttonAlreadyPressed) {
        resetProgress(
          backendUrl,
          userId,
          mapUUID,
          sessionId,
          setGoalsState,
          setLearnedState
        );
        unhighlightNodes(cy.nodes());
      } else {
        setTimeout(function () {
          setValue(false);
        }, 3000);
      }
      setValue(!buttonAlreadyPressed);
    },
    "reset-progress",
    backendUrl,
    userId
  );

  return (
    <button
      style={editMap ? { display: "none" } : {}}
      onClick={buttonPressed}
      className={buttonStyles.button}
      id={"reset-progress"}
    >
      {!buttonAlreadyPressed ? "Reset Progress" : "Are you sure?"}
    </button>
  );
}

export function ResetPanButton({ buttonPressFunction }) {
  return (
    <button
      onClick={buttonPressFunction(function () {
        fitCytoTo({ eles: cy.nodes(), padding: 50 });
      }, "reset-pan")}
      id={"reset-pan"}
      className={buttonStyles.button}
    >
      Centre View
    </button>
  );
}

export function AddEdgesButton({ editType, setEditType }) {
  return (
    <div
      style={
        editType === "addEdges" ? { background: "rgb(50, 78, 235)" } : null
      }
    >
      <svg
        onClick={() => setEditType("addEdges")}
        style={{ transform: "scale(50%)" }}
        viewBox="0 0 347.341 347.341"
      >
        <polygon points="347.341,107.783 347.339,0 239.559,0.002 282.843,43.285 0,326.128 21.213,347.341 304.056,64.498 " />
      </svg>
    </div>
  );
}

export function AddNodeButton({ editType, setEditType }) {
  return (
    <div
      style={editType === "addNode" ? { background: "rgb(50, 78, 235)" } : null}
    >
      <svg onClick={() => setEditType("addNode")} viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          fill="none"
          r="15"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function CursorButton({ editType, setEditType }) {
  return (
    <div
      style={editType === "cursor" ? { background: "rgb(50, 78, 235)" } : null}
    >
      <svg
        onClick={() => setEditType("cursor")}
        style={{ transform: "scale(90%)" }}
        viewBox="0 0 28 28"
      >
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
  );
}

export function DeleteElementButton({ editType, setEditType }) {
  return (
    <div
      style={editType === "delete" ? { background: "rgb(50, 78, 235)" } : null}
    >
      <svg
        onClick={() => setEditType("delete")}
        style={{ transform: "scale(40%)" }}
        viewBox="0 0 460.775 460.775"
      >
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
  );
}
