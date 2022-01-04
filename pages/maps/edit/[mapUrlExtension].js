import React from "react";
import MapPage from "../../../components/mapPage";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { cacheHeaders } from "../../../lib/headers";

export default function Map({ mapUUID, mapUrlExtension, mapJson, backendUrl }) {
  return (
    <MapPage
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={mapUrlExtension}
      allowSuggestions={false}
      editMap={true}
      mapJsonString={mapJson}
    />
  );
}

// TODO: change returnTo URL to "maps/<urlextension>"
export const getServerSideProps = withPageAuthRequired({
  returnTo: "",
  async getServerSideProps(ctx) {
    const mapResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/knowledge_maps?` +
        new URLSearchParams({ url_extension: ctx.params.mapUrlExtension }),
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const session = getSession(ctx.req, ctx.res);
    const mapInfoJson = await mapResponse.json();
    // TODO: Currently we redirect, change to showing custom 'blocked' page & link to map
    if (
      // Henry can edit every map
      ![
        mapInfoJson.author_user_id.toLowerCase(),
        "henrypulver13@gmail.com",
      ].includes(session.user.email.toLowerCase())
    ) {
      return {
        redirect: { destination: `/maps/${ctx.params.mapUrlExtension}` },
      };
    }
    return {
      props: {
        mapUrlExtension: ctx.params.mapUrlExtension,
        mapJson: mapInfoJson.map_json,
        mapUUID: mapInfoJson.unique_id,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
      },
    };
  },
});
