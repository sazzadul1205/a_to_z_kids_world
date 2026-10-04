# A to Z Kids World — Storefront

React 19 + Vite 8 storefront. Visitors browse the catalogue and order over
WhatsApp; there is no shopper account and no client-side checkout that writes
orders. A separate, unlinked staff area manages the catalogue through the API.

## Running

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run lint
npm run preview
```

The dev server proxies `/api` to `http://localhost:3000` and **strips the
`/api` prefix**, because the API mounts its resources at the root
(`/products`, `/uploads`, ...). Point it elsewhere with
`VITE_API_PROXY_TARGET`.

## Environment

Copy `.env.example` to `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | In development, Vite proxies this. For a production build set it to the API origin, e.g. `https://api.example.com`. |
| `VITE_WHATSAPP_NUMBER` | — | WhatsApp number for order and enquiry deep links, international format, no `+` or spaces. |

Anything prefixed `VITE_` is inlined into the client bundle at build time and
is therefore **public**. Keep secrets out of this file.

## Structure

```
src/
  context/catalog/  loads categories + products once and shares them
  hooks/            useResource (async data), useProductReviews
  lib/              api client, auth token storage, formatting helpers
  Pages/Home/       hero, categories, product grid, product modal
  Pages/Shop/       filtering, sorting, search
  Pages/Checkout/   collects details, then hands the basket to WhatsApp
  Pages/Admin/      unlinked staff area
  Shared/           navbar, footer, cart drawer, contexts
```

### Data loading

`useResource(fetcher)` wraps every API read. Callers memoise `fetcher` with
`useCallback` — a new identity means a different resource, and the hook resets
to `loading` so the previous resource's data is never shown against the new
one. Results are guarded by an `AbortSignal` and an `active` flag, so a fast
filter change cannot land a stale response.

`categories` and `products` load once in `CatalogProvider` and are shared
through context; rating summaries are per-product and load on demand.

### Cart

The basket is client-side only and lives in `localStorage`. Stored stock figures
are a snapshot from when an item was added, so once the catalogue loads, every
line is reconciled against it: quantities are clamped to real availability,
prices are refreshed, and products that are gone or sold out are dropped. What
the shopper sees is therefore never a phantom line.

`addToCart` reports whether it accepted the toy. A refused add — sold out, or
already holding every unit in stock — surfaces as a message instead of closing
the product dialog silently, and "Buy now" stays put rather than navigating to
checkout with nothing added.

### Checkout

Checkout collects delivery details and hands the basket to WhatsApp. It never
calls `POST /orders`.

## Staff area

Lives at **`/admin/login`** and is deliberately not linked from the navbar,
footer, or sitemap — type the URL. It is guarded by `RequireAdmin`, which
revalidates the session against `GET /auth/me` on load.

- **Dashboard** — product and category counts, open orders, order value, low stock, recent reviews.
- **Products** — create, edit, delete. Images upload to the API or paste as a URL.
- **Categories** — create, edit, delete. The warning explains what happens to products left pointing at a removed category.
- **Reviews** — edit the rating and comment, or delete.
- **Orders** — change status or delete.
- **Staff** — create accounts, promote or demote, reset passwords, delete. Changing your own password signs you out, because the API invalidates tokens issued before the change.

## Session handling

The token lives in `localStorage`. `lib/api.js` clears it only when a request
that actually carried a token comes back `401` — a rejected login must not
wipe a different, still-valid session, and a public request that happens to
`401` has no session to clear.

`resolveImageUrl` passes absolute `http(s)` URLs through and resolves
everything else — including protocol-relative `//host` and `data:` values —
against the API origin, so an image value cannot point the browser at an
unexpected origin.

## Tests

No test runner is configured. Verify with:

```bash
npm run lint
npm run build
```

Behaviour was checked against a running API through the Vite proxy: catalogue
reads, search, cart clamping, admin sign-in, and CRUD on each staff screen.
