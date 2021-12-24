import React, { Fragment } from "react";
import { LogoutIcon, UserAddIcon } from "@heroicons/react/outline";
import { Popover, Transition } from "@headlessui/react";

export function ProfileButton({ user, buttonPressFunction }) {
  return (
    <Popover as="div" className="flex-none relative">
      <div id="profileImageButton">
        {user !== undefined ? (
          <Popover.Button className="bg-transparent transition duration-200 ease-in-out rounded-full focus:outline-none focus:ring-2 hover:bg-white hover:ring-offset-2 focus:ring-offset-2 focus:ring-blue-500 hover:ring-blue-500 hover:ring-2 hover:ring-opacity-75">
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
          className="origin-top-right absolute z-10 right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none"
        >
          <ProfileSelectedDiv
            userdata={user}
            buttonPressFunction={buttonPressFunction}
          />
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

function ProfileSelectedDiv({ userdata, buttonPressFunction }) {
  return (
    <div className="text-center bg-white p-4 rounded-md m-2 sm:max-w-8xl">
      <h2 className="my-2 text-black font-bold text-xl">
        Welcome, {userdata.name}!
      </h2>
      <h5 className="my-2 text-gray-500 font-normal">{userdata.email}</h5>
      <LogOut buttonPressFunction={buttonPressFunction} />
    </div>
  );
}

function LogOut({ buttonPressFunction }) {
  return (
    <button
      className="btn-blue btn-sm"
      onClick={buttonPressFunction(function () {
        location.href = `${location.protocol}//${location.hostname}/api/auth/logout`;
      }, "Log Out")}
    >
      Logout
    </button>
  );
}

export function LogOutIconButton({ user, buttonPressFunction }) {
  return (
    <button
      className="gray-icon-btn"
      onClick={buttonPressFunction(function () {
        location.href = `${location.protocol}//${location.hostname}/api/auth/logout`;
      }, "Log Out")}
    >
      <span className="sr-only">Log out</span>
      <LogoutIcon className="w-7 h-7" />
    </button>
  );
}

export function LogInIconButton({ buttonPressFunction }) {
  return (
    <button
      className="mobile-icon-button group"
      onClick={buttonPressFunction(() => {
        location.href = `${location.protocol}//${location.hostname}/api/auth/login`;
      }, "Log In")}
    >
      <div className="block lg:hidden px-2 sm:px-4 font-bold text-black">
        Sign in
      </div>
      <div className="lg:white-icon-btn p-1">
        <span className="sr-only">Sign in</span>
        <UserAddIcon className="h-7 w-7 text-blue-500 group-hover:text-blue-600" />
      </div>
    </button>
  );
}
