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
      },
      fontFamily: {
        book: ["var(--font-book)", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
      maxWidth: { read: "34rem" },
    },
  },
  plugins: [],
};
export default config;
