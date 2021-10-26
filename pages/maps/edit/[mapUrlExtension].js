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
      mapJson={mapJson}
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
    const mapInfoJson = await mapResponse.json();
    let props = {
      mapUrlExtension: ctx.params.mapUrlExtension,
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.map_uuid,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL
    };
    return { props: props };
  },
});
