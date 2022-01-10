import React from "react";
import MapPage from "../../components/mapPage";
import { cacheHeaders } from "../../lib/headers";

export default function Map({
  mapTitle,
  mapDescription,
  mapUrlExtension,
  mapJson,
  mapUUID,
  allowSuggestions,
  backendUrl,
}) {
  return (
    <MapPage
      mapTitle={mapTitle}
      mapDescription={mapDescription}
      backendUrl={backendUrl}
      mapUUID={mapUUID}
      mapUrlExtension={mapUrlExtension}
      allowSuggestions={allowSuggestions}
      editMap={false}
      mapJsonString={mapJson}
    />
  );
}

export async function getServerSideProps({ params }) {
  const mapResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v0/knowledge_maps?` +
      new URLSearchParams({ url_extension: params.mapUrlExtension }),
    {
      method: "GET",
      headers: cacheHeaders,
    }
  );
  const mapInfoJson = await mapResponse.json();
  return {
    props: {
      mapUrlExtension: params.mapUrlExtension,
      mapTitle: mapInfoJson.title,
      mapDescription: mapInfoJson.description,
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.unique_id,
      allowSuggestions: mapInfoJson.allow_suggestions,
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    },
  };
}
