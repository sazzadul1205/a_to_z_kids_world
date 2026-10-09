import { test, expect } from "@playwright/test";
import { apiGet, settledCount, waitForGrid } from "./helpers.js";

// The navbar carries its own search box, so the Shop page's input has to be
// addressed by its own placeholder to avoid a strict-mode collision.
const shopSearch = (page) => page.getByPlaceholder(/search toys/i);

const cardCategory = (card) => card.locator("p").first();

// The category label is rendered through a CSS `uppercase` transform, so the
// text content comes back uppercased.
const normalise = (text) => text.trim().toLowerCase();

// The public storefront. Everything here must work with no session at all,
// because the API keeps catalogue reads and review submission public.
test.describe("storefront", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("loads and renders the catalogue from the API", async ({ page }) => {
    const api = await apiGet("/products");
    expect(api.status).toBe(200);
    const apiCount = api.body.length;
    expect(apiCount).toBeGreaterThan(0);

    // The grid is rendered from the fetched list, so it must agree with the API
    // rather than with a pre-seeded fixture.
    await page.goto("/");
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    const rendered = await cards.count();
    expect(rendered).toBe(apiCount);
  });

  test("renders category names resolved from /categories", async ({ page }) => {
    const api = await apiGet("/categories");
    expect(api.body.length).toBeGreaterThan(0);
    const names = api.body.map((c) => normalise(c.name));

    await page.goto("/");
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    // Products store only a categoryId, so each label must match a real category.
    const labels = await cards.locator("p").first().allInnerTexts();
    for (const label of labels) {
      expect(names).toContain(normalise(label));
    }
  });

  test("search accepts spaces, which used to be trimmed away", async ({ page }) => {
    await page.goto("/shop");
    const search = shopSearch(page);

    // A multi-word query is the regression: typing a space used to drop it.
    await search.fill("Building blocks");
    await expect(search).toHaveValue("Building blocks");
    await expect(page.locator("article")).toHaveCount(12);
    await expect(page.getByRole("heading", { name: "Building blocks Demo 1", exact: true })).toBeVisible();
  });

  test("search reflects partial input and clears back to the full list", async ({ page }) => {
    const all = await apiGet("/products");
    await page.goto("/shop");
    const search = shopSearch(page);

    await search.fill("puzzle");
    const filtered = await settledCount(page.locator("article"));
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all.body.length);

    await search.fill("");
    await expect(page.locator("article")).toHaveCount(all.body.length);
  });

  test("category chips narrow the grid and are reflected in the URL", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Board games" }).click();

    await expect(page).toHaveURL(/category=Board/);
    await waitForGrid(page);
    const cards = page.locator("article");
    const count = await settledCount(cards);
    expect(count).toBeGreaterThan(0);

    // Every visible card must belong to the chosen category.
    for (const label of await cardCategory(cards).allInnerTexts()) {
      expect(normalise(label)).toContain("board games");
    }
  });

  test("re-clicking the active category chip does not break filtering", async ({ page }) => {
    await page.goto("/");
    const chip = page.getByRole("button", { name: "Board games" });
    await chip.click();
    await waitForGrid(page);
    const first = await settledCount(page.locator("article"));
    expect(first).toBeGreaterThan(0);

    // Previously this left the scroll-to-catalogue latch armed.
    await chip.click();
    await expect(page.locator("article")).toHaveCount(first);
  });
});