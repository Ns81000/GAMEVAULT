import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        mint: "var(--mint)",
        "mint-dark": "var(--mint-dark)",
        ultraviolet: "var(--ultraviolet)",
        "ultraviolet-dark": "var(--ultraviolet-dark)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-inverted": "var(--text-inverted)",
        "text-absolute-black": "var(--text-absolute-black)",
        "link-hover": "var(--link-hover)",
        "border-default": "var(--border-default)",
        "border-mint": "var(--border-mint)",
        "border-surface": "var(--border-surface)",
        "focus-ring": "var(--focus-ring)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        input: "2px",
        "img-inner": "4px",
        card: "20px",
        "card-lg": "24px",
        promo: "30px",
        pill: "40px",
      },
    },
  },
  plugins: [],
};
export default config;
