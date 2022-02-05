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
        className="fixed inset-0 z-20 flex items-end px-4 py-6 sm:py-20 sm:px-6 pointer-events-none sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
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
                "relative max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
                info.colour === "green" && "bg-green-50",
                info.colour === "red" && "bg-red-50",
                info.colour === "orange" && "bg-orange-50"
              )}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <info.Icon
                      className={classNames(
                        info.colour === "green" && "text-green-400",
                        info.colour === "red" && "text-red-400",
                        info.colour === "orange" && "bg-orange-400",
                        "h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {info.title}
                    </p>
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
