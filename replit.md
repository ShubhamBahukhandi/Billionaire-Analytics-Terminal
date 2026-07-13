# Billionaire Analytics Terminal

An AI-powered NSE/BSE stock analytics dashboard: search stocks, view AI/quality/health/growth/valuation/risk scores and buy/hold/avoid calls, track a watchlist and portfolio, and read market news.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml` — regenerate hooks/schemas after edits (see codegen command above)
- DB schema: `lib/db/src/schema/` (stocks, financialMetrics, news, watchlist, portfolioHoldings)
- API routes: `artifacts/api-server/src/routes/`
- Frontend app: `artifacts/billionaire-analytics-terminal/src/` (pages in `src/pages`, theme in `src/index.css`)

## Architecture decisions

- Built as a React + Vite + TypeScript SPA (this monorepo's `react-vite` artifact type) rather than literal Next.js, since Next.js isn't a supported artifact type here — same stack otherwise (React, TS, Tailwind, TanStack Query).
- Stock `change`/`changePercent` are derived at request time from `price`/`previousClose` rather than stored, so they never drift out of sync.
- Stock data is realistic seeded data (18 real NSE large-caps with financial metrics and news), not a live market feed — no live-data integration was requested/connected.

## Product

- Dashboard: top gainers/losers/most active, latest market news
- Stock detail: live price, Buy/Hold/Avoid call, AI conviction score, factor scores (business quality, financial health, growth, valuation, risk), financial metrics table, per-stock news, add-to-watchlist
- Watchlist: tracked stocks with live price/change/AI score, remove action
- Portfolio: holdings with quantity/avg buy price/current value/P&L, add/edit/delete, aggregate summary
- Market news feed with sentiment tags
- Global search (symbol or company name) with quick navigation to stock detail

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/api-spec/openapi.yaml`, always rerun the Orval codegen command before touching frontend/backend code that depends on the new types.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
