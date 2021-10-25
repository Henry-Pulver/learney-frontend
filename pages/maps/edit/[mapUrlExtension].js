import React from "react";
import MapPage from "../../../components/mapPage";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { cacheHeaders } from "../../../lib/csrf";

export default function Map({ mapUUID, mapUrlExtension, mapJson }) {
  return (
    <MapPage
      backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
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
        new URLSearchParams({ url_extension: params.mapUrlExtension }),
      {
        method: "GET",
        headers: cacheHeaders,
      }
    );
    const mapInfoJson = await mapResponse.json();
    let props = {
      mapUrlExtension: params.mapUrlExtension,
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.map_uuid,
    };
    return { props: props };
  },
});
