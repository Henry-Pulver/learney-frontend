import React from "react";
import MapPage from "../../../components/mapPage";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { cacheHeaders } from "../../../lib/headers";

export default function Map({
  mapTitle,
  mapDescription,
  mapUUID,
  mapUrlExtension,
  mapJson,
  backendUrl,
}: {
  mapTitle: string;
  mapDescription: string;
  mapJson: string;
  mapUUID: string;
  mapUrlExtension: string;
  backendUrl: string;
}) {
  return (
    <MapPage
      mapTitle={mapTitle}
      mapDescription={mapDescription}
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={mapUrlExtension}
      allowSuggestions={false}
      editMap={true}
      mapJsonString={mapJson}
      questionsEnabled={false}
    />
  );
}

// TODO: change returnTo URL to "maps/<urlextension>"
// @ts-ignore
export const getServerSideProps = withPageAuthRequired({
  returnTo: "",
  async getServerSideProps(ctx) {
    const mapResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/knowledge_maps?` +
        new URLSearchParams({
          url_extension: ctx.params.mapUrlExtension as string,
        }),
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
        mapInfoJson.author_user_id.toLowerCase(),
        "henrypulver13@gmail.com", // Henry can edit every map
      ].includes(session.user.email.toLowerCase())
    ) {
      return {
        redirect: { destination: `/maps/${ctx.params.mapUrlExtension}` },
      };
    }
    return {
      props: {
        mapUrlExtension: ctx.params.mapUrlExtension,
        mapTitle: mapInfoJson.title,
        mapDescription: mapInfoJson.description,
        mapJson: mapInfoJson.map_json,
        mapUUID: mapInfoJson.unique_id,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      },
    };
  },
});
