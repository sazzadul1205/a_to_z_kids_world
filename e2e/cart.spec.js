import { test, expect } from "@playwright/test";
import { apiGet, openProduct, closeModal, productDialog, clearCart, recordRequests } from "./helpers.js";

// The cart lives in localStorage and prices itself from the catalogue it fetched,
// so these assertions cross-check the drawer against the API rather than against
// a hardcoded fixture.
const basketButton = (page) => page.getByRole("button", { name: "Shopping basket" });
const drawer = (page) => page.locator("aside");

async function addToCart(page, name) {
  await openProduct(page, name);
  await productDialog(page).getByRole("button", { name: "Add to cart" }).click();
  // The modal stays open on add, so close it before moving on.
  await closeModal(page);
}

// The order is handed to WhatsApp in a new tab. Stub that origin with a fulfilled
// response rather than aborting it: an abort rewrites the popup URL to a
// chrome-error page, which would discard the very URL under assertion.
async function stubWhatsApp(context) {
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>stub</body></html>" }),
  );
}

test.describe("cart", () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test("badge and subtotal follow the catalogue price", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);
    expect(product).toBeTruthy();

    await addToCart(page, product.name);
    await expect(basketButton(page)).toContainText("1");

    await basketButton(page).click();
    await expect(drawer(page).getByRole("heading", { name: /Shopping basket \(1\)/ })).toBeVisible();
    // The line total must be the API price, not a stale or rounded copy.
    await expect(drawer(page).getByText(new RegExp(product.price.toLocaleString("en-BD"))).first())
      .toBeVisible();
  });

  test("quantity changes recompute the subtotal", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 1);
    expect(product).toBeTruthy();

    await addToCart(page, product.name);
    await basketButton(page).click();

    await drawer(page).getByRole("button", { name: "Increase quantity" }).click();
    await expect(drawer(page).getByRole("heading", { name: /Shopping basket \(2\)/ })).toBeVisible();

    // Subtotal must equal unit price x 2.
    const expected = new RegExp((product.price * 2).toLocaleString("en-BD"));
    await expect(drawer(page).getByText(expected).first()).toBeVisible();

    await drawer(page).getByRole("button", { name: "Decrease quantity" }).click();
    await expect(drawer(page).getByRole("heading", { name: /Shopping basket \(1\)/ })).toBeVisible();
  });

  test("quantity cannot exceed available stock", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);
    expect(product).toBeTruthy();

    await addToCart(page, product.name);
    await basketButton(page).click();

    const increase = drawer(page).getByRole("button", { name: "Increase quantity" });
    // Drive it to the stock ceiling and confirm the control locks there.
    for (let i = 1; i < product.stock; i += 1) {
      if (await increase.isDisabled()) break;
      await increase.click();
    }
    await expect(increase).toBeDisabled();
    await expect(
      drawer(page).getByRole("heading", { name: new RegExp(`Shopping basket \\(${product.stock}\\)`) }),
    ).toBeVisible();
  });

  test("removing the last item empties the basket", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);

    await addToCart(page, product.name);
    await basketButton(page).click();
    await drawer(page).getByRole("button", { name: `Remove ${product.name}` }).click();

    await expect(drawer(page).getByText(/ready for fun/i)).toBeVisible();
    // An empty basket must not offer a checkout route.
    await expect(drawer(page).getByRole("button", { name: "Checkout" })).toHaveCount(0);
  });

  test("basket survives a reload", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);

    await addToCart(page, product.name);
    await page.reload();
    await expect(basketButton(page)).toContainText("1");
  });
});

test.describe("whatsapp checkout", () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test("checkout hands the order to WhatsApp and clears the basket", async ({ page, context }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);

    // The order is handed to WhatsApp in a new tab; intercept the popup instead of
    // letting the run depend on an external site.
    await stubWhatsApp(context);

    await addToCart(page, product.name);
    await basketButton(page).click();
    await drawer(page).getByRole("button", { name: "Checkout" }).click();
    await expect(page).toHaveURL(/\/checkout/);

    await page.getByLabel(/full name|name/i).first().fill("E2E Tester");
    await page.getByLabel(/address|street/i).first().fill("12 Test Road");
    await page.getByLabel(/city/i).fill("Dhaka");
    await page.getByLabel(/postal|zip/i).fill("1212");

    const popupPromise = context.waitForEvent("page");
    await page.getByRole("button", { name: /send order on whatsapp/i }).click();
    const popup = await popupPromise;
    const target = popup.url();

    expect(target).toContain("wa.me/");
    const message = decodeURIComponent(new URL(target).searchParams.get("text") || "");
    // The message has to carry the actual order, not just open a blank chat.
    expect(message).toContain(product.name);
    expect(message).toContain(`x1`);
    expect(message).toContain("E2E Tester");
    expect(message).toContain("Dhaka");
    await popup.close();

    await expect(page.getByText(/whatsapp opened with your order/i)).toBeVisible();
    // Basket is emptied once the order has been handed off, leaving only the
    // route back to the shop.
    await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible();
  });

  test("checkout never posts an order to the API", async ({ page, context }) => {
    // Checkout is WhatsApp-only by design, so a POST /orders from the storefront
    // would mean the public order endpoint had been reintroduced.
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);

    // The order is handed to WhatsApp in a new tab; intercept the popup instead of
    // letting the run depend on an external site.
    await stubWhatsApp(context);

    await addToCart(page, product.name);
    await basketButton(page).click();
    await drawer(page).getByRole("button", { name: "Checkout" }).click();

    await page.getByLabel(/full name|name/i).first().fill("E2E Tester");
    await page.getByLabel(/address|street/i).first().fill("12 Test Road");
    await page.getByLabel(/city/i).fill("Dhaka");
    await page.getByLabel(/postal|zip/i).fill("1212");

    const calls = recordRequests(page);
    const popupPromise = context.waitForEvent("page");
    await page.getByRole("button", { name: /send order on whatsapp/i }).click();
    (await popupPromise).close();

    const orderPosts = calls.filter(
      (c) => c.method === "POST" && /\/orders\b/.test(new URL(c.url).pathname),
    );
    expect(orderPosts).toEqual([]);
  });

  test("an empty basket cannot start checkout", async ({ page }) => {
    await page.goto("/checkout");
    // Nothing to buy means nothing to send.
    await expect(page.getByRole("button", { name: /send order on whatsapp/i })).toHaveCount(0);
  });

  test("buy now jumps straight to checkout with the item present", async ({ page }) => {
    const products = await apiGet("/products");
    const product = products.body.find((p) => p.stock > 0);

    await openProduct(page, product.name);
    await productDialog(page).getByRole("button", { name: "Buy now" }).click();
    await expect(page).toHaveURL(/\/checkout/);
    // The name appears in both the summary and the line-item list, so assert the
    // summary region rather than a bare text match.
    await expect(page.getByRole("complementary")).toContainText(product.name);
  });
});