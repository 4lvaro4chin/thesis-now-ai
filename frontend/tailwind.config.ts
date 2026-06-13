import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          500: "#1D9E75",
          700: "#0F6E56",
          900: "#04342C",
        },
        navy: "#1B2A4A",
        text: {
          DEFAULT: "#2D3748",
          muted: "#6B7280",
        },
        border: "#E8EDEB",
        bg: "#F4F6F5",
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        serif: ["'Cormorant Garamond'", "serif"],
        mono: ["monospace"],
      },
      boxShadow: {
        "green": "0 4px 20px rgba(15,110,86,0.12)",
        "green-lg": "0 8px 40px rgba(15,110,86,0.16)",
      },
      spacing: {
        "4.5": "1.125rem",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
      },
      maxWidth: {
        "prose": "1100px",
      },
    },
  },
  plugins: [],
};

export default config;
