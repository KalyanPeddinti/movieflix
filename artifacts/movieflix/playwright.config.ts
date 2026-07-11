import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for MovieFlix e2e tests.
 *
 * Tests run against the already-running dev server (managed by the
 * "artifacts/movieflix: web" workflow). The base URL uses REPLIT_DEV_DOMAIN
 * so that `/api` requests are correctly routed by the Replit reverse-proxy to
 * the API Server artifact (port 8080), while the frontend is served from
 * port 18220.
 */

const devDomain = process.env.REPLIT_DEV_DOMAIN;
const baseURL = devDomain
  ? `https://${devDomain}`
  : "http://localhost:18220";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Replit dev domain uses a valid TLS cert — no need to ignore
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use the NixOS system Chromium — the Playwright headless-shell
        // download lacks required shared libraries in NixOS's non-FHS layout.
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ??
            "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
  ],
});
