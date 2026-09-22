# Client Scout — Project Status

Client Scout is a local lead-discovery and lightweight CRM application. This document records what is implemented today and what remains before the product is considered complete.

## Current status

| Area | Status | Notes |
|------|--------|-------|
| Foundation | Complete | Next.js, TypeScript, Tailwind, Prisma, SQLite, environment validation |
| Business discovery | Complete | Google Places (New), server-side API key, persisted searches and leads |
| Enrichment | Complete | Public website analysis and compliant Instagram discovery from website links |
| Scoring and opportunities | Complete | Deterministic scoring plus optional Groq analysis |
| Outreach | Complete | Draft generation, copy action, status updates, manual sending only |
| CRM workflow | Complete | Dashboard, search-run cards, All Leads view, filters, CSV export |

## Implemented phases

### Phase 1 — Foundation

- Next.js App Router and TypeScript
- Tailwind-based SaaS dashboard shell
- Prisma ORM with SQLite
- Server-side configuration validation
- `.env.example` and local credential support
- Dashboard, settings, and navigation

### Phase 2 — Business search

- Business type, location, description, and lead-count search form
- Google Places API (New) integration
- Explicit Google field mask to limit unnecessary billing
- Search and lead persistence
- Search progress feedback
- Support for 5, 10, 20, and 50 requested leads

### Phase 3 — Enrichment

- Public website analysis
- HTTPS, booking, appointment, contact-form, ecommerce, ordering, and WhatsApp detection
- Instagram discovery from public website links only
- SSRF protection, redirect limits, timeouts, and response-size limits
- Duplicate matching by Google Place ID, domain, Instagram username, and business/location
- Search appearance tracking so deduplicated leads remain visible in each search run

### Phase 4 — Scoring and AI analysis

- Deterministic lead scoring from 0–100
- Opportunity detection for website, booking, ecommerce, ordering, CRM, and other gaps
- Score reasons stored with each lead
- Optional Groq analysis
- Structured AI evidence: `FACT`, `INFERENCE`, or `UNKNOWN`
- Explicit API errors when Groq is unavailable or returns invalid output

### Phase 5 — Outreach and lead details

- Lead detail page
- Detected-information badges
- Phone, source, enrichment status, score, opportunity, and suggested offer
- AI confidence and evidence display
- Regenerate analysis
- Generate/regenerate outreach draft
- Copy draft action
- Lead status changes
- Manual-only outreach; no automated Instagram messaging

### Phase 6 — CRM workflow

- Dashboard KPI cards
- Dashboard cards grouped by search run
- Entire search cards are clickable
- All Leads view with search and status filtering
- Inline lead status updates
- Search result and lead detail navigation
- CSV export
- Core scoring tests

## Remaining work

### High priority

- Add stronger automated integration tests for API routes, persistence, deduplication, and search appearances.
- Improve duplicate conflict handling when two records claim different Google Place IDs.
- Add a user-facing retry/error state for website enrichment failures.
- Add pagination or virtualized rendering for very large All Leads datasets.

### Product improvements

- Add additional compliant Instagram discovery sources without scraping or authentication.
- Add richer dashboard analytics, such as opportunity distribution and search-run trends.
- Add bulk lead actions and saved filters.
- Add a dedicated reusable component system using shadcn/ui and Lucide icons.

### Operational improvements

- Add CI checks for typecheck, tests, Prisma schema synchronization, and production builds.
- Resolve the Windows Prisma query-engine lock before running `npm run build` while a development server is active; stop `npm run dev` first.
- Review and remediate npm audit findings without using uncontrolled breaking upgrades.

## Verification commands

```powershell
npm install
npm run db:push
npm run typecheck
npm test
npm run build
```

If Prisma reports a Windows query-engine lock, stop the development server and rerun `npm run db:push` or `npm run build`.

## Scope boundaries

- The application uses public business information only.
- It does not log into Instagram, bypass CAPTCHA, circumvent rate limits, or send messages automatically.
- Groq is optional for discovery; basic search and deterministic scoring must remain usable without it.
