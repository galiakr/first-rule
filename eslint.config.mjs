import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: ["coverage/**", "playwright-report/**", "test-results/**"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
