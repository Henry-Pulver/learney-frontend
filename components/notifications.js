import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { classNames } from "../lib/reactUtils";

export default function NotificationManager({
  notificationInfo,
  setNotificationInfo,
}) {
  return (
    <>
      {notificationInfo.type !== undefined ? (
        notificationInfo.type === "failed" ? (
          <Notification
            title={`Mission Failed - we'll get 'em next time.`}
            message={`Look at the resources on ${notificationInfo.nodeName} & test again when ready!`}
            colour="red"
            Icon={XCircleIcon}
            show={!!notificationInfo}
            setShow={setNotificationInfo}
          />
        ) : (
          <Notification
            title={
              notificationInfo.type === "progress"
                ? `Congratulations - learned ${notificationInfo.nodeName}!`
                : notificationInfo.type === "goalAchieved"
                ? `Congratulations - reached goal: ${notificationInfo.nodeName}!`
                : notificationInfo.type === "noGoal"
                ? `Congratulations - time to set a goal!`
                : ""
            }
            message={
              notificationInfo.type === "progress"
                ? getRandomProgressMessage(notificationInfo.nextNode)
                : notificationInfo.type === "goalAchieved"
                ? getRandomGoalMessage(notificationInfo.nextNode)
                : notificationInfo.type === "noGoal"
                ? `You've learned ${notificationInfo.nodeName}, what's next? Set a goal on the map!`
                : ""
            }
            colour="green"
            Icon={CheckCircleIcon}
            show={!!notificationInfo}
            setShow={setNotificationInfo}
          />
        )
      ) : (
        ""
      )}
    </>
  );
}

export function Notification({ show, setShow, title, message, Icon, colour }) {
  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-in-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon
                      className={classNames(
                        colour === "green" ? "text-green-400" : "text-red-400",
                        "h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{message}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() =>
                        setShow((prevState) => ({
                          ...prevState,
                          type: undefined,
                          nodeName: undefined,
                          nextNode: undefined,
                        }))
                      }
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
}

function getRandomProgressMessage(nextNodeName) {
  const progressMessages = [
    "'A journey of a thousand miles begins with a single step' - Chinese proverb.",
    "Small steps will take you to your goals! Keep going!",
  ];
  let message =
    progressMessages[Math.floor(Math.random() * progressMessages.length)];
  if (nextNodeName) {
    message += ` Next up: ${nextNodeName}!`;
  }
  return message;
}

function getRandomGoalMessage(nextNodeName) {
  const goalMessages = [
    "You've made impressive progress!",
    "Time to crack open the champagne!",
  ];
  let message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
  if (!nextNodeName) {
    message += " What's next? It's the ideal time to set your new goal!";
  } else {
    message += ` Let's hit another goal! Next is ${nextNodeName}`;
  }
  return message;
}
