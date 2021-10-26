import React from "react";
import Head from "next/head";

export default function MapHeader() {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <title>Learney Prototype</title>
      <link rel="icon" href="/favicon_new-32x32.png" />
      <meta xmlns="http://www.w3.org/1999/xhtml" />
      <meta name="title" property="og:title" content="Learney Prototype" />
      <meta
        name="image"
        property="og:image"
        content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:url"
        content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
      />
      <meta
        property="og:image:secure_url"
        content="https://app.learney.me/static/images/2021/05/19/learney_background.png"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://app.learney.me" />
      <meta
        name="description"
        property="og:description"
        content="The online learning platform designed to help you efficiently take your own path."
      />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
  );
}