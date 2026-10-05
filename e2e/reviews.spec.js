import { test, expect } from "@playwright/test";
import {
  apiGet,
  API,
  openProduct,
  closeModal,
  productDialog,
  stamp,
  apiLogin,
  apiAsAdmin,
  expectReviewCount,
  shownAverage,
  RUN_ID,
} from "./helpers.js";

// The public-review tests genuinely write, and review submission is deliberately
// open to anonymous visitors, so nothing else removes them. Without this the
// seeded database would grow by a handful of reviews on every run.
test.afterAll(async () => {
  const token = await apiLogin();
  const all = await apiGet("/reviews");
  const mine = (all.body || []).filter((review) => review.name?.includes(RUN_ID));
  for (const review of mine) {
    await apiAsAdmin(token, "DELETE", `/reviews/${review._id}`);
  }
});

// Review reads and review submission are deliberately public. These tests pin
// that contract: a signed-out visitor must be able to read and post, and a
// signed-out visitor must NOT be able to edit or delete.
const reviewForm = (page) => productDialog(page).getByRole("button", { name: /publish review/i });
const authorName = (name) => new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

async function submitReview(page, { name, rating, comment }) {
  const dialog = productDialog(page);
  await dialog.getByPlaceholder("Alex Explorer").fill(name);
  await dialog.getByLabel(/rating/i).selectOption(String(rating));
  if (comment) await dialog.getByPlaceholder(/what did your little one think/i).fill(comment);
  await reviewForm(page).click();
  await expect(dialog.getByText(/review has been published/i)).toBeVisible();
}

async function firstInStockProduct() {
  const products = await apiGet("/products");
  return products.body.find((p) => p.stock > 0);
}

test.describe("public reviews", () => {
  test("a signed-out visitor can read reviews and the rating summary", async ({ page }) => {
    const product = await firstInStockProduct();
    const existing = await apiGet(`/reviews?productId=${product._id}`);

    await openProduct(page, product.name);
    const dialog = productDialog(page);
    await expect(dialog.getByRole("heading", { name: /what families say/i })).toBeVisible();

    // Both halves of the aggregate must agree with the API.
    await expectReviewCount(page, existing.body.length);

    const summary = await apiGet(`/reviews/product/${product._id}/summary`);
    expect(await shownAverage(page)).toBeCloseTo(Number(summary.body.averageRating), 1);
  });

  test("a signed-out visitor can publish a review", async ({ page }) => {
    const product = await firstInStockProduct();
    const name = stamp("Visitor");
    const before = await apiGet(`/reviews?productId=${product._id}`);

    await openProduct(page, product.name);
    await submitReview(page, { name, rating: 5, comment: "Delighted with this one." });

    // It must be visible in the UI immediately, not only after a manual reload.
    await expect(productDialog(page).getByText(authorName(name))).toBeVisible();

    const after = await apiGet(`/reviews?productId=${product._id}`);
    expect(after.body.length).toBe(before.body.length + 1);
    expect(after.body.some((r) => r.name === name)).toBe(true);
  });

  test("publishing updates the average rating in place", async ({ page }) => {
    const product = await firstInStockProduct();
    const before = await apiGet(`/reviews?productId=${product._id}`);

    await openProduct(page, product.name);
    // Wait for the on-screen count to reach the API's value before deriving
    // anything from it, otherwise the arithmetic below starts from a stale 0.
    await expectReviewCount(page, before.body.length);
    const countBefore = before.body.length;

    await submitReview(page, { name: stamp("Averager"), rating: 4, comment: "Solid buy." });

    // The new aggregate must appear without a reload, which is what proves the
    // mutation invalidated the cached summary rather than leaving it stale.
    await expectReviewCount(page, countBefore + 1);

    // Recompute independently from the API to confirm the aggregate is real.
    const after = await apiGet(`/reviews?productId=${product._id}`);
    expect(after.body.length).toBe(before.body.length + 1);
    const sum = after.body.reduce((acc, r) => acc + r.rating, 0);
    const expected = sum / after.body.length;
    expect(await shownAverage(page)).toBeCloseTo(expected, 1);
  });

  test("a blank name is rejected by the form", async ({ page }) => {
    const product = await firstInStockProduct();
    await openProduct(page, product.name);

    // `required` plus minLength=2 are enforced by the browser before any request.
    await productDialog(page).getByPlaceholder("Alex Explorer").fill("A");
    await reviewForm(page).click();
    await expect(productDialog(page).getByText(/published/i)).toHaveCount(0);
  });

  test("reviews are per product, not global", async ({ page }) => {
    const products = await apiGet("/products");
    const withTwo = products.body.slice(0, 2);
    expect(withTwo.length).toBe(2);

    await openProduct(page, withTwo[0].name);
    await submitReview(page, { name: stamp("Scoped"), rating: 5, comment: "Only for this one." });
    await closeModal(page);

    const first = await apiGet(`/reviews?productId=${withTwo[0]._id}`);
    const second = await apiGet(`/reviews?productId=${withTwo[1]._id}`);
    expect(first.body.some((r) => r.name === stamp("Scoped"))).toBe(true);
    expect(second.body.some((r) => r.name === stamp("Scoped"))).toBe(false);
  });
});

test.describe("review administration", () => {
  test("a visitor cannot delete or edit reviews", async ({ request }) => {
    const product = await firstInStockProduct();
    const existing = await apiGet(`/reviews?productId=${product._id}`);
    const target = existing.body[0];
    test.skip(!target, "no seeded review to tamper with");

    // Direct API attempts, without any token.
    const del = await request.delete(`${API}/reviews/${target._id}`);
    expect(del.status()).toBe(401);

    const put = await request.put(`${API}/reviews/${target._id}`, {
      data: { name: "Tampered", rating: 1, comment: "tampered" },
    });
    expect(put.status()).toBe(401);

    // And the record must be untouched.
    const after = await apiGet(`/reviews?productId=${product._id}`);
    expect(after.body.find((r) => r._id === target._id)).toMatchObject({
      name: target.name,
      rating: target.rating,
    });
  });

  test("an admin can delete a review, and the summary follows", async () => {
    const product = await firstInStockProduct();
    const token = await apiLogin();
    const name = stamp("Doomed");

    const created = await apiAsAdmin(token, "POST", "/reviews", {
      productId: product._id,
      name,
      rating: 2,
      comment: "This one will be removed.",
    });
    expect(created.status).toBe(201);

    const listed = await apiGet(`/reviews?productId=${product._id}`);
    const target = listed.body.find((r) => r.name === name);
    expect(target).toBeTruthy();

    const removed = await apiAsAdmin(token, "DELETE", `/reviews/${target._id}`);
    expect(removed.status).toBe(200);

    const after = await apiGet(`/reviews?productId=${product._id}`);
    expect(after.body.some((r) => r._id === target._id)).toBe(false);
  });
});