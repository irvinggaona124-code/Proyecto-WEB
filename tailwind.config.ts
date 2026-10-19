import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html",
    "./*.html",
  ],
  theme: {
    extend: {
      colors: {
        geist: {
          black: "#000000",
          white: "#ffffff",
          gray: {
            100: "#0a0a0a",
            200: "#111111",
            300: "#1f1f1f",
            400: "#2e2e2e",
            500: "#444444",
            600: "#666666",
            700: "#888888",
            800: "#a1a1a1",
            900: "#eaeaea",
          },
          border: {
            subtle: "#1f1f1f",
            default: "#2e2e2e",
            hover: "#444444",
            strong: "#666666",
          },
          accent: {
            blue: "#0070f3",
            "blue-hover": "#005bb5",
          },
          status: {
            success: "#00e599",
            warning: "#f5a623",
            error: "#ee0000",
          },
        },
      },
      fontFamily: {
        sans: [
          "Geist Sans",
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "var(--font-mono)",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        snug: "-0.01em",
      },
    },
  },
  plugins: [],
};

export default config;
