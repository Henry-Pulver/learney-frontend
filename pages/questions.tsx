import React from "react";
import MapPage from "../components/mapPage";
import { cacheHeaders } from "../lib/headers";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function OriginalMap({
  mapTitle,
  mapDescription,
  mapJson,
  mapUUID,
  backendUrl,
}: {
  mapTitle: string;
  mapDescription: string;
  mapJson: string;
  mapUUID: string;
  backendUrl: string;
}) {
  return (
    <MapPage
      mapTitle={mapTitle}
      mapDescription={mapDescription}
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={"questionsmap"}
      allowSuggestions={false}
      editMap={false}
      mapJsonString={mapJson}
      questionsEnabled={true}
    />
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

    const authUsers = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/auth_question_users`,
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const authUsersJson = await authUsers.json();

    const session = getSession(ctx.req, ctx.res);
    // Currently we redirect if they're not authorised
    if (!authUsersJson.includes(session.user.sub)) {
      return {
        redirect: { destination: `/maps/questionsmap` },
      };
    }
    return {
      props: {
        mapTitle: mapInfoJson.title,
        mapDescription: mapInfoJson.description,
        mapJson: mapInfoJson.map_json,
        mapUUID: mapInfoJson.unique_id,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      },
    };
  },
});
