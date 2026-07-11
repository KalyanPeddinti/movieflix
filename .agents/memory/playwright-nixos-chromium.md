---
name: Playwright on NixOS — Chromium setup
description: How to run Playwright e2e tests on Replit's NixOS env where the bundled headless-shell binary lacks system libs.
---

# Playwright on NixOS — Chromium setup

## The rule
Do NOT use Playwright's downloaded `chromium` (headless-shell) on Replit NixOS. It fails with `libgbm.so.1: cannot open shared object file` because NixOS is non-FHS. Instead, install `chromium` as a Nix package and point Playwright at it.

**Why:** The downloaded headless-shell binary is a standard Linux ELF dynamically linked against FHS paths that don't exist in NixOS. The Nix-managed Chromium binary is correctly wrapped with all library paths baked in.

**How to apply:**
1. `installSystemDependencies({ packages: ["chromium"] })`
2. Find path: `which chromium` → e.g. `/nix/store/<hash>-chromium-<ver>/bin/chromium`
3. In `playwright.config.ts`, set per project:
   ```ts
   use: {
     launchOptions: {
       executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "<path from step 2>",
       args: ["--no-sandbox", "--disable-setuid-sandbox"],
     },
   }
   ```
4. Note: `executablePath` belongs inside `launchOptions`, NOT directly in `use` — direct `use.executablePath` is silently ignored.

**Known tech debt:** The Nix store hash in the fallback path becomes stale when Chromium is upgraded. Prefer `process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` as the primary and document the fallback as needing periodic update. A dynamic `child_process.execSync('which chromium')` in the config is the durable fix.
