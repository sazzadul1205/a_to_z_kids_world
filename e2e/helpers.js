// Shared helpers for the end-to-end suites.
//
// A unique run id keeps repeated runs from colliding on the seeded catalogue:
// entities created here are named with it and cleaned up in afterAll, so the
// suite is safe to run repeatedly without manual resets.

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL || "admin@atozkids.world",
  password: process.env.E2E_ADMIN_PASSWORD || "admin12345",
};

export const API = process.env.E2E_API || "http://localhost:3000";

export const RUN_ID = `e2e${Date.now().toString(36).slice(-6)}`;

export const stamp = (label) => `${label}-${RUN_ID}`;

// --- API access -------------------------------------------------------------
// Used to arrange and assert state around the browser. Going through the real
// HTTP API rather than the data files means these helpers also exercise the same
// contract the UI depends on.

export async function apiLogin() {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  });
  if (!res.ok) throw new Error(`admin login failed: ${res.status}`);
  return (await res.json()).token;
}

export async function apiAsAdmin(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

export const apiGet = (path) =>
  fetch(`${API}${path}`).then(async (res) => ({
    status: res.status,
    body: await res.json().catch(() => null),
  }));

// --- Browser helpers --------------------------------------------------------

export async function signIn(page, credentials = ADMIN) {
  await page.goto("/admin/login");
  await page.getByLabel(/email address/i).fill(credentials.email);
  await page.getByLabel(/^password$/i).fill(credentials.password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  // Wait for the session to be committed before returning. Callers navigate
  // straight afterwards, and an early goto interrupts the login and lands back
  // on the login page.
  await page.waitForURL((url) => !url.pathname.startsWith("/admin/login"));
}

// The product details modal. Its actions must be addressed through this because
// the card behind it carries a "Buy now" of its own.
export const productDialog = (page) => page.getByRole("dialog");

export async function openProduct(page, name) {
  await page.goto("/shop");
  // The Shop page's own input; the navbar carries a second search box that would
  // otherwise make this a strict-mode violation.
  await page.getByPlaceholder(/search toys/i).fill(name);
  // Wait for the grid to settle on the filtered result before opening anything.
  const card = page.locator("article").filter({ hasText: name }).first();
  await card.waitFor({ state: "visible" });
  await card.getByRole("button", { name: /buy now/i }).click();
  await productDialog(page).getByRole("button", { name: /add to cart/i }).waitFor({ state: "visible" });
}

// Closes the product modal. Escape is the documented dismiss path.
export async function closeModal(page) {
  await page.keyboard.press("Escape");
  await productDialog(page).waitFor({ state: "hidden" });
}

// Records every request the page makes, so a test can assert on calls that must
// never happen (for example, that checkout never reaches the orders endpoint).
export function recordRequests(page) {
  const calls = [];
  page.on("request", (request) => calls.push({ method: request.method(), url: request.url() }));
  return calls;
}

// --- Admin panel -------------------------------------------------------------

// Admin product rows are nested divs rather than table rows, so a row is found by
// pairing an exact name with the row's own controls; `.last()` takes the nearest
// matching ancestor.
export function adminProductRow(page, name) {
  return page
    .locator("div")
    .filter({ has: page.getByText(name, { exact: true }) })
    .filter({ has: page.getByRole("button", { name: /^delete$/i }) })
    .last();
}

// The login form's single error paragraph.
export const loginError = (page) => page.locator("p.rounded-xl").filter({ hasText: /invalid|incorrect|wrong|failed/i });

// The modal renders its aggregate as the average followed by a "(count)" span,
// so the count is addressed by shape rather than by prose.
const countSpan = (page) =>
  productDialog(page).locator("span").filter({ hasText: /^\(\d+\)$/ });

export async function shownReviewCount(page) {
  return Number((await countSpan(page).innerText()).replace(/[()]/g, ""));
}

// The average is a bare text node between the stars and the "(count)" span, so it
// has to be read out of the shared row rather than from an element of its own.
export async function shownAverage(page) {
  const row = await countSpan(page).locator("xpath=..").innerText();
  const match = row.match(/(\d+\.\d)/);
  return match ? Number(match[1]) : Number.NaN;
}

export async function clearCart(page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("a-to-z-kids-cart"));
}

// --- Waiting ---------------------------------------------------------------

// Counting cards immediately after a keystroke races the filter, because the
// grid re-renders after the input event. This waits for two consecutive reads to
// agree instead of guessing a sleep duration.
export async function settledCount(locator, attempts = 40) {
  let previous = -1;
  for (let i = 0; i < attempts; i += 1) {
    const current = await locator.count();
    if (current === previous) return current;
    previous = current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return previous;
}

// Waits for the product grid to be present before counting it.
export async function waitForGrid(page) {
  await page.locator("article").first().waitFor({ state: "visible" });
}