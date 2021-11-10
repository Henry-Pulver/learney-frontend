import React from "react";
import MapPage from "../components/mapPage";
import { cacheHeaders } from "../lib/headers";

export default function OriginalMap({ mapJson, mapUUID, backendUrl }) {
  return (
    <MapPage
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={"maps/original_map"}
      allowSuggestions={true}
      editMap={false}
      mapJson={mapJson}
    />
  );
}

export async function getServerSideProps() {
  const mapResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/knowledge_maps?` +
      new URLSearchParams({ url_extension: "original_map" }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  const mapInfoJson = await mapResponse.json();
  return {
    props: {
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.unique_id,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
  };
}
