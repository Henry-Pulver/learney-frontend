import React, { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import { resetProgress } from "../lib/learningAndPlanning/learningAndPlanning";
import { goToFormFunction } from "../lib/suggestions";
import { fitCytoTo, unhighlightNodes } from "../lib/graph";
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
import isEqual from "lodash.isequal";
import { ButtonPressFunction } from "../lib/types";
import { SingularElementArgument } from "cytoscape";
import { TargetFinderIcon } from "./svgs/icons";
import { SetGoalState, SetLearnedState } from "./types";

export function IconToggleButtonWithCheckbox({
  checked,
  onCheck,
  Icon,
  text,
  colour = "blue",
}: {
  checked: boolean;
  onCheck: () => void;
  Icon;
  text: string;
  colour: "blue" | "green" | "red";
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
          "btn-sm inline-flex items-center px-2"
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
      disabled={props.disabled === true}
      className="invisible lg:visible text-center"
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

function getCurrentQueryParams(pageLoaded: boolean): {
  x: number | null;
  y: number | null;
  zoom: number | null;
} {
  if (pageLoaded) {
    return {
      x: window.cy.pan().x,
      y: window.cy.pan().y,
      zoom: window.cy.zoom(),
    };
  } else {
    return { x: null, y: null, zoom: null };
  }
}

export function ShareCurrentPosition({ pageLoaded, buttonPressFunction }) {
  const [currentQueryParams, setCurrentQueryParams] = useState({
    x: null,
    y: null,
    zoom: null,
  });
  const [copiedQueryParams, setCopiedQueryParams] = useState(null);
  useEffect(() => {
    if (pageLoaded) {
      window.cy.on("zoom pan", (e) => {
        setCurrentQueryParams(getCurrentQueryParams(pageLoaded));
      });
    }
  }, [pageLoaded]);

  return (
    <IconButtonTippy
      content={"Copy link to this map view"}
      disabled={isEqual(copiedQueryParams, currentQueryParams)}
    >
      <Tippy
        theme={"dark"}
        placement="bottom"
        animation="scale"
        maxWidth={"12em"}
        visible={isEqual(copiedQueryParams, currentQueryParams)}
        content={"Link copied!"}
        className={"invisible lg:visible text-center"}
      >
        <button
          onClick={
            isEqual(copiedQueryParams, currentQueryParams)
              ? buttonPressFunction(() => {}, "Get Shareable Link (void)")
              : buttonPressFunction(() => {
                  navigator.clipboard.writeText(
                    `${location.origin}/?` +
                      // @ts-ignore
                      new URLSearchParams(getCurrentQueryParams(pageLoaded))
                  );
                  setCopiedQueryParams(getCurrentQueryParams(pageLoaded));
                }, "Get Shareable Link")
          }
          className={classNames(
            "mobile-icon-button lg:gray-icon-btn",
            isEqual(copiedQueryParams, currentQueryParams) &&
              "cursor-default lg:hover:text-gray-400 lg:hover:shadow-sm"
          )}
        >
          <div className="block lg:hidden px-2 sm:px-4 text-black">
            {isEqual(copiedQueryParams, currentQueryParams)
              ? "Link copied!"
              : "Copy link to this map view"}
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
          <TrashIcon className="w-7 h-7" />
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
  nextConcept,
  buttonPressFunction,
}: {
  nextConcept?: SingularElementArgument;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <IconButtonTippy
      content={
        nextConcept ? (
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
          nextConcept
            ? buttonPressFunction(() => {
                nextConcept.emit("tap");
              }, "Go to next concept")
            : () => {}
        }
        className={classNames(
          !nextConcept && "cursor-default",
          "gray-icon-btn"
        )}
      >
        <span className="sr-only">Centre map</span>
        <TargetFinderIcon classes="h-7 w-7" />
      </button>
    </IconButtonTippy>
  );
}
