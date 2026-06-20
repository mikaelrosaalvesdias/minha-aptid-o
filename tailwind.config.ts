import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./prisma/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: "#15201c",
        moss: "#31594c",
        mint: "#e4f4ee",
        clay: "#b7634a",
        amberline: "#efb95f",
        paper: "#fbfaf7"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(21, 32, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
