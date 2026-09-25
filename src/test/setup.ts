import "@testing-library/jest-dom/vitest";

import { beforeEach } from "vitest";

// The language choice is persisted, so without this a test that switches
// language would leak into the next one through localStorage.
beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "he";
  document.documentElement.dir = "rtl";
});
