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

export default function App({ Component, pageProps }) {
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
