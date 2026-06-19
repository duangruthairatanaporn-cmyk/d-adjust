import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f8f6f1",
        clay: "#b9765a",
        sage: "#72816d",
        line: "#ded8cd"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
