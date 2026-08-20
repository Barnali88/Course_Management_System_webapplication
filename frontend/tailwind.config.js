/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c2d1ff",
          300: "#9bb3ff",
          400: "#7090ff",
          500: "#4a6cf7",
          600: "#3451eb",
          700: "#2b3fd4",
          800: "#2535ab",
          900: "#243287",
        },
        surface: {
          DEFAULT: "#0f1117",
          card:    "#161b27",
          border:  "#1e2535",
          muted:   "#252d3d",
        },
      },
      boxShadow: {
        card: "0 0 0 1px #1e2535, 0 4px 24px rgba(0,0,0,0.4)",
        glow: "0 0 24px rgba(74,108,247,0.25)",
      },
    },
  },
  plugins: [],
};
