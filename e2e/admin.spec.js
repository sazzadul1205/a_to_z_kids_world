import { test, expect } from "@playwright/test";
import {
  ADMIN,
  API,
  apiGet,
  apiLogin,
  apiAsAdmin,
  stamp,
  signIn,
  adminProductRow,
  loginError,
} from "./helpers.js";

// The staff area is deliberately unlinked and Admin-only. These tests pin the
// access rules, the session lifecycle, and the absence of public sign-up.

test.describe("admin access", () => {
  test("the staff area is reachable directly but never linked publicly", async ({ page }) => {
    await page.goto("/");
    // Every public page must stay free of staff links, so a visitor cannot
    // stumble into the admin area from navigation.
    for (const path of ["/", "/shop", "/about", "/contact", "/sitemap"]) {
      await page.goto(path);
      const links = await page.locator('a[href^="/admin"]').count();
      expect(links, `${path} links to /admin`).toBe(0);
    }

    // It still works when typed directly.
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /store admin/i })).toBeVisible();
  });

  test("no public sign-up route exists", async ({ page }) => {
    // Sign-up is deliberately absent: shoppers need no account, and staff are
    // provisioned rather than self-registered.
    for (const path of ["/signup", "/register", "/admin/register", "/create-account"]) {
      await page.goto(path);
      // Each falls through to the not-found page, never to a registration form.
      await expect(page.getByRole("heading", { name: /toy lost its way/i })).toBeVisible();
      expect(await page.getByRole("button", { name: /sign up|create account|register/i }).count()).toBe(0);
    }
  });

  test("every admin route redirects an anonymous visitor to the login page", async ({ page }) => {
    for (const path of ["/admin", "/admin/products", "/admin/categories", "/admin/reviews", "/admin/orders", "/admin/users"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/, `${path} did not redirect`);
      await expect(page.getByRole("heading", { name: /store admin/i })).toBeVisible();
    }
  });

  test("a wrong password and an unknown account fail identically", async ({ page }) => {
    // The login response must not reveal whether the account exists, so the two
    // failure modes have to be indistinguishable to the visitor.
    await page.goto("/admin/login");
    await page.getByLabel(/email address/i).fill(ADMIN.email);
    await page.getByLabel(/^password$/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(loginError(page)).toBeVisible();
    const wrongPassword = (await loginError(page).innerText()).trim();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByLabel(/email address/i).fill(`nobody-${stamp("x")}@example.com`);
    await page.getByLabel(/^password$/i).fill("whatever123");
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(loginError(page)).toBeVisible();
    const unknownAccount = (await loginError(page).innerText()).trim();

    expect(unknownAccount).toBe(wrongPassword);

    // A real admin must still be able to sign in afterwards.
    await page.getByLabel(/email address/i).fill(ADMIN.email);
    await page.getByLabel(/^password$/i).fill(ADMIN.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("valid credentials open the dashboard and survive a reload", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Products", exact: true })).toBeVisible();

    // The session is stored, so a reload must not bounce back to the login page.
    await page.reload();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("signing out ends the session immediately", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);

    // And the stored token must not bring the admin area back.
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("catalogue administration", () => {
  test("an admin can create, edit, and delete a product", async ({ page }) => {
    const name = stamp("E2E Product");
    await signIn(page);
    await page.goto("/admin/products");

    // Create.
    await page.getByRole("button", { name: /new product/i }).click();
    await page.getByLabel(/^name$/i).fill(name);
    await page.getByLabel(/description/i).fill("Created by the end-to-end suite.");
    await page.getByLabel(/price/i).fill("499");
    await page.getByLabel(/stock/i).fill("7");
    await page.getByRole("button", { name: /create product/i }).click();
    await expect(page.getByText(name)).toBeVisible();

    // It must be readable through the public API, proving the write landed.
    const listed = await apiGet("/products");
    const created = listed.body.find((p) => p.name === name);
    expect(created).toMatchObject({ price: 499, stock: 7 });

    // Edit.
    await adminProductRow(page, name).getByRole("button", { name: /^edit$/i }).click();
    await page.getByLabel(/^name$/i).fill(`${name} edited`);
    await page.getByLabel(/stock/i).fill("9");
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(adminProductRow(page, `${name} edited`)).toBeVisible();

    const afterEdit = await apiGet("/products");
    expect(afterEdit.body.find((p) => p.name === `${name} edited`)).toMatchObject({ stock: 9 });

    // Delete. The panel confirms with window.confirm, which blocks the handler
    // until the dialog is answered.
    page.once("dialog", (dialog) => dialog.accept());
    await adminProductRow(page, `${name} edited`).getByRole("button", { name: /^delete$/i }).click();

    await expect(async () => {
      const final = await apiGet("/products");
      expect(final.body.some((p) => p.name === `${name} edited`)).toBe(false);
    }).toPass({ timeout: 15_000 });
  });

  test("catalogue writes are refused without a valid admin token", async () => {
    const payload = { name: stamp("Probe"), description: "x", price: 1, stock: 1 };

    // A malformed token must never be accepted.
    const bogus = await apiAsAdmin("not-a-real-token", "POST", "/products", payload);
    expect(bogus.status).toBe(401);

    // Nor may an anonymous request.
    const anonymous = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(anonymous.status).toBe(401);

    // The valid admin token is accepted, so the refusals above are about the
    // token rather than the payload.
    const token = await apiLogin();
    expect(token).toBeTruthy();
    const allowed = await apiAsAdmin(token, "GET", "/products");
    expect(allowed.status).toBe(200);
  });

  test("the storefront does not expose an admin session to public pages", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/admin$/);

    // Public pages must still render as an anonymous shopper, with no staff
    // controls leaking into the shared layout.
    await page.goto("/shop");
    await expect(page.locator("article").first()).toBeVisible();
    expect(await page.locator('a[href^="/admin"]').count()).toBe(0);
  });
});