# Clinic Stock Console

A modern React + TypeScript application for managing stock inventory in a clinical setting.

## Setup & Scripts

### Installation

```bash
npm install
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server (Vite) |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check if code is formatted correctly |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (v4, CSS-first configuration)
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + RTK Query
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Code Quality**:
  - ESLint with TypeScript support
  - Prettier for code formatting
  - husky + commitlint for commit message validation
- **CI/CD**: GitHub Actions

### Project Structure

```
src/
├── app/              # Redux store, hooks, and configuration
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── layout/      # Layout components
├── features/        # Redux feature slices (auth, stock)
├── hooks/            # Shared hooks (network status, slow-network simulation)
├── lib/             # Utility functions
├── pages/           # Page components for routes
├── tests/           # Test files
├── types/           # TypeScript type definitions
├── router.tsx       # React Router configuration
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

### Commit Message Convention

This project uses Conventional Commits enforced via commitlint. Commit messages must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`

Example:
```
feat(auth): add login page

Implemented login form with email and password validation.

Fixes #123
```

---

## Design

### 1. Component breakdown & screen division

The app is split into three layers, each with a distinct responsibility:

- **`components/ui/`** — shadcn/ui primitives only (Radix-based: `Dialog`, `Select`, `Switch`, `DropdownMenu`, `Avatar`, `Table`, `Badge`, `Skeleton`, `Button`, `Label`). Nothing here knows about stock, auth, or any domain concept — purely reusable, accessible building blocks.
- **`components/layout/`** — app shell, decomposed by concern rather than left as one large file:
  - `AppLayout` — composition root; owns session bootstrapping (`useGetMeQuery`) and network status.
  - `AppHeader` → `BrandLink`, `ConnectivityIndicator`, `UserMenu` — each a focused, prop-driven presentational component.
  - `NetworkStatusBanner`, `AppFooter` — surface real `navigator.onLine` status (no fake-offline simulation; see `useNetworkStatus`).
- **`features/stock/`** and **`features/auth/`** — domain logic. Pages (`StockListPage`, `ItemDetailPage`) are containers that own data-fetching and URL-state wiring; everything under `features/stock/components/` (`SearchBox`, `CategoryFilter`, `SortControl`, `StockTable`, `PaginationControls`, `StockEditDialog`, `StockCorrectionForm`, `QueryErrorState`, `EmptyState`) is presentational, receiving state and callbacks as props.

The stock list screen specifically divides into: a toolbar row (search + category filter + sort dropdown + force-error switch), a data region that swaps between skeleton/error/empty/table states via `AnimatePresence`, and pagination below the table. The table's column headers double as sort controls (icon-driven, three-state cycle: ascending → descending → default), so sorting is available both via the header icons and the `SortControl` dropdown — two views onto the same state, always in sync.

### 2. Where state lives, and why

| State | Lives in | Why |
|---|---|---|
| Product list, product detail, categories, current user | RTK Query cache (`stockApi`, `authApi`) | Server data — has its own lifecycle (loading/error/staleness) that RTK Query already models correctly. Mirroring it into a Redux slice would create a second source of truth that can drift from the server. |
| Search, category, sort field/order, page, page size, force-error toggle | URL (`useSearchParams`, via `useStockListQueryParams`) | This is the actual requirement driver: reloading the browser or opening a copied link must restore the exact same view. Only the URL survives a reload and a copy-paste to another machine — Redux or component state do not. `skip` is derived (`(page - 1) * limit`), never stored separately, so it can't drift from `page`/`limit`. |
| Access token, refresh token, expiry, current user | Redux (`authSlice`) | Session state needs to be read from outside React components (the RTK Query `baseQuery` reauth logic in `baseQueryWithReauth` reads it via `getState()`), which rules out component state. It's also genuinely global or app-wide, unlike page-scoped filters. |
| Dialog open/closed, which item is being edited, real-time network status, slow-network simulation toggle | Local component state / small external stores (`useState` in `StockTable`; `useSyncExternalStore` for `useNetworkStatus` and `useSlowNetworkSimulation`) | Ephemeral UI state that doesn't need to survive a reload or be shareable. The dialog's `item` is deliberately *not* cleared on close, only `open` toggles, so Radix's exit animation has content to animate against. |

### 3. Fetch, cache, and invalidation

All data access goes through RTK Query (`stockApi`, `authApi`), using a shared `baseQueryWithReauth` on top of `fetchBaseQuery`:

- **Auth header injection** via `prepareHeaders`, reading the access token from `authSlice`.
- **Automatic reauth on 401**: a mutex (`refreshInFlight`) ensures concurrent 401s trigger exactly one `/auth/refresh` call, not one per failed request; the original request is retried once after a successful refresh. `/auth/login` and `/auth/refresh` themselves are excluded from triggering reauth (via exact-path matching, not substring, to avoid false positives on unrelated future routes).
- **Optimistic updates for stock correction**: `updateStock` uses RTK Query's `onQueryStarted` pattern — the cache is updated immediately on submit, rolled back on failure, and left in place on success (since DummyJSON's `PUT` doesn't actually persist server-side — refetching after a successful mutation would silently discard the correction, so the app deliberately trusts the optimistic value for the session rather than refetching).
- **Delay/slow-network testing**: a runtime toggle (`useSlowNetworkSimulation`, backed by `sessionStorage` so it survives reload) injects `?delay=2000` into every request via `getDefaultDelayMs()`, used to manually verify the search race-condition guard and loading states without editing environment variables.
- **Search race-condition safety**: search is debounced client-side and RTK Query's per-argument cache keys mean an out-of-order (slow, then fast) response pair never overwrites a fresher query's result with a stale one.

### 4. Layout, spacing, colour, typography

Design tokens, not library defaults — the theme in `src/index.css` overrides shadcn's generated neutral/grayscale palette with a custom brand set defined as CSS custom properties (`--color-primary: #0f6c7a`, a teal, plus matching `background`/`card`/`accent`/`destructive` tokens), layered on top of Tailwind v4's CSS-first `@theme`/`@theme inline` configuration rather than a legacy `tailwind.config.js` theme object. Dark-mode tokens exist (`.dark` block) but are not currently wired to a toggle — `darkMode` should be set to `class` (not the default `media`) before shipping dark mode, otherwise it silently activates based on OS preference rather than an explicit user choice.

Typography uses Geist Variable (`@fontsource-variable/geist`) as the primary sans font, with a system-font fallback stack. Spacing and radius follow shadcn's default scale (`--radius` token, scaled into `sm`/`md`/`lg`/`xl` variants), left at library defaults rather than customized, since the brief didn't call for a bespoke spacing system.

### 5. Accessibility

- **Keyboard-first table interaction**: row click-to-navigate is a mouse-only convenience (`onClick` on `motion.tr`) — it does not change the row's ARIA role or tab order. Keyboard and screen-reader users navigate via the item name `Link` (already focusable, accessible name from its text) and a separate icon `Button` for editing; both have `event.stopPropagation()` so they don't double-fire the row's navigation.
- **Correct ARIA semantics for sortable columns**: `aria-sort` (`none`/`ascending`/`descending`) is set on `<TableHead>` per the ARIA spec, not on the inner button; each sort button has a computed `aria-label` describing both the action and current state.
- **Toggle semantics**: the force-error `Switch` and slow-network toggle both use `aria-pressed`/native `Switch` semantics rather than a plain button pretending to be a toggle.
- **Focus rings preserved**: `focus-visible:ring-2 focus-visible:ring-ring` is applied consistently across custom interactive elements rather than relying on (or stripping) browser defaults.
- **Icon-only buttons** (pagination prev/next/page numbers, edit button, connectivity toggle) all carry explicit `aria-label`s since they have no visible text.
- **Reduced-motion**: Framer Motion transitions are kept subtle (opacity/short duration) by default; a `prefers-reduced-motion` check is applied where animation is decorative rather than state-communicating.
- Not yet independently verified: full 360px layout audit and an end-to-end keyboard-only pass across every screen — flagged as a to-do rather than claimed as complete.

## Hooks

| Hook | Purpose |
|---|---|
| `useStockListQueryParams` | Single source of truth for stock list search/category/sort/page/limit/forceError, synced to the URL |
| `useNetworkStatus` | Real browser connectivity + Network Information API details (`effectiveType`, `downlink`, `rtt`), with `online`/`offline`/`connection.change` listeners |
| `useSlowNetworkSimulation` | Toggleable request-delay simulation for manually testing loading states and the search race-condition guard, backed by `sessionStorage` |

---

## Configuration Files

- `.editorconfig` - Editor settings for consistent code style
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier formatting rules
- `commitlint.config.js` - Conventional Commits configuration
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript compiler options (strict mode enabled; path aliases declared in both the root and app configs — see note below)
- `components.json` - shadcn/ui CLI configuration (aliases, Tailwind paths, icon library)
- `src/index.css` - Tailwind v4 CSS-first theme configuration (design tokens, base layer)
- `vitest.config.ts` - Vitest testing configuration
- `.github/workflows/ci.yml` - GitHub Actions CI pipeline

> Note: the shadcn CLI resolves path aliases from the **root** `tsconfig.json`, not from `tsconfig.app.json` alone — both files declare the `@/*` alias to keep CLI tooling and the actual TypeScript build in agreement.