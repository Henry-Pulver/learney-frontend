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
      fontSize: {
        xxs: ".625rem",
      },
      maxHeight: {
        40: "40%",
        70: "70%",
        90: "90%",
        "screen-80": "80vw",
      },
      minHeight: {
        30: "7.5rem",
        "1/5": "20%",
        "3/5": "60%",
      },
      height: {
        15: "3.75rem",
      },
      maxWidth: {
        xxs: "16rem",
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
        152: "38rem",
        168: "42rem",
        200: "50rem",
      },
      borderWidth: {
        14: "14px",
        28: "28px",
      },
      backgroundImage: {
        learney: "linear-gradient(40deg, #ff0080, #008ef2)",
      },
      // animation: TODO: Add this if I have time!!
    },
  },
  variants: {
    extend: {
      backgroundColor: ["visited"],
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
