import React, { Fragment } from "react";
import { Menu, Popover, Transition } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/solid";
import {
  BellIcon,
  MenuIcon,
  XIcon,
  UserAddIcon,
} from "@heroicons/react/outline";
import { classNames } from "../lib/reactUtils";
import {
  LogInIconButton,
  LogOutIconButton,
  ProfileSelectedDiv,
} from "./profile";

export default function Navbar({
  user,
  leftSideButtons,
  rightSideButtons,
  buttonPressFunction,
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
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="relative flex justify-between lg:gap-8">
                <div className="flex md:absolute md:left-0 md:inset-y-0 lg:static xl:col-span-2">
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      className="block h-10 w-auto"
                      src="https://app.learney.me/images/learney_logo_256x256.png"
                      alt="Learney"
                    />
                  </div>
                </div>
                <div className="hidden lg:flex lg:items-center lg:justify-end lg:col-span-4">
                  {leftSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                </div>
                <div className="min-w-0 flex-1 lg:px-0 xl:col-span-6">
                  {/*SEARCH*/}
                  <div className="flex items-center px-2 md:px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
                    <div className="w-full">
                      <label htmlFor="search" className="sr-only">
                        Search
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                          <SearchIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <label id="concept-search-bar-label">
                          <select
                            id={"concept-search-bar"}
                            className="flex-shrink-1 cursor-text block pt-0 w-full h-full bg-white border border-gray-300 rounded-md pb-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            name="concept"
                            tabIndex="0"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
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
                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                  {rightSideButtons.map((button, idx) => (
                    <div key={idx}>{button}</div>
                  ))}
                  {/* Profile dropdown */}
                  <Menu as="div" className="flex-shrink-0 relative ml-5">
                    <div id="profileImageButton">
                      {user !== undefined ? (
                        <Menu.Button className="bg-white p-0.5 rounded-full flex-shrink-0 focus:outline-none focus:ring-2 hover:ring-offset-0 focus:ring-offset-0 focus:ring-blue-500 hover:ring-blue-500 hover:ring-2 hover:ring-opacity-75">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.picture}
                            alt="Profile Picture"
                          />
                        </Menu.Button>
                      ) : (
                        <LogInIconButton
                          buttonPressFunction={buttonPressFunction}
                        />
                      )}
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <div className="origin-top-right absolute z-10 right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                        <ProfileSelectedDiv
                          userdata={user}
                          buttonPressFunction={buttonPressFunction}
                        />
                      </div>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
              <div className="border-t border-gray-200 pt-4 pb-3">
                {user !== undefined ? (
                  <div className="flex flex-row justify-between items-center max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-row">
                      <div className="flex-shrink-0">
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