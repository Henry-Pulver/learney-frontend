import {
  initialiseGraphState,
  resetProgress,
} from "../lib/learningAndPlanning";
import { handleFetchResponses, LightenDarkenColorByFactor } from "../lib/utils";
import { goToFormFunction } from "../lib/suggestions";
import { jsonHeaders } from "../lib/csrf";
import {
  fitCytoTo,
  dagreLayout,
  darkenFactor,
  unhighlightNodes,
  dagreOnSubjects,
  originalMapJSON,
  presetLayout,
} from "../lib/graph";
import React from "react";
import buttonStyles from "../styles/buttons.module.css";
import Tippy from "@tippyjs/react";

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
        className={`${buttonStyles.circle} ${buttonStyles.flashing}`}
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
        className={buttonStyles.circle}
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
}) {
  return (
    <button
      onClick={buttonPressFunction(
        goToFormFunction("concept", userEmail),
        "make-suggestion"
      )}
      className={buttonStyles.suggestionButton}
      id="make-suggestion"
      style={!allowSuggestions ? { display: "none" } : {}}
    >
      Make Suggestion
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
}) {
  const [buttonAlreadyPressed, setValue] = React.useState(false);

  const buttonPressed = buttonPressFunction(
    function resetProgButtonPress() {
      if (buttonAlreadyPressed) {
        resetProgress(backendUrl, userId, mapUUID, sessionId);
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
    >
      Centre View
    </button>
  );
}
