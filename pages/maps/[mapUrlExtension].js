import React from "react";
import MapPage from "../../components/mapPage";
import { cacheHeaders } from "../../lib/csrf";

export default function Map({
  mapUrlExtension,
  mapJson,
  mapUUID,
  allowSuggestions,
}) {
  return (
    <MapPage
      backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL}
      mapUUID={mapUUID}
      mapUrlExtension={mapUrlExtension}
      allowSuggestions={allowSuggestions}
      editMap={false}
      mapJson={mapJson}
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
      mapJson: mapInfoJson.map_json,
      mapUUID: mapInfoJson.map_uuid,
      allowSuggestions: mapInfoJson.allow_suggestions,
    },
  };
}
