import React from "react";
import { LogoutIcon, UserAddIcon } from "@heroicons/react/outline";

export function ProfileSelectedDiv({ userdata, buttonPressFunction }) {
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
      className="btn-blue"
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
