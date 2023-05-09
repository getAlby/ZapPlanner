/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      heading: ["Catamaran", "sans-serif"],
      body: ["Inter", "sans-serif"],
      mono: ["Roboto Mono", "monospace"],
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#000000",
          "primary-content": "#374151",
          "base-100": "white",
          "base-200": "#F5F5F5",
        },
      },
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#ffffff",
          "primary-content": "#6b7280",
        },
      },
    ],
    darkTheme: "dark",
  },
};
