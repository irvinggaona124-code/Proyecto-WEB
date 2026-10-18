import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#EDEDED",
        surface: {
          50: "#0A0A0A",
          100: "#111111",
          200: "#1A1A1A",
          border: "#262626",
          hover: "#1F1F1F",
        },
        accent: {
          blue: "#0070F3",
          cyan: "#50E3C2",
          emerald: "#00E599",
          amber: "#F5A623",
          rose: "#FF0080",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        vercel: "6px",
      }
    },
  },
  plugins: [],
};

export default config;
