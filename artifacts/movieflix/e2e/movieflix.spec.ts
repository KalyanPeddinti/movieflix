import { test, expect } from "@playwright/test";

/**
 * End-to-end tests for the core MovieFlix user flows:
 *   1. Sign up → land on home with hero banner
 *   2. Hero Play / More Info buttons are visible and navigate to movie detail
 *   3. Movie detail page loads with watchlist toggle
 *   4. Add movie to watchlist → movie appears in "My List" row on home page
 */

const testPassword = "E2ePassword1";

/** Returns a unique email address each time it is called. */
function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@test.invalid`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function signUp(page: import("@playwright/test").Page, email = uniqueEmail()) {
  await page.goto("/signup");
  await page.getByTestId("input-name").fill("E2E Tester");
  await page.getByTestId("input-email").fill(email);
  await page.getByTestId("input-password").fill(testPassword);
  await page.getByTestId("btn-submit").click();
  // After signup we are redirected to home
  await expect(page).toHaveURL("/", { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("MovieFlix core flows", () => {
  test("1 – sign up and land on home page", async ({ page }) => {
    await signUp(page);

    // The home page renders the Navbar
    await expect(page.locator("nav")).toBeVisible();
  });

  test("2 – hero banner is visible with Play and More Info buttons", async ({
    page,
  }) => {
    await signUp(page);

    // Wait for the hero to finish loading (skeleton disappears, real buttons appear).
    // Allow up to 20 s for the TMDB API call to complete.
    const playBtn = page.getByTestId("hero-btn-play");
    const infoBtn = page.getByTestId("hero-btn-info");

    await expect(playBtn).toBeVisible({ timeout: 20_000 });
    await expect(infoBtn).toBeVisible({ timeout: 20_000 });
  });

  test("3 – More Info button navigates to movie detail page", async ({
    page,
  }) => {
    await signUp(page);

    const infoBtn = page.getByTestId("hero-btn-info");
    await expect(infoBtn).toBeVisible({ timeout: 20_000 });

    // The href should look like /movie/<id>
    const href = await infoBtn.getAttribute("href");
    expect(href).toMatch(/^\/movie\/\d+$/);

    await infoBtn.click();

    await expect(page).toHaveURL(/\/movie\/\d+/, { timeout: 15_000 });

    // The movie title heading should be present and non-empty
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(heading).not.toBeEmpty();
  });

  test("4 – watchlist toggle adds movie to My List", async ({ page }) => {
    await signUp(page);

    // Navigate to a specific movie via the hero's More Info button
    const infoBtn = page.getByTestId("hero-btn-info");
    await expect(infoBtn).toBeVisible({ timeout: 20_000 });
    const href = await infoBtn.getAttribute("href");
    expect(href).toMatch(/^\/movie\/\d+$/);
    await infoBtn.click();
    await expect(page).toHaveURL(/\/movie\/\d+/, { timeout: 15_000 });

    // Wait for the watchlist toggle to appear
    const toggleBtn = page.getByTestId("btn-watchlist-toggle");
    await expect(toggleBtn).toBeVisible({ timeout: 15_000 });

    // Verify we're about to add (not remove)
    await expect(toggleBtn).toHaveAttribute("aria-label", "Add to My List");

    // Click to add
    await toggleBtn.click();

    // Toggle should now show "Remove from My List"
    await expect(toggleBtn).toHaveAttribute("aria-label", "Remove from My List", {
      timeout: 10_000,
    });

    // Navigate back to home
    await page.goto("/");

    // "My List" row should now be present
    const myListHeading = page.getByText("My List", { exact: true });
    await expect(myListHeading).toBeVisible({ timeout: 15_000 });
  });
});
