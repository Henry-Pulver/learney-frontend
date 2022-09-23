import React from "react";
import Head from "next/head";

export default function MapHeader({
  editMap,
  mapUrlExtension,
  mapTitle,
  mapDescription,
}: {
  editMap: boolean;
  mapUrlExtension: string;
  mapTitle: string;
  mapDescription: string;
}) {
  const isStatQuest = mapUrlExtension.endsWith("StatQuest");
  return (
    <Head>
      <meta charSet="UTF-8" />
      <title>
        {editMap
          ? "Learney Editor"
          : isStatQuest
          ? "Learney - StatQuest"
          : "Learney"}
      </title>
      <link rel="icon" href="/delta_logo.png" />
      <meta
        name="title"
        property="og:title"
        content={mapTitle ? mapTitle : "Learney Map"}
      />
      <meta
        name="image"
        property="og:image"
        content="https://maps.joindeltaacademy.com/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:url"
        content="https://maps.joindeltaacademy.com/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:secure_url"
        content="https://maps.joindeltaacademy.com/images/2021/05/19/learney_background.png"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://maps.joindeltaacademy.com" />
      <meta
        name="description"
        property="og:description"
        content={
          !mapDescription
            ? "The online learning platform designed to get you the fastest path to what you want to learn."
            : mapDescription
        }
      />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
  );
}
