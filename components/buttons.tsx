import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { resetProgress } from "../lib/learningAndPlanning/learningAndPlanning";
import { goToFormFunction } from "../lib/suggestions";
import { fitCytoTo, selectConceptFromId, unhighlightNodes } from "../lib/graph";
import {
  ChatIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ThumbUpIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { ShareIcon } from "@heroicons/react/outline";
import { AreYouSureModal } from "./modal";
import { classNames } from "../lib/reactUtils";
import { ButtonPressFunction } from "../lib/types";
import { NodeSingular, SingularElementArgument } from "cytoscape";
import { TargetFinderIcon } from "./svgs/icons";
import { SetGoalState, SetLearnedState } from "./types";
import { LoadingSpinner } from "./animations";

export function IconToggleButtonWithCheckbox({
  checked,
  onCheck,
  Icon,
  text,
  loading = false,
  disabled = false,
  colour = "blue",
}: {
  checked: boolean;
  onCheck: () => void;
  Icon;
  text: string;
  loading?: boolean;
  disabled?: boolean;
  colour: "blue" | "green" | "red";
}) {
  return (
    <span className="group relative z-0 inline-flex items-center rounded-md shadow-sm">
      <button
        onClick={loading || disabled ? () => {} : onCheck}
        className={classNames(
          disabled || loading ? "cursor-default" : "cursor-pointer",
          disabled && "btn-deactivated",
          !disabled && colour === "blue" && "btn-blue",
          !disabled && colour === "green" && "btn-green",
          !disabled && colour === "red" && "btn-red",
          "btn-sm inline-flex items-center px-2"
        )}
      >
        <Icon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        {text}
        {loading ? (
          <LoadingSpinner classes="ml-2 h-4 w-4 text-white" />
        ) : (
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={() => {}}
            className={classNames(
              checked && "ring-2 ring-white",
              disabled ? "cursor-default text-gray-300" : "cursor-pointer",
              !disabled &&
                colour === "blue" &&
                "text-blue-600 group-hover:text-blue-500",
              !disabled &&
                colour === "green" &&
                "text-green-600 group-hover:text-green-500",
              !disabled &&
                colour === "red" &&
                "text-red-600 group-hover:text-red-500",
              "ml-2 h-4 w-4 select-none rounded border-gray-300"
            )}
          />
        )}
      </button>
    </span>
  );
}

export function IconButtonTippy(props) {
  return (
    <Tippy
      theme={props.theme === undefined ? "light" : props.theme}
      placement={props.placement === undefined ? "bottom" : props.placement}
      delay={[150, 0]}
      animation="scale"
      maxWidth={"12em"}
      content={props.content}
      disabled={props.disabled === true}
      className="invisible text-center lg:visible"
    >
      {props.children}
    </Tippy>
  );
}

export function FeedBackButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content="We'd love to hear your feedback! <3">
      <button
        className="mobile-icon-button lg:gray-icon-btn"
        onClick={buttonPressFunction(
          () =>
            window.open(
              "https://docs.google.com/forms/d/e/1FAIpQLSeWyrpKy0r4LbQuuHt5FIL9PYU7KFfLSxFnnuBDs3-zaofW7A/viewform",
              "_blank"
            ),
          "Give Feedback"
        )}
      >
        <div className="block px-2 text-black sm:px-4 lg:hidden">
          Give us your feedback!
        </div>
        <span className="sr-only">Give Feedback</span>
        <div className="relative h-7 w-7">
          <ChatIcon className="absolute right-0.5 top-0.5 h-6 w-6" />
          <ThumbUpIcon className="absolute left-4 bottom-3.5 h-4 w-4 rounded-full bg-white" />
        </div>
      </button>
    </IconButtonTippy>
  );
}

export function SlackButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content="Say Hi in our Slack community!">
      <button
        className="mobile-icon-button lg:gray-icon-btn"
        onClick={buttonPressFunction(function () {
          window.open(
            "https://join.slack.com/t/learneyalphatesters/shared_invite/zt-tf37n610-x8rIwDk6eeVctTVZqQkp7Q",
            "_blank"
          );
        }, "Join Slack")}
      >
        <div className="block px-2 text-black sm:px-4 lg:hidden">
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

type QueryParams =
  | {
      x: number;
      y: number;
      zoom: number;
    }
  | {
      x: null;
      y: null;
      zoom: null;
    };
const emptyQueryParams = { x: null, y: null, zoom: null };

function getCurrentQueryParams(pageLoaded: boolean): QueryParams {
  if (pageLoaded) {
    return {
      x: window.cy.pan().x,
      y: window.cy.pan().y,
      zoom: window.cy.zoom(),
    };
  } else {
    return emptyQueryParams;
  }
}

export function ShareCurrentPosition({
  pageLoaded,
  buttonPressFunction,
}: {
  pageLoaded: boolean;
  buttonPressFunction: ButtonPressFunction;
}) {
  const [copiedQueryParams, setCopiedQueryParams] =
    useState<null | QueryParams>(null);
  useEffect(() => {
    if (pageLoaded) {
      window.cy.on("zoom pan", () => {
        if (copiedQueryParams) setCopiedQueryParams(null);
      });
    }
  }, [pageLoaded]);

  return (
    <IconButtonTippy
      content={"Copy link to this map view"}
      disabled={!!copiedQueryParams}
    >
      <Tippy
        theme={"dark"}
        placement="bottom"
        animation="scale"
        maxWidth={"12em"}
        visible={!!copiedQueryParams}
        content={"Link copied!"}
        className={"invisible text-center lg:visible"}
      >
        <button
          onClick={
            copiedQueryParams
              ? buttonPressFunction(() => {}, "Get Shareable Link (void)")
              : buttonPressFunction(() => {
                  navigator.clipboard.writeText(
                    `${location.href}/?` +
                      // @ts-ignore
                      // ts-ignore necessary because .toString() doesn't work as input to URLSearchParams!
                      new URLSearchParams(getCurrentQueryParams(pageLoaded))
                  );
                  setCopiedQueryParams(getCurrentQueryParams(pageLoaded));
                }, "Get Shareable Link")
          }
          className={classNames(
            "mobile-icon-button lg:gray-icon-btn",
            copiedQueryParams &&
              "cursor-default lg:hover:text-gray-400 lg:hover:shadow-sm"
          )}
        >
          <div className="block px-2 text-black sm:px-4 lg:hidden">
            {copiedQueryParams ? "Link copied!" : "Copy link to this map view"}
          </div>
          <span className="sr-only">Copy link to map view</span>
          <ShareIcon className="h-7 w-7" />
        </button>
      </Tippy>
    </IconButtonTippy>
  );
}

export function MakeSuggestionIconButton({ buttonPressFunction, userEmail }) {
  return (
    <IconButtonTippy content="Suggest new topics, concepts or content!">
      <button
        onClick={buttonPressFunction(
          goToFormFunction("concept", userEmail),
          "Make Suggestion"
        )}
        className="mobile-icon-button lg:gray-icon-btn"
      >
        <div className="block px-2 text-black sm:px-4 lg:hidden">
          Suggest concepts or content
        </div>
        <span className="sr-only">Make suggestion</span>
        <LightBulbIcon className="h-7 w-7" />
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
      className={"btn-sm btn-2 my-2 mx-4"}
    >
      {text}
    </button>
  );
}

export function ResetProgressIconButton({
  buttonPressFunction,
  backendUrl,
  userId,
  mapUUID,
  sessionId,
  setGoalsState,
  setLearnedState,
}: {
  buttonPressFunction: ButtonPressFunction;
  backendUrl: string;
  userId: string;
  mapUUID: string;
  sessionId: string;
  setGoalsState: SetGoalState;
  setLearnedState: SetLearnedState;
}) {
  const [areYouSureModalShown, setModalShown] = useState(false);

  const buttonPressed = buttonPressFunction(() => {
    resetProgress(
      backendUrl,
      userId,
      mapUUID,
      sessionId,
      setGoalsState,
      setLearnedState
    );
    unhighlightNodes(window.cy.nodes('[nodetype = "concept"]'));
  }, "Reset Progress");

  return (
    <>
      <IconButtonTippy content={"Reset your progress"} placement={"top"}>
        <button onClick={() => setModalShown(true)} className="gray-icon-btn">
          <span className="sr-only">Reset your progress</span>
          <TrashIcon className="h-7 w-7" />
        </button>
      </IconButtonTippy>
      <AreYouSureModal
        modalShown={areYouSureModalShown}
        setModalClosed={() => setModalShown(false)}
        titleText="Reset all Progress & Goals"
        descriptionText="This will remove all goals and concepts learned from the map!"
        actionButtonText="Reset Progress"
        actionButtonFunction={buttonPressed}
      />
    </>
  );
}

export function ResetPanButton({ buttonPressFunction }) {
  return (
    <IconButtonTippy content={"Centre map"} placement={"top"}>
      <button
        onClick={buttonPressFunction(function () {
          fitCytoTo({ eles: window.cy.nodes(), padding: 50 });
        }, "Centre Map")}
        className="gray-icon-btn"
      >
        <span className="sr-only">Centre map</span>
        <GlobeAltIcon className="h-7 w-7" />
      </button>
    </IconButtonTippy>
  );
}

export function GetNextConceptButton({
  currentConceptId,
  buttonPressFunction,
}: {
  currentConceptId?: string;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <IconButtonTippy
      content={
        currentConceptId ? (
          "Your next concept"
        ) : (
          <>
            Your next concept <b>(first set a goal)</b>
          </>
        )
      }
      placement={"top"}
    >
      <button
        onClick={
          currentConceptId
            ? buttonPressFunction(() => {
                if (currentConceptId) selectConceptFromId(currentConceptId);
              }, "Go to next concept")
            : () => {}
        }
        className={classNames(
          !currentConceptId && "cursor-default",
          "gray-icon-btn"
        )}
      >
        <span className="sr-only">Centre map</span>
        <TargetFinderIcon classes="h-7 w-7" />
      </button>
    </IconButtonTippy>
  );
}
