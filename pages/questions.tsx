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
      allowSuggestions={true}
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
    const session = getSession(ctx.req, ctx.res);
    const mapInfoJson = await mapResponse.json();
    // TODO: Currently we redirect, change to showing custom 'blocked' page & link to map
    if (
      ![
        // ...mapInfoJson.usersWithAccess.map((user) => user.toLowerCase()),
        "henrypulver13@gmail.com", // Henry can access every map
      ].includes(session.user.email.toLowerCase())
    ) {
      return {
        redirect: { destination: `/` },
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
