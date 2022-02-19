import React, { Fragment } from "react";
import { LogoutIcon, UserAddIcon } from "@heroicons/react/outline";
import { Popover, Transition } from "@headlessui/react";
import { UserProfile } from "@auth0/nextjs-auth0";
import { ButtonPressFunction } from "../lib/types";

export function ProfileButton({
  user,
  buttonPressFunction,
}: {
  user: UserProfile | undefined;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <Popover as="div" className="relative flex-none">
      <div id="profileImageButton">
        {user !== undefined ? (
          <Popover.Button className="rounded-full bg-transparent transition duration-200 ease-in-out hover:bg-white hover:ring-2 hover:ring-blue-500 hover:ring-opacity-75 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src={user.picture}
              alt="Profile Picture"
            />
          </Popover.Button>
        ) : (
          <LogInIconButton buttonPressFunction={buttonPressFunction} />
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
        <Popover.Panel
          static
          className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <ProfileSelectedDiv
            user={user}
            buttonPressFunction={buttonPressFunction}
          />
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

function ProfileSelectedDiv({
  user,
  buttonPressFunction,
}: {
  user: UserProfile | undefined;
  buttonPressFunction: ButtonPressFunction;
}) {
  return (
    <div className="sm:max-w-8xl m-2 rounded-md bg-white p-4 text-center">
      <h2 className="my-2 text-xl font-bold text-black">
        Welcome, {user.name}!
      </h2>
      <h5 className="my-2 font-normal text-gray-500">{user.email}</h5>
      <LogOut buttonPressFunction={buttonPressFunction} />
    </div>
  );
}

function LogOut({ buttonPressFunction }) {
  return (
    <button
      className="btn-blue btn-sm"
      onClick={buttonPressFunction(() => {
        let base_url = `${location.protocol}//${location.hostname}`;
        if (location.port) base_url += `:${location.port}`;
        location.href = `${base_url}/api/auth/logout`;
      }, "Log Out")}
    >
      Logout
    </button>
  );
}

export function LogOutIconButton({ buttonPressFunction }) {
  return (
    <button
      className="gray-icon-btn"
      onClick={buttonPressFunction(function () {
        location.href = `${location.protocol}//${location.hostname}/api/auth/logout`;
      }, "Log Out")}
    >
      <span className="sr-only">Log out</span>
      <LogoutIcon className="h-7 w-7" />
    </button>
  );
}

export function LogInIconButton({ buttonPressFunction }) {
  return (
    <button
      className="mobile-icon-button group"
      onClick={buttonPressFunction(() => {
        let base_url = `${location.protocol}//${location.hostname}`;
        if (location.port) base_url += `:${location.port}`;
        location.href = `${base_url}/api/auth/login`;
      }, "Log In")}
    >
      <div className="block px-2 font-bold text-black sm:px-4 lg:hidden">
        Sign in
      </div>
      <div className="lg:white-icon-btn p-1">
        <span className="sr-only">Sign in</span>
        <UserAddIcon className="h-7 w-7 text-blue-500 group-hover:text-blue-600" />
      </div>
    </button>
  );
}
