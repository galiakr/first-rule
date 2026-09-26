import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0E211C",
        dusk: "#16302A",
        moss: "#22463D",
        paper: "#E6E0CC",
        ink: "#20302B",
        lamp: "#E8A33D",
        harm: "#C2563C",
        quiet: "#8FA79C",
        // The entry screen burns hotter than the game it opens onto: a
        // deeper night so the lamp reads as light rather than as a tint.
        deepnight: "#07130E",
        blaze: "#FFB43D",
        ember: "#FF7A3D",
        well: "#4FA8C4",
      },
      fontFamily: {
        book: ["var(--font-book)", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      maxWidth: { read: "34rem" },
    },
  },
  plugins: [],
};
export default config;
