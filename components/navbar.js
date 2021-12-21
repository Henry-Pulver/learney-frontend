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

export function EditNavbar({
  user,
  userId,
  buttonPressFunction,
  backendUrl,
  mapUUID,
  mapJson,
  pageLoaded,
}) {
  return (
    <Navbar
      user={user}
      leftSideButtons={[
        <MapSettingsIconButton
          key="MapSettingsButton"
          buttonPressFunction={buttonPressFunction}
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
        />,
        <FeedBackButton
          key="FeedbackButton"
          buttonPressFunction={buttonPressFunction}
        />,
      ]}
      buttonPressFunction={buttonPressFunction}
      mapJson={mapJson}
      pageLoaded={pageLoaded}
    />
  );
}

export function LearnNavbar({
  user,
  pageLoaded,
  buttonPressFunction,
  mapJson,
}) {
  const [introShown, setIntroShown] = useState(user === undefined);

  // Here so the slide number is remembered between closing & opening the modal
  const [introSlideNumber, setIntroSlide] = useState(0);

  const [introSlidesJson, setIntroSlidesJson] = useState(null);
  // TODO: replace below with useAsync() so it's in line with the rest of the codebase
  useEffect(() => {
    (async function () {
      const response = await fetch("/introSlides.json");
      const slides = await response.json();
      setIntroSlidesJson(slides);
    })();
  }, []);

  // So the 'next slide' button is focused on load
  const initialFocus = useRef(null);

  return (
    <>
      <Navbar
        user={user}
        leftSideButtons={[
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
        ]}
        rightSideButtons={[
          <ShareCurrentPosition
            key="ShareMapViewButton"
            pageLoaded={pageLoaded}
            buttonPressFunction={buttonPressFunction}
          />,
          <FeedBackButton
            key="FeedbackButton"
            buttonPressFunction={buttonPressFunction}
          />,
          <SlackButton
            key="SlackButton"
            buttonPressFunction={buttonPressFunction}
          />,
        ]}
        buttonPressFunction={buttonPressFunction}
        mapJson={mapJson}
        pageLoaded={pageLoaded}
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

export default function Navbar({
  user,
  leftSideButtons,
  rightSideButtons,
  buttonPressFunction,
  mapJson,
  pageLoaded,
}) {
  return (
    <>
      {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? "fixed inset-0 z-40 overflow-y-auto" : "",
            "bg-white shadow-sm lg:static lg:overflow-y-visible"
          )
        }
      >
        {({ open }) => (
          <>
            <div className="max-w-full lg:max-w-full mx-auto px-2 sm:px-4 lg:px-8">
              <div className="relative flex justify-evenly lg:gap-8">
                <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="group shrink-0 flex items-center">
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
                <div className="hidden lg:flex lg:items-center lg:justify-end lg:col-span-4">
                  {leftSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                </div>
                <ConceptSearchBox
                  className="shrink"
                  mapJson={mapJson}
                  onSelect={(item) =>
                    window.cy.getElementById(item.id).emit("tap")
                  }
                  pageLoaded={pageLoaded}
                />
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
                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                  {rightSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                  {/* Profile dropdown */}
                  <ProfileButton
                    user={user}
                    buttonPressFunction={buttonPressFunction}
                  />
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
                  {leftSideButtons.concat(rightSideButtons).map((button) => {
                    return (
                      <>
                        <div
                          className="inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        {button}
                      </>
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
