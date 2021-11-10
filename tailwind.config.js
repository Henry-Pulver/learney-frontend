module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      scale: {
        40: ".4",
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
