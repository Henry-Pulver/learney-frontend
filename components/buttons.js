import {
  initialiseGraphState,
  resetProgress,
} from "../lib/learningAndPlanning";
import { handleFetchResponses } from "../lib/utils";
import { goToFormFunction } from "../lib/suggestions";
import { jsonHeaders } from "../lib/headers";
import {
  fitCytoTo,
  dagreLayout,
  unhighlightNodes,
  dagreOnSubjects,
  originalMapJSON,
  presetLayout,
} from "../lib/graph";
import buttonStyles from "../styles/buttons.module.css";
import Tippy from "@tippyjs/react";
import React, { useEffect } from "react";
import { classNames } from "../lib/reactUtils";
import {
  ChatIcon,
  LightBulbIcon,
  PlusCircleIcon,
  ThumbUpIcon,
} from "@heroicons/react/outline";
import { followCursor } from "tippy.js";

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
          colour === "blue" ? "btn-blue" : "btn-green",
          "inline-flex items-center"
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

export function IconButtonTippy(props) {
  return (
    <Tippy
      theme="light"
      placement={props.placement === undefined ? "bottom" : props.placement}
      delay={[150, 0]}
      animation="scale"
      maxWidth={"12em"}
      content={props.content}
      className="invisible lg:visible"
    >
      {props.children}
    </Tippy>
  );
}

export function FeedBackButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content="We'd love to hear your suggestions! <3">
      <button
        className="mobile-icon-button lg:gray-icon-btn"
        onClick={buttonPressFunction(
          () =>
            window.open(
              "https://docs.google.com/forms/d/e/1FAIpQLSeWyrpKy0r4LbQuuHt5FIL9PYU7KFfLSxFnnuBDs3-zaofW7A/viewform",
              "_blank"
            ),
          "feedback-button"
        )}
      >
        <div className="block lg:hidden px-2 sm:px-4 text-black">
          Give us your feedback!
        </div>
        <span className="sr-only">Give Feedback</span>
        <div className="relative h-7 w-7">
          <ChatIcon className="absolute h-6 w-6 right-0.5 top-0.5" />
          <ThumbUpIcon className="bg-white rounded-full absolute h-4 w-4 left-4 bottom-3.5" />
        </div>
      </button>
    </IconButtonTippy>
  );
}

export function SlackButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content="Say Hi in our Slack!">
      <button
        className="mobile-icon-button lg:gray-icon-btn"
        onClick={buttonPressFunction(function () {
          window.open(
            "https://join.slack.com/t/learneyalphatesters/shared_invite/zt-tf37n610-x8rIwDk6eeVctTVZqQkp7Q",
            "_blank"
          );
        }, "slack-button")}
      >
        <div className="block lg:hidden px-2 sm:px-4 text-black">
          Say Hi in our Slack!
        </div>
        <span className="sr-only">Join Slack</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="h-7 w-7"
          viewBox="0 0 16 16"
        >
          <path d="M3.362 10.11c0 .926-.756 1.681-1.681 1.681S0 11.036 0 10.111C0 9.186.756 8.43 1.68 8.43h1.682v1.68zm.846 0c0-.924.756-1.68 1.681-1.68s1.681.756 1.681 1.68v4.21c0 .924-.756 1.68-1.68 1.68a1.685 1.685 0 0 1-1.682-1.68v-4.21zM5.89 3.362c-.926 0-1.682-.756-1.682-1.681S4.964 0 5.89 0s1.68.756 1.68 1.68v1.682H5.89zm0 .846c.924 0 1.68.756 1.68 1.681S6.814 7.57 5.89 7.57H1.68C.757 7.57 0 6.814 0 5.89c0-.926.756-1.682 1.68-1.682h4.21zm6.749 1.682c0-.926.755-1.682 1.68-1.682.925 0 1.681.756 1.681 1.681s-.756 1.681-1.68 1.681h-1.681V5.89zm-.848 0c0 .924-.755 1.68-1.68 1.68A1.685 1.685 0 0 1 8.43 5.89V1.68C8.43.757 9.186 0 10.11 0c.926 0 1.681.756 1.681 1.68v4.21zm-1.681 6.748c.926 0 1.682.756 1.682 1.681S11.036 16 10.11 16s-1.681-.756-1.681-1.68v-1.682h1.68zm0-.847c-.924 0-1.68-.755-1.68-1.68 0-.925.756-1.681 1.68-1.681h4.21c.924 0 1.68.756 1.68 1.68 0 .926-.756 1.681-1.68 1.681h-4.21z" />
        </svg>
      </button>
    </IconButtonTippy>
  );
}

export function MakeSuggestionIconButton({ buttonPressFunction, userEmail }) {
  return (
    <IconButtonTippy content="Suggest new topics, concepts or content!">
      <button
        onClick={buttonPressFunction(
          goToFormFunction("concept", userEmail),
          "make-suggestion"
        )}
        className="mobile-icon-button lg:gray-icon-btn"
      >
        <div className="block lg:hidden px-2 sm:px-4 text-black">
          Suggest concepts or content
        </div>
        <span className="sr-only">Make suggestion</span>
        <LightBulbIcon className="w-7 h-7" />
      </button>
    </IconButtonTippy>
  );
}

export function MakeSuggestionButton({
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
      className={`${buttonStyles.suggestionButton}`}
    >
      {text}
    </button>
  );
}

export function SaveMapButton({
  userId,
  buttonPressFunction,
  editMapEnabled,
  backendUrl,
  mapUUID,
}) {
  return (
    <button
      className="btn-blue"
      onClick={buttonPressFunction(
        () => saveMap(userId, backendUrl, mapUUID),
        "save-layout"
      )}
      id={"save-layout"}
    >
      Save Map
    </button>
  );
}

export async function saveMap(userId, backendUrl, mapUUID) {
  let mapJson = { nodes: [], edges: [] };
  cy.edges().forEach(function (edge) {
    mapJson.edges.push({ data: edge.data() });
  });
  cy.nodes().forEach(function (node) {
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
  handleFetchResponses(response);
}

export function ResetLayoutButton({ buttonPressFunction, userId }) {
  return (
    <button
      className="btn-blue"
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

export function RunDagreButton({ buttonPressFunction }) {
  return (
    <button
      className="btn-blue"
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
    <button onClick={buttonPressed} className="btn-blue" id={"reset-progress"}>
      {!buttonAlreadyPressed ? "Reset Progress" : "Are you sure?"}
    </button>
  );
}

export function ResetPanButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content={"Centre map"} placement={"top"}>
      <button
        onClick={buttonPressFunction(function () {
          fitCytoTo({ eles: cy.nodes(), padding: 50 });
        }, "reset-pan")}
        className="gray-icon-btn"
      >
        <span className="sr-only">Centre map</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 492.589 492.589"
        >
          <g>
            <path
              d="M468.467,222.168h-28.329c-9.712-89.679-80.46-161.18-169.71-172.258V24.135c0-13.338-10.791-24.134-24.134-24.134
		c-13.311,0-24.117,10.796-24.117,24.134V49.91C132.924,60.988,62.177,132.488,52.482,222.168H24.153
		C10.806,222.168,0,232.964,0,246.286c0,13.336,10.806,24.132,24.153,24.132h29.228c12.192,86.816,81.551,155.4,168.797,166.229
		v31.804c0,13.336,10.806,24.135,24.117,24.135c13.343,0,24.134-10.799,24.134-24.135v-31.804
		c87.228-10.829,156.607-79.413,168.775-166.229h29.264c13.33,0,24.122-10.796,24.122-24.132
		C492.589,232.964,481.797,222.168,468.467,222.168z M246.294,398.093c-85.345,0-154.804-69.453-154.804-154.813
		c0-85.363,69.459-154.813,154.804-154.813c85.376,0,154.823,69.45,154.823,154.813
		C401.117,328.639,331.671,398.093,246.294,398.093z"
            />
            <path
              d="M246.294,176.93c-36.628,0-66.34,29.704-66.34,66.349c0,36.635,29.711,66.349,66.34,66.349
		c36.66,0,66.34-29.713,66.34-66.349C312.634,206.635,282.955,176.93,246.294,176.93z"
            />
          </g>
        </svg>
      </button>
    </IconButtonTippy>
  );
}

export function AddEdgesButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Add dependency"
      followCursor={true}
      plugins={[followCursor]}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "addEdges" ? "bg-blue-600" : "",
          "hover:bg-blue-500"
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

export function AddNodeButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Add concept"
      followCursor={true}
      plugins={[followCursor]}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "addNode" ? "bg-blue-600" : "",
          "grid content-center justify-center hover:bg-blue-500"
        )}
        onClick={() => setEditType("addNode")}
      >
        <PlusCircleIcon className="text-black w-10 h-10" />
      </div>
    </Tippy>
  );
}

export function CursorButton({ editType, setEditType }) {
  return (
    <div
      className={classNames(
        editType === "cursor" ? "bg-blue-600" : "",
        "hover:bg-blue-500"
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
  );
}

export function DeleteElementButton({ editType, setEditType }) {
  return (
    <Tippy
      content="Delete"
      followCursor={true}
      plugins={[followCursor]}
      delay={[500, 0]}
      theme="light"
    >
      <div
        className={classNames(
          editType === "delete" ? "bg-red-600" : "",
          "hover:bg-red-500"
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
