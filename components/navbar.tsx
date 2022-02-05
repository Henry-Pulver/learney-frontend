import React, { useRef, useState, useEffect } from "react";
import { Popover } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { classNames } from "../lib/reactUtils";
import { LogInIconButton, LogOutIconButton, ProfileButton } from "./profile";
import IntroButton, { IntroSection } from "./intro";
import {
  FeedBackButton,
  MakeSuggestionIconButton,
  ShareCurrentPosition,
  SlackButton,
} from "./buttons";
import { SaveMapButton, MapSettingsIconButton } from "./editor/buttons";
import Modal from "./modal";
import { ConceptSearchBox } from "./ConceptSearchBox";
import { ButtonPressFunction, UserState } from "../lib/types";
import { ElementsDefinition } from "cytoscape";
import { NotificationData } from "./types";

export function EditNavbar({
  user,
  userId,
  buttonPressFunction,
  backendUrl,
  mapUUID,
  mapJson,
  pageLoaded,
  updateNotificationInfo,
  showTitle,
  setShowTitle,
}: {
  user: UserState;
  userId: string;
  buttonPressFunction: ButtonPressFunction;
  backendUrl: string;
  mapUUID: string;
  mapJson: ElementsDefinition;
  pageLoaded: boolean;
  updateNotificationInfo: (notificationInfo: NotificationData) => void;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
}) {
  return (
    <Navbar
      user={user}
      leftSideButtons={[
        <MapSettingsIconButton
          key="MapSettingsButton"
          buttonPressFunction={buttonPressFunction}
          pageLoaded={pageLoaded}
        />,
        <MakeSuggestionIconButton
          key="MakeSuggestionButton"
          buttonPressFunction={buttonPressFunction}
          userEmail={user !== undefined ? user.email : ""}
        />,
      ]}
      rightSideButtons={[
        <SaveMapButton
          key="SaveMap"
          userId={userId}
          buttonPressFunction={buttonPressFunction}
          backendUrl={backendUrl}
          mapUUID={mapUUID}
          updateNotificationInfo={updateNotificationInfo}
          pageLoaded={pageLoaded}
        />,
        <FeedBackButton
          key="FeedbackButton"
          buttonPressFunction={buttonPressFunction}
        />,
      ]}
      buttonPressFunction={buttonPressFunction}
      mapJson={mapJson}
      pageLoaded={pageLoaded}
      showTitle={showTitle}
      setShowTitle={setShowTitle}
    />
  );
}

export function LearnNavbar({
  user,
  pageLoaded,
  buttonPressFunction,
  mapJson,
  isNewUser,
  showExploreLearn,
  showTitle,
  setShowTitle,
  questionsEnabled,
}: {
  user: UserState;
  pageLoaded: boolean;
  buttonPressFunction: ButtonPressFunction;
  mapJson: ElementsDefinition;
  isNewUser: boolean;
  showExploreLearn: boolean;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
  questionsEnabled: boolean;
}) {
  const [introShown, setIntroShown] = useState<boolean>(false);
  useEffect(() => {
    if (!showExploreLearn) setIntroShown(isNewUser);
  }, [showExploreLearn, isNewUser]);

  // Here so the slide number is remembered between closing & opening the modal
  const [introSlideNumber, setIntroSlide] = useState<number>(0);

  const [introSlidesJson, setIntroSlidesJson] = useState<Array<object> | null>(
    null
  );
  // TODO: replace below with useAsync() so it's in line with the rest of the codebase
  useEffect(() => {
    (async function () {
      const response = await fetch("/introSlides.json");
      const slides: Array<object> = await response.json();
      setIntroSlidesJson(slides);
    })();
  }, []);

  // So the 'next slide' button is focused on load
  const initialFocus = useRef(null);

  return (
    <>
      <Navbar
        user={user}
        leftSideButtons={
          !questionsEnabled
            ? [
                <IntroButton
                  key="IntroButton"
                  setIntroShown={setIntroShown}
                  buttonPressFunction={buttonPressFunction}
                />,
                <MakeSuggestionIconButton
                  key="MakeSuggestionButton"
                  buttonPressFunction={buttonPressFunction}
                  userEmail={user !== undefined ? user.email : ""}
                />,
              ]
            : []
        }
        rightSideButtons={(!questionsEnabled
          ? [
              <ShareCurrentPosition
                key="ShareMapViewButton"
                pageLoaded={pageLoaded}
                buttonPressFunction={buttonPressFunction}
              />,
            ]
          : []
        ).concat([
          <FeedBackButton
            key="FeedbackButton"
            buttonPressFunction={buttonPressFunction}
          />,
          <SlackButton
            key="SlackButton"
            buttonPressFunction={buttonPressFunction}
          />,
        ])}
        buttonPressFunction={buttonPressFunction}
        mapJson={mapJson}
        pageLoaded={pageLoaded}
        showTitle={showTitle}
        setShowTitle={setShowTitle}
      />
      <Modal
        open={introShown}
        setClosed={() => setIntroShown(false)}
        initialFocus={initialFocus}
      >
        <IntroSection
          introSlideNumber={introSlideNumber}
          setIntroSlide={setIntroSlide}
          introSlides={introSlidesJson}
          buttonPressFunction={buttonPressFunction}
          initialFocus={initialFocus}
        />
      </Modal>
    </>
  );
}

function Navbar({
  user,
  leftSideButtons,
  rightSideButtons,
  buttonPressFunction,
  mapJson,
  pageLoaded,
  showTitle,
  setShowTitle,
}: {
  user: UserState;
  leftSideButtons: Array<JSX.Element>;
  rightSideButtons: Array<JSX.Element>;
  buttonPressFunction: ButtonPressFunction;
  mapJson: ElementsDefinition;
  pageLoaded: boolean;
  showTitle: boolean;
  setShowTitle: (show: boolean) => void;
}) {
  return (
    <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open && "fixed inset-0 z-40 overflow-y-auto",
            "bg-white shadow-sm lg:static lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => (
          <>
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-4">
              <div className="relative flex justify-evenly lg:gap-x-3">
                <div className="flex flex-none md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="group flex items-center">
                    <img
                      className="h-10 w-auto block group-hover:hidden"
                      src="/images/learney_logo_256x256.png"
                      alt="Learney"
                    />
                    <img
                      className="h-10 w-auto hidden group-hover:block"
                      src="/learney_logo_emoji_size.gif"
                      alt="Learney"
                    />
                  </div>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-evenly lg:gap-4">
                  {leftSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                </div>
                <ConceptSearchBox
                  classes="shrink w-2/3 z-10 px-3 py-2"
                  mapJson={mapJson}
                  onSelect={
                    pageLoaded
                      ? (item) => window.cy.getElementById(item.id).emit("tap")
                      : () => {}
                    // TODO: When not loaded, add selected item to a queue to be
                    //  executed when cytoscape has loaded
                  }
                  showTitle={showTitle}
                  setShowTitle={setShowTitle}
                />
                <div className="hidden lg:flex lg:items-center lg:justify-evenly lg:gap-4">
                  {rightSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                  {/* Profile dropdown */}
                  <ProfileButton
                    user={user}
                    buttonPressFunction={buttonPressFunction}
                  />
                </div>
                <div className="flex items-center md:absolute md:right-0 md:inset-y-0 lg:hidden">
                  {/* Mobile menu button */}
                  <Popover.Button className="-mx-1 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="sr-only">Open menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
              <div className="border-t border-gray-200 pt-4 pb-3">
                {user !== undefined ? (
                  <div className="flex flex-row justify-between items-center max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-row">
                      <div className="shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.picture}
                          alt=""
                        />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <LogOutIconButton
                      buttonPressFunction={buttonPressFunction}
                    />
                  </div>
                ) : (
                  <LogInIconButton buttonPressFunction={buttonPressFunction} />
                )}
                <div className="mt-3 max-w-3xl mx-auto px-2 space-y-1 sm:px-4">
                  {leftSideButtons
                    .concat(rightSideButtons)
                    .map((button, idx) => {
                      return (
                        <div key={idx}>
                          <div
                            className="inset-0 flex items-center"
                            aria-hidden="true"
                          >
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          {button}
                        </div>
                      );
                    })}
                </div>
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </>
  );
}
