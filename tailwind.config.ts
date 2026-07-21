// tailwind.config.ts
import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#fcfcfb",
        ink: "#111111",
        muted: "#8a8a8a",
        // greys used throughout the design
        grey: {
          300: "#e4e4e0",
          350: "#d9d9d5",
          400: "#d2d2ce",
          500: "#c4c4c0",
          600: "#b3b3af",
          700: "#a8a8a8",
          800: "#6f6f6f",
          900: "#3c3c3a",
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        mono: ["ui-monospace", "Menlo", "monospace"],
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(42px)" },
          to: { opacity: "1", transform: "none" },
        },
        lineGrow: {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        pulse: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".35" },
        },
      },
      animation: {
        rise: "rise .7s ease both",
        "rise-1": "rise .7s ease .14s both",
        "rise-2": "rise .7s ease .24s both",
        pulse: "pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
