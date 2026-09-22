# Client Scout

Client Scout is a local Next.js MVP for discovering and qualifying potential clients through public business data.

## Implemented phases

- **Phase 1 — Foundation:** Next.js App Router, TypeScript, Tailwind-compatible UI, Prisma, SQLite, environment validation, and server-side credential handling.
- **Phase 2 — Business search:** Google Places (New) text search with validated inputs, explicit field masks, and persisted search sessions.
- **Phase 3 — Enrichment:** bounded public website analysis, HTTPS/booking/contact/ecommerce/ordering/WhatsApp signals, and Instagram discovery from public website links.
- **Phase 4 — Scoring and AI:** deterministic lead scoring plus optional Groq analysis with confidence and FACT/INFERENCE/UNKNOWN evidence labels. Groq failures are reported explicitly; discovery and scoring continue without it.
- **Phase 5 — Outreach:** lead detail pages, status updates, outreach drafts, and copy-to-clipboard. Sending is always manual.
- **Phase 6 — CRM:** dashboard search-session cards, search history, all-leads filtering, lead detail navigation, statistics, and CSV export.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
copy .env.example .env.local
# add GOOGLE_PLACES_API_KEY and GROQ_API_KEY to .env.local
npm run db:push
npm run dev
```

Open http://localhost:3000. Use **Find Leads** to create a search, then review each gathered search as a dashboard card.

## Credentials

`GOOGLE_PLACES_API_KEY` is required for searches. Enable **Places API (New)** in Google Cloud and restrict the key to that API. `GROQ_API_KEY` enables AI analysis and outreach drafts but is optional for discovery, enrichment, and deterministic scoring.

Never use `NEXT_PUBLIC_` for either key, commit `.env.local`, or expose credentials in browser code. Google Places and Groq calls run server-side.

## Known limitations

- Google Places results and public website signals are not guaranteed to be complete or current.
- Instagram discovery is limited to links published on a business website; the app does not scrape Instagram or send automated messages.
- AI analysis requires a working Groq key and provider availability. A failed AI request is shown as an error and does not overwrite existing analysis.
- SQLite is intended for local/single-user use; production deployments need a managed database and deployment-specific secret storage.
- Search limits currently follow the Google Places request cap (up to 20 results per search).

