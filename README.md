# Client Scout

Client Scout is a local Next.js MVP for discovering a small number of potential clients through Google Places. This repository currently implements **Phase 1 (foundation)** and **Phase 2 (business search)** only.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
copy .env.example .env.local
# add GOOGLE_PLACES_API_KEY to .env.local
npm run db:push
npm run dev
```

Open http://localhost:3000/leads. Enter a business type, location, and limit, then run a search. Results are persisted in local SQLite. The Settings page shows whether server-side credentials are configured.

## Credentials

`GOOGLE_PLACES_API_KEY` is required for searches. Enable **Places API (New)** in Google Cloud and restrict the key to that API. `GROQ_API_KEY` is included in the environment contract for later phases but is not called in Phase 1–2.

Never use `NEXT_PUBLIC_` for either key, commit `.env.local`, or expose credentials in browser code. Google Places calls happen in the server route with an explicit field mask.

## Scope

Implemented: App Router dashboard, Tailwind-compatible styling, Prisma/SQLite models, environment validation, Google Places provider abstraction, validated search route, and persistence.

Not implemented yet: website/Instagram discovery, enrichment, scoring, Groq analysis, outreach, CRM workflows, and CSV export. These belong to later phases.
