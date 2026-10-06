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
  context/auth/      session token + admin-gated auth provider
  context/cart/      basket context + hooks (localStorage)
  context/catalog/   product/category catalogue provider + hooks
  context/language/  en/Bn i18n (LanguageProvider, useLanguage)
  context/query/     TanStack Query provider + defaults
  context/theme/     dark-mode class toggle
  hooks/             per-resource query/mutation hooks
  lib/               axios client, cache keys, formatting helpers
  layout/            site Layout (wraps Routes)
  Pages/Home/        hero, categories, product grid, product modal
  Pages/Shop/        filtering, sorting, search
  Pages/Checkout/    collects details, then hands the basket to WhatsApp
  Pages/Admin/       unlinked staff area
  Shared/            navbar, footer, cart drawer, cart notice
```

### Data loading

All server state goes through **axios** and **TanStack Query**.

`lib/api.js` is a single axios instance. A request interceptor attaches the
session token, and a response interceptor unwraps the payload, converts failures
into a typed `ApiError` carrying the status and field errors, and clears the
token on a `401` — but only when the failing request actually carried one, so a
rejected sign-in cannot wipe a different still-valid session. Cancellations are
passed through untouched, which is what lets query cancellation stay quiet.

`lib/queryKeys.js` is the only place cache keys are built, because invalidation
depends on them matching exactly.

Reads use `useQuery`; writes use `useMutation` and invalidate the keys they
affect rather than patching a local copy:

| Hook | Cache key | Invalidated by |
|---|---|---|
| `useCatalogQuery` | `["catalog"]` | product and category writes |
| `useProductReviews` | `["reviews", …]` | any review write |
| `useReviewsQuery` / `useOrdersQuery` / `useUsersQuery` | `["reviews"]`, `["orders"]`, `["users"]` | the matching writes |
| `useSessionQuery` | `["session"]` | cleared outright when the token is cleared |

Because keys are shared, the dashboard reads the same cached orders and reviews
as the Orders and Reviews screens instead of issuing its own request.

`CatalogProvider` stays a context so the nine components that read the catalogue
do not each need to know about query keys, and it keeps the `status` /
`error` / `reload` shape they already render against.

Categories and products load together in one query, because the storefront needs
the category names to render any product. A product's rating list and its
aggregate are separate queries, so the badge can appear as soon as either lands.

### Theming

Dark mode is a token swap, not a set of `dark:` overrides. `ThemeContext` toggles
one class on `<html>` and `src/index.css` redefines the tokens.

**The rule that matters: a token is either theme-dependent or it is not.** These
four are deliberately identical in both themes, because each is used on a fill
whose lightness does not change:

| Token | Used for |
| --- | --- |
| `--color-ink-on-brand` | label on a saturated brand fill (never flips) |
| `--color-ink-bright` | label on a bright chip, e.g. the sunny-yellow cart badge (never flips) |
| `--color-scrim` | modal backdrop; must darken, so it cannot be `bg-text` |
| `--color-brand-fill`, `--color-brand-fill-alt` | primary/secondary button fills |

`--color-brand-fill` exists because `primary-600` is used as a fill in some places
and as text in others (31 uses). Those need opposite lightness in dark mode, so
the fill is split out and the ramp step is left as the text voice.

**In dark mode the ramps invert.** Steps 50–300 are quiet dark surfaces, 400+ is
the bright voice for brand text, and the one deep button fill is
`--color-brand-fill`. That is why `primary-600` is lighter than `primary-500` in
dark while the reverse holds in light. Surfaces are a cool near-black rather than
a saturated navy, so the coral and sky accents stay the loudest things on the page.

Run `npm run audit:contrast` after touching any colour token or fill. It resolves
every text-on-fill pair in the markup against both palettes and fails if a dark
one drops below 4.5:1. Light is reported but does not gate the exit code: it is
the approved, shipped palette and still has pre-existing shortfalls.

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

### Language

English and Bangla are switchable from the navbar, next to the theme toggle.

- Copy lives in `src/i18n/en.js` and `src/i18n/bn.js`; `LanguageProvider` picks
  one and exposes `t`, `plural`, `formatPrice`, and `categoryLabel`.
- The choice is stored in `a-to-z-kids-language` and **only** when the visitor
  makes it explicitly. Detection from `navigator.languages` runs on every load
  until then, so a stored value always means "the visitor chose this".
- `<html lang>` is kept in sync, which is what makes Bengali glyphs and screen
  readers pick the right font and pronunciation.
- Prices follow the locale, so Bangla renders Bengali digits (`৳১,৫৯৯.০০`).
- `plural()` appends `One`/`Other` to a path. Bangla supplies both forms as the
  same string, since it does not inflect for number.
- Unknown strings fall back to English rather than rendering a raw key.

Database content is never translated. Product names, descriptions, and the
category names the API returns stay as-is; only the known category labels are
mapped for display.

**Catalogue URLs keep their identifiers.** `ALL_TOYS` in `src/lib/catalog.js` is
a comparison sentinel, so a category filter still serialises to the API's
`?category=Board games` in Bangla. Never compare against a translated label.

`npm run i18n:verify` checks every `t()`/`plural()` call site against both
dictionaries. Run it after moving copy between dictionaries.

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

The token lives in `localStorage`. `AuthProvider` revalidates a stored token
against `GET /auth/me` on mount, so a revoked account cannot linger in a stale
localStorage copy, and the `["session"]` cache entry is dropped as soon as the
token is cleared.

`resolveImageUrl` passes absolute `http(s)` URLs through and resolves
everything else — including protocol-relative `//host` and `data:` values —
against the API origin, so an image value cannot point the browser at an
unexpected origin.

## Tests

Playwright drives a real browser against a running API and dev server, which are
started separately — see the backend README for the full procedure. Both
repos must be running first.

```bash
npm run lint            # ESLint over src and e2e
npm run i18n:verify     # every t()/plural() call site resolves in both locales
npm run audit:contrast  # every text-on-fill pair clears 4.5:1 in dark mode
npm run test:e2e        # the whole suite
npm run test:e2e:report # open the last HTML report
```

Suites live in `e2e/`: `storefront`, `cart`, `reviews`, `admin`, and
`language`. The browser locale is pinned to `en-US` so the English assertions
stay deterministic; `language.spec.js` clears `localStorage` to control the
starting state.

The run writes to the seeded database, so raise the API's limits first — otherwise
catalogue and review reads start returning 429 partway through and the failures
look random:

```bash
# In the terminal running the API, not the one running Playwright.
RATE_LIMIT_WINDOW_MS=3600000 RATE_LIMIT_MAX=100000 REVIEW_SUBMIT_WINDOW_MS=600000 npm start
```

The default ceiling is 100 requests per 15 minutes, which a 41-test browser run
exceeds on its own. Setting these on the test runner has no effect: the API
process owns the counters, and it reads them per request.

Everything each run creates is tagged with a run id and removed afterwards,
including the copy the edit test renames a product to. If a run dies hard
midway, stray `E2E …-<runid>` rows can be deleted from the staff area.
