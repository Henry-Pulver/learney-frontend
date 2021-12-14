import React from "react";
import PropTypes from "prop-types";
import { UserProvider } from "@auth0/nextjs-auth0";
import "tailwindcss/tailwind.css";
import "../styles/global.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import "tippy.js/themes/light.css";
import "react-select2-wrapper/css/select2.css";
import { ErrorBoundary } from "../ErrorBoundary";

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </ErrorBoundary>
  );
}

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};
