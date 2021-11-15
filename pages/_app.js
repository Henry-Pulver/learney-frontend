import React from "react";
import PropTypes from "prop-types";
import { UserProvider } from "@auth0/nextjs-auth0";
import "tailwindcss/tailwind.css";
import "../styles/global.css";
import "../styles/tooltip.css";
import "../styles/intro.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "tippy.js/themes/light.css";
import "react-select2-wrapper/css/select2.css";
import ReactGA from "react-ga";

export default function App({ Component, pageProps }) {
  if (process.env.NEXT_PUBLIC_BACKEND_URL !== undefined) {
    const backendUrl = new URL(process.env.NEXT_PUBLIC_BACKEND_URL);
    if (backendUrl.hostname === "api.learney.me") {
      ReactGA.initialize("UA-197170313-2");
    } else if (backendUrl.hostname === "staging-api.learney.me") {
      ReactGA.initialize("UA-197170313-1", { debug: true });
    }
  }

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};
