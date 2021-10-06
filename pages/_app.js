import "tailwindcss/tailwind.css";
import React from "react";
import PropTypes from "prop-types";
import "../styles/global.css";
import "../styles/tooltip.css";

export default function MyApp({ Component, pageProps }) {
  console.log(Component);
  return <Component {...pageProps} />;
}

MyApp.propTypes = {
  Component: PropTypes.node,
  pageProps: PropTypes.object,
};
