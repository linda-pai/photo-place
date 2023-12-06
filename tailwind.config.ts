import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "main-color": "var(--main-color)",
        "main-color-dark": "var(--main-color-dark)",
        "main-color-light": "var(--main-color-light)",
        "main-color-lighter": "var(--main-color-lighter)",
      },
      colors: {
        "main-color": "var(--main-color)",
        "main-color-dark": "var(--main-color-dark)",
        "main-color-light": "var(--main-color-light)",
        "main-color-lighter": "var(--main-color-lighter)",
      },
    },
  },
  plugins: [],
};
export default config;
