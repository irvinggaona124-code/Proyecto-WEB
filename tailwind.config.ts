import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        "on-primary": "#ffffff",
        "secondary-auralis": "#6B6B6B",
        "panel-auralis": "#F3F2EF",
        "card-auralis": "#FCFCFB",
        "border-auralis": "#E7E7E4",
        surface: "#fdf8f8",
        "surface-bright": "#fdf8f8",
        "surface-variant": "#e5e2e1",
        "surface-container": "#f1edec",
        "surface-container-low": "#f7f3f2",
        "surface-container-high": "#ebe7e6",
        "surface-container-highest": "#e5e2e1",
        outline: "#747878",
        "outline-variant": "#c4c7c7",
        background: "#F7F7F5",
      },
      fontFamily: {
        sans: [
          "Geist",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        h1: ["Geist", "Inter", "sans-serif"],
        h2: ["Geist", "Inter", "sans-serif"],
        h3: ["Geist", "Inter", "sans-serif"],
        "body-md": ["Geist", "Inter", "sans-serif"],
        "body-lg": ["Geist", "Inter", "sans-serif"],
        "label-caps": ["Geist", "Inter", "sans-serif"],
        mono: [
          "Geist Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        h1: ["84px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "600" }],
        h2: ["48px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "600" }],
        h3: ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" }],
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
