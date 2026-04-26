/** @type {import('tailwindcss').Config} */
export default {
  // Paths are resolved against the CWD that runs PostCSS — i.e. apps/web/.
  // Keeping the config at the monorepo root and the paths app-relative lets us
  // grow the workspace without touching this file again.
  content: [
    "./index.html",
    "./main.tsx",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B0F",
          50: "#F7F7F8",
          100: "#EFEFF1",
          200: "#D9D9DE",
          300: "#B7B7BF",
          400: "#8A8A93",
          500: "#5C5C66",
          600: "#3A3A42",
          700: "#22222A",
          800: "#15151B",
          900: "#0B0B0F",
        },
        gold: {
          DEFAULT: "#C9A24B",
          50: "#FBF7EC",
          100: "#F5ECCF",
          200: "#EBD89F",
          300: "#E0C46F",
          400: "#D6B048",
          500: "#C9A24B",
          600: "#A2823B",
          700: "#7A622C",
          800: "#52411E",
          900: "#2A210F",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "\"Plus Jakarta Sans\"",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 11, 15, 0.04), 0 8px 24px rgba(11, 11, 15, 0.06)",
        glow: "0 10px 40px -10px rgba(201, 162, 75, 0.45)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
