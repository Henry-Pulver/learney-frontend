module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      cursor: {
        cell: "cell",
        copy: "copy",
        crosshair: "crosshair",
      },
      maxHeight: {
        40: "40%",
        70: "70%",
        90: "90%",
        "screen-80": "80vw",
      },
      minHeight: {
        30: "7.5rem",
      },
      maxWidth: {
        90: "90%",
        95: "95%",
      },
      minWidth: {
        60: "60%",
      },
      width: {
        "70vw": "70vw",
        108: "27rem",
        120: "30rem",
        200: "50rem",
        "screen-sm": "640px",
      },
      borderWidth: {
        14: "14px",
        28: "28px",
      },
      backgroundImage: {
        learney: "linear-gradient(40deg, #ff0080, #008ef2)",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["visited"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
