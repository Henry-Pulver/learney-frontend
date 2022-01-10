import React from "react";
import MapPage from "../components/mapPage";
import { cacheHeaders } from "../lib/headers";

export default function OriginalMap({
  mapTitle,
  mapDescription,
  mapJson,
  mapUUID,
  backendUrl,
}) {
  return (
    <MapPage
      mapTitle={mapTitle}
      mapDescription={mapDescription}
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={"original_map"}
      allowSuggestions={true}
      editMap={false}
      mapJsonString={mapJson}
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
      mapTitle: mapInfoJson.title,
      mapDescription: mapInfoJson.description,
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.unique_id,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
  };
}
