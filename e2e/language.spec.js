import { test, expect } from "@playwright/test";

// The language toggle sits beside the theme toggle and mirrors ThemeContext:
// a stored preference wins over browser detection, and switching survives a
// reload. These run in English to start, then flip to Bangla and back.
test.describe("language toggle", () => {
  test("defaults to English and switches the storefront to Bangla", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Shop", exact: true })).toBeVisible();

    // The toggle names the language it switches to, not the current one.
    const toggle = page.getByRole("button", { name: /switch to bangla/i });
    await expect(toggle).toBeVisible();
    await toggle.click();

    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("link", { name: "শপ", exact: true })).toBeVisible();
    // The offer button in the hero is chrome, so it switches too.
    await expect(page.getByRole("link", { name: /এখনই কিনুন/ }).first()).toBeVisible();
  });

  test("switching back to English restores the original copy", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: /switch to bangla/i }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");

    await page.getByRole("button", { name: /switch to english|ইংরেজিতে/i }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Shop", exact: true })).toBeVisible();
  });

  test("the choice survives a reload and does not depend on the URL", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: /switch to bangla/i }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
    await expect(page.getByRole("link", { name: "শপ", exact: true })).toBeVisible();

    // Navigating elsewhere must not reset it.
    await page.getByRole("link", { name: "শপ", exact: true }).click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  });

  test("the preference is stored under the shared cart-style key", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: /switch to bangla/i }).click();
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("a-to-z-kids-language"),
    );
    expect(stored).toBe("bn");
  });

  test("category filters still round-trip the URL in Bangla", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: /switch to bangla/i }).click();

    // The chip label is translated but the identifier behind it is not, so the
    // ?category= parameter keeps the API's name and remains shareable.
    await page.getByRole("button", { name: "বোর্ড গেম" }).click();
    await expect(page).toHaveURL(/category=Board\+games/);

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();

    // A reload of that URL must still filter, in Bangla.
    await page.reload();
    await expect(page).toHaveURL(/category=Board\+games/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("the all-toys sentinel keeps working in Bangla", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: /switch to bangla/i }).click();

    // Selecting all toys must clear the parameter rather than set it to the
    // translated label.
    await page.getByRole("button", { name: "বোর্ড গেম" }).click();
    await expect(page).toHaveURL(/category=/);

    await page.getByRole("button", { name: "সব খেলনা" }).click();
    await expect(page).not.toHaveURL(/category=/);
  });

  test("Bangla uses Bengali digits for prices", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: /switch to bangla/i }).click();

    await page.getByRole("link", { name: "শপ", exact: true }).click();
    await expect(page.locator("article").first()).toBeVisible();

    // Bengali digits appear as ০১২৩৪৫৬৭৮৯; Latin ones must be gone from a price.
    const price = page.locator("article").first().getByText(/৳/).first();
    await expect(price).toBeVisible();
    await expect(price).toHaveText(/[০-৯]/);
    await expect(price).not.toHaveText(/[0-9]/);
  });

  test("product detail copy and the review form are translated", async ({ page }) => {
    await page.goto("/shop");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: /switch to bangla/i }).click();

    const card = page.locator("article").first();
    await card.getByRole("button", { name: /এখনই কিনুন/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "বাস্কেটে যোগ করুন" })).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /পরিবারের মতামত/ })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "রিভিউ প্রকাশ করুন" })).toBeVisible();
  });

  test("the cart drawer is translated", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.removeItem("a-to-z-kids-cart"));
    await page.evaluate(() => window.localStorage.removeItem("a-to-z-kids-language"));
    await page.reload();
    await page.getByRole("button", { name: /switch to bangla/i }).click();

    await page.getByRole("button", { name: "কেনাকাটার ঝুড়ি" }).click();
    const drawer = page.getByRole("complementary");
    await expect(drawer.getByRole("heading", { name: /কেনাকাটার ঝুড়ি/ })).toBeVisible();
    await expect(drawer.getByText(/আপনার বাস্কেট মজার জন্য প্রস্তুত/)).toBeVisible();
  });

  test("the suite's pinned en-US browser falls back to English", async ({ page }) => {
    await page.goto("/");
    // No stored choice, and the browser reports only en-US, so detection has to
    // pick English and nothing should be written to storage behind our back.
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await page.evaluate(() => window.localStorage.getItem("a-to-z-kids-language"))).toBeNull();
  });
});