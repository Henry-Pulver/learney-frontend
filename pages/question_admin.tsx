import React from "react";
import { cacheHeaders, jsonHeaders } from "../lib/headers";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { ElementsDefinition, NodeDefinition } from "cytoscape";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { handleFetchResponses } from "../lib/utils";

type UserInfo = { name: string; id: string; picture: string };

const Nothing = "New";
const Shaky = "Shaky";
const Confident = "Known";

export default function AdminPageForQuestions({
  usersJson,
  mapJsonString,
  backendUrl,
}: {
  usersJson: Array<UserInfo>;
  mapJsonString: string;
  backendUrl: string;
}) {
  const [status, setStatus] = React.useState<
    "pre-click" | "clicked" | "success"
  >("pre-click");
  const [userChosen, setUserChosen] = React.useState<UserInfo>({
    name: "",
    id: "",
    picture: "https://app.learney.me/favicon_new-32x32.png",
  });
  const mapJson: ElementsDefinition = JSON.parse(mapJsonString);

  const defaultConceptLevels = {};
  mapJson.nodes.map((node: NodeDefinition) => {
    if (node.data.nodetype === "concept") {
      defaultConceptLevels[node.data.id] = Nothing;
    }
  });

  const [conceptLevels, setConceptLevels] = React.useState({
    ...defaultConceptLevels,
  });

  const nodesByTopic: { [key: string]: Array<NodeDefinition> } = {};
  mapJson.nodes.forEach((nodeOutside: NodeDefinition) => {
    if (nodeOutside.data.nodetype === "field") {
      nodesByTopic[nodeOutside.data.id] = [];
      mapJson.nodes.forEach((nodeInner: NodeDefinition) => {
        if (
          nodeInner.data.nodetype === "concept" &&
          nodeInner.data.parent === nodeOutside.data.id
        ) {
          nodesByTopic[nodeOutside.data.id].push(nodeInner);
        }
      });
    }
  });

  const components = [];
  Object.entries(nodesByTopic).forEach(
    ([topic, nodes]: [topic: string, nodes: Array<NodeDefinition>]) => {
      components.push(
        <div key={topic}>
          <h2 className="text-center text-xl font-bold">{topic}</h2>
        </div>
      );
      nodes.forEach((concept) => {
        if (concept.data.nodetype === "concept")
          components.push(
            <AdminConceptElement
              key={concept.data.id}
              userChosen={userChosen}
              conceptJson={concept}
              conceptLevels={conceptLevels}
              setConceptLevels={setConceptLevels}
            />
          );
      });
    }
  );

  return (
    <div className="relative h-full w-full overflow-y-auto">
      <div className="flex justify-around px-10 pt-5">
        <UserDropdown
          userChosen={userChosen}
          setuserChosen={setUserChosen}
          usersJson={usersJson}
        />
        <button
          className={classNames(
            (userChosen.id === "" || status !== "pre-click") &&
              "cursor-not-allowed bg-red-600 px-10 hover:bg-red-700",
            status === "success" &&
              "cursor-not-allowed bg-green-600 px-10 hover:bg-green-700",
            "justify-self-end rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          )}
          onClick={
            userChosen.id !== "" && status === "pre-click"
              ? () => {
                  setStatus("clicked");
                  fetch(`${backendUrl}/api/v0/user_onboarding`, {
                    method: "POST",
                    headers: jsonHeaders,
                    body: JSON.stringify({
                      user_id: userChosen.id,
                      concept_levels: conceptLevels,
                    }),
                  })
                    .then((response) =>
                      handleFetchResponses(response, backendUrl)
                    )
                    .then(() => {
                      setStatus("success");
                    });
                }
              : () => {}
          }
        >
          {status === "pre-click"
            ? userChosen.id !== ""
              ? "Save Concept Level"
              : "Choose a user"
            : status === "clicked"
            ? "Saving..."
            : "Saved!"}
        </button>
      </div>
      <div className="w-full px-10 pt-20 ">
        <div className="columns-2 gap-4">{components}</div>
      </div>
    </div>
  );
}

// @ts-ignore
export const getServerSideProps = withPageAuthRequired({
  returnTo: "",
  async getServerSideProps(ctx) {
    const mapResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/knowledge_maps?` +
        new URLSearchParams({ url_extension: "questionsmap" }),
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const mapInfoJson = await mapResponse.json();

    const usersResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/questions_trial_users`,
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const usersJson = await usersResponse.json();

    const session = getSession(ctx.req, ctx.res);
    if (
      ![
        // ...mapInfoJson.usersWithAccess.map((user) => user.toLowerCase()),
        "henrypulver13@gmail.com", // Henry can access every map
        "matthew@learney.me",
      ].includes(session.user.email.toLowerCase())
    ) {
      return {
        redirect: { destination: `/` },
      };
    }
    return {
      props: {
        usersJson: usersJson,
        mapJsonString: mapInfoJson.map_json,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      },
    };
  },
});

function AdminConceptElement(props: {
  conceptJson: NodeDefinition;
  userChosen: UserInfo;
  conceptLevels: object;
  setConceptLevels;
}) {
  return (
    <div className="border">
      <div className="flex flex-row items-center justify-between">
        <h3 className="w-1/2 text-lg font-bold">
          {props.conceptJson.data.name}
        </h3>
        <form>
          <label className="ml-6">
            {Nothing}
            <input
              type="radio"
              onClick={() =>
                props.setConceptLevels((prevConceptLevels) => {
                  return {
                    ...prevConceptLevels,
                    [props.conceptJson.data.id]: Nothing,
                  };
                })
              }
              checked={
                props.conceptLevels[props.conceptJson.data.id] === Nothing
              }
              className="ml-1.5"
            />
          </label>
          <label className="ml-6">
            {Shaky}
            <input
              type="radio"
              onClick={() =>
                props.setConceptLevels((prevConceptLevels) => {
                  return {
                    ...prevConceptLevels,
                    [props.conceptJson.data.id]: Shaky,
                  };
                })
              }
              checked={props.conceptLevels[props.conceptJson.data.id] === Shaky}
              className="ml-1.5"
            />
          </label>
          <label className="ml-6">
            {Confident}
            <input
              type="radio"
              onClick={() =>
                props.setConceptLevels((prevConceptLevels) => {
                  return {
                    ...prevConceptLevels,
                    [props.conceptJson.data.id]: Confident,
                  };
                })
              }
              checked={
                props.conceptLevels[props.conceptJson.data.id] === Confident
              }
              className="ml-1.5"
            />
          </label>
        </form>
      </div>
    </div>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function UserDropdown(props: {
  userChosen;
  setuserChosen;
  usersJson: Array<UserInfo>;
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="focus:outline-none inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <div
            className={classNames(
              props.userChosen ? "bg-gray-100 text-gray-900" : "text-gray-700",
              "block px-4 py-2 text-sm"
            )}
          >
            <img
              src={props.userChosen.picture}
              className="h-10 w-10 rounded-full"
            />
            {props.userChosen.name}
          </div>
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </Menu.Button>
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
        <Menu.Items className="focus:outline-none absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {props.usersJson.map((userInfo) => (
              <Menu.Item key={userInfo.id}>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block flex flex-row px-4 py-2 text-sm"
                    )}
                    onClick={() => props.setuserChosen({ ...userInfo })}
                  >
                    <img
                      src={userInfo.picture}
                      className="mr-2 h-10 w-10 rounded-full"
                    />
                    {userInfo.name}
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
