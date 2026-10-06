# AGENTS — A to Z Kids World storefront

React 19 + Vite 8 storefront. Visitors browse the catalogue and order over WhatsApp;
there is no shopper account and no client-side checkout that writes orders. A
separate, unlinked staff area lives at `/admin/login`.

## Stack

- React 19, React Router 8, Tailwind v4, TanStack Query 5, Axios 1.x, Vite 8.
- ESM (`"type": "module"`). Source is plain JS/JSX; no TypeScript, so there is no
  `typecheck` script — `lint` is the static gate.

## Ports & proxies

- Dev server: `http://localhost:5173`.
- Vite proxies `/api` to the API at `http://localhost:3000` and **strips the `/api`
  prefix** (the API mounts resources at `/products`, `/uploads`, ...). Override with
  `VITE_API_PROXY_TARGET`.

## Commands

| Command                   | What                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `npm run dev`             | Vite dev server on :5173.                                     |
| `npm run build`           | Production bundle → `dist/`.                                  |
| `npm run lint`            | ESLint over `src` and `e2e`.                                  |
| `npm run audit:contrast`  | Fails if any dark-mode text-on-fill pair < 4.5:1.             |
| `npm run i18n:verify`     | Every `t()`/`plural()` call site resolves in en + bn.         |
| `npm run preview`         | Serve `dist/` locally.                                        |
| `npm run test:e2e`        | Playwright (`e2e/`), 1 worker, `locale: en-US`, no webServer. |
| `npm run test:e2e:report` | Open the last HTML report.                                    |

## Run the test suite

Both the API and the dev server must be running first (see the backend AGENTS.md).
The browser run makes far more requests than the default rate budget allows, so
start the API with raised limits — otherwise reads start returning `429` mid-run and
the failures look random:

```bash
# In the API terminal, NOT the Playwright terminal.
RATE_LIMIT_WINDOW_MS=3600000 RATE_LIMIT_MAX=100000 \
REVIEW_SUBMIT_WINDOW_MS=600000 npm start
```

Then: `npm run dev` (separate terminal) && `npm run test:e2e`.

## Layout (after the context reorg)

```
src/
  context/auth/     session token + admin-gated auth provider
  context/cart/     basket context + hooks (localStorage)
  context/catalog/  product/category catalogue provider + hooks
  context/language/ en/Bn i18n (LanguageProvider, useLanguage)
  context/query/    TanStack Query provider + defaults
  context/theme/    dark-mode class toggle
  hooks/            per-resource query/mutation hooks
  lib/              axios client, cache keys, formatting helpers
  layout/           site Layout (wraps Routes)
  Pages/{Home,Shop,Checkout,Admin,SitePages}/
  Shared/           navbar, footer, cart drawer, cart notice
```

The catalogue, auth, and cart moved from `src/Shared` and `src/Layouts` into
`src/context/*`. The staff area and the public components (navbar/footer/cart drawer)
stay in their original homes.

## Conventions that affect code changes

- Admin copy is English-only and lives outside `Layout`. Only the public customer
  surface is translated English/Bangla.
- `ALL_TOYS = "All toys"` in `src/lib/catalog.js` is a comparison sentinel — never
  compare against a translated label.
- `src/Pages/Home/sections/ProductModal.jsx` keeps the non-standard
  `md:h-107.5` Tailwind change (intentional).
- Dark mode is a token swap (`src/index.css` ramps + role/fill tokens); don't add
  ad-hoc `dark:` overrides. Run `npm run audit:contrast` after touching colours.

See `README.md` for the full design notes (data loading, theming, cart, language,
checkout, staff area, session handling).
