import React, { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { classNames } from "../lib/reactUtils";
import { XCloseButton } from "./utils";
import { NotificationData } from "./types";

export function Notification({
  info,
  setNotificationInfo,
}: {
  info: NotificationData;
  setNotificationInfo: (
    getNotificationInfo: (
      notificationInfo: NotificationData
    ) => NotificationData
  ) => void;
}) {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:py-20 sm:px-6"
      >
        <div
          className={classNames(
            info.side === "left" ? "sm:items-start" : "sm:items-end",
            "flex w-full flex-col items-center space-y-4"
          )}
        >
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={info.show}
            as={Fragment}
            enter="transform ease-in-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={classNames(
                "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
                info.colour === "green" && "bg-green-50",
                info.colour === "red" && "bg-red-50"
              )}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <info.Icon
                      className={classNames(
                        info.colour === "green" && "text-green-400",
                        info.colour === "red" && "text-red-400",
                        "h-8 w-8"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-2 w-0 flex-1 pt-0.5">
                    <p className="text-md text-gray-900">{info.title}</p>
                    {info.message && (
                      <p className="mt-1 text-sm text-gray-500">
                        {info.message}
                      </p>
                    )}
                  </div>
                  <XCloseButton
                    onClick={() =>
                      setNotificationInfo((prevState) => ({
                        ...prevState,
                        show: false,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}
