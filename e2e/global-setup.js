import { apiGet } from "./helpers.js";

// A browser run legitimately makes far more requests than the default API budget
// allows, and a 429 surfaces as an empty product grid -- which reads like an
// application bug rather than a throttling problem. Fail fast with the exact fix.
const RATE_LIMIT_HINT = [
  "The API is rate-limiting the end-to-end run, so the catalogue never loads.",
  "",
  "Start the backend with raised limits and re-run:",
  "",
  "  $env:RATE_LIMIT_MAX=100000",
  "  $env:RATE_LIMIT_WINDOW_MS=60000",
  "  $env:REVIEW_SUBMIT_LIMIT=10000",
  "  $env:REVIEW_SUBMIT_WINDOW_MS=60000",
  "  npm start",
].join("\n");

export default async function globalSetup() {
  const first = await apiGet("/products");

  if (first.status === 429) {
    throw new Error(`429 from ${"/products"} on the very first request.\n${RATE_LIMIT_HINT}`);
  }

  const products = Array.isArray(first.body) ? first.body : (first.body?.products || []);
  if (!products.length) {
    throw new Error(
      `GET /products returned ${first.status} with ${products.length} products. ` +
        "Seed the database (npm run seed) before running the end-to-end suite.",
    );
  }

  // Review submission has its own budget, so check it independently.
  const submit = await apiGet("/reviews");
  if (submit.status === 429) {
    throw new Error(`429 from /reviews on the first request.\n${RATE_LIMIT_HINT}`);
  }
}