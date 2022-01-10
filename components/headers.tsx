import React from "react";
import Head from "next/head";

export default function MapHeader({
  editMap,
  mapUrlExtension,
}: {
  editMap: boolean;
  mapUrlExtension: string;
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
      <link rel="icon" href="/favicon_new-32x32.png" />
      <meta
        name="title"
        property="og:title"
        content={isStatQuest ? "Learney - StatQuest" : "Learney"}
      />
      <meta
        name="image"
        property="og:image"
        content="https://app.learney.me/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:url"
        content="https://app.learney.me/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:secure_url"
        content="https://app.learney.me/images/2021/05/19/learney_background.png"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://app.learney.me" />
      <meta
        name="description"
        property="og:description"
        content="The online learning platform designed to get you the fastest path to what you want to learn."
      />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
  );
}
