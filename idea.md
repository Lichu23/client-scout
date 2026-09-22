# Business Lead Finder

## 1. Goal

Build a local web application that helps find potential software-development clients.

The user describes the type of business they want to target.

Example:

```text
Business type: Barbershops
Location: Zaragoza, Spain
Number of leads: 10

Requirements:
- Has an Instagram account
- Active business
- Prefer businesses without online booking
- Prefer businesses without a modern website
- Prefer businesses that appear to manage appointments manually
```

The application should:

```text
Describe target businesses
        ↓
Discover businesses
        ↓
Find website + Instagram
        ↓
Analyze public information
        ↓
Identify possible software opportunities
        ↓
Score the lead
        ↓
Generate a personalized outreach message
        ↓
User contacts the business manually
```

The application does **not** automatically send Instagram messages.

The goal is to discover a small number of high-quality potential clients rather than collect thousands of random accounts.

---

# 2. Tech Stack

## Full-stack framework

Use:

```text
Next.js
TypeScript
App Router
```

Use Next.js for both:

* Frontend
* Server-side logic
* API routes / Route Handlers

Do not create a separate Python/FastAPI backend for the MVP.

---

## Frontend

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide Icons
```

Use shadcn/ui components whenever appropriate.

Examples:

```text
Button
Card
Input
Textarea
Select
Table
Badge
Dialog
Dropdown Menu
Tabs
Sheet
Skeleton
Alert
Tooltip
Progress
```

The interface should look like a modern SaaS dashboard.

Keep it:

* Simple
* Clean
* Responsive
* Fast
* Minimal

Avoid unnecessary animations.

---

# 3. AI Provider

Use the **Groq API**.

Install:

```bash
npm install groq-sdk
```

Environment variable:

```env
GROQ_API_KEY=
```

Create a reusable server-side Groq client.

Example architecture:

```text
lib/
  groq.ts
```

Never expose the Groq API key to the browser.

All Groq requests must happen server-side.

Use Groq for:

* Lead analysis
* Opportunity identification
* Business analysis
* Personalized outreach generation
* Summarizing why a lead may be interesting

The application must still be usable without Groq for basic business discovery.

---

# 4. Business Discovery

For the MVP, use:

```text
Google Places API (New)
```

Use Google Places primarily to discover businesses.

Example search:

```text
barbershops in Zaragoza Spain
```

Google Places should provide information such as:

```text
Business name
Address
Category
Google Place ID
Website when available
Phone when available
Google Maps URL when available
```

Create:

```text
lib/providers/google-places.ts
```

Do not tightly couple the rest of the application to Google.

Create an abstraction such as:

```typescript
interface BusinessSearchProvider {
  search(params: {
    businessType: string;
    location: string;
    limit: number;
  }): Promise<Business[]>;
}
```

This will allow adding other providers later.

---

# 5. Instagram Discovery

After discovering businesses, try to identify their public Instagram profile.

Possible sources:

1. Business website social links
2. Search-engine results
3. Public business information
4. Public metadata available from providers

The system should NOT:

* Log into Instagram automatically
* Bypass CAPTCHA
* Circumvent rate limits
* Automatically send Instagram DMs
* Use private Instagram APIs

Store:

```text
instagramUsername
instagramUrl
instagramFound
```

Example:

```text
@examplebarber
https://instagram.com/examplebarber
```

Instagram discovery should be its own service:

```text
lib/services/instagram-discovery.ts
```

So the implementation can be changed later without affecting the rest of the application.

---

# 6. Main Search Interface

Create a dashboard page:

```text
/leads
```

The main component should contain:

### Business Type

Example:

```text
Barbershops
Restaurants
Gyms
Dentists
Retail stores
Real estate agencies
Car dealerships
Hotels
```

Allow custom values.

### Location

Example:

```text
Zaragoza, Spain
```

### Number of Leads

Default:

```text
10
```

Allow something like:

```text
5
10
20
50
```

### Target Description

Large textarea.

Example:

```text
I'm looking for independent barbershops.

Prefer businesses that:

- are active on Instagram
- don't have online booking
- don't have a modern website
- appear to manage appointments manually
```

Main button:

```text
Find Leads
```

---

# 7. Search Process

When the user presses:

```text
Find Leads
```

Run approximately:

```text
1. Search Google Places
2. Normalize business information
3. Check website
4. Search for Instagram
5. Analyze website
6. Detect software opportunities
7. Calculate lead score
8. Save lead
9. Display results
```

Show progress in the UI.

Example:

```text
Finding businesses...

7 / 10 businesses analyzed
```

Use shadcn components such as:

```text
Progress
Skeleton
Card
Badge
```

---

# 8. Website Analysis

If the business has a website, perform lightweight analysis.

Check:

```text
Has website?
Has HTTPS?
Has booking functionality?
Has contact form?
Has ecommerce?
Has online ordering?
Has WhatsApp link?
Has appointment functionality?
Has obvious social links?
```

Only inspect publicly accessible pages.

Do not perform security testing or attempt to access protected resources.

---

# 9. Opportunity Detection

Detect potential software opportunities.

Examples:

## No website

Potential opportunity:

```text
Business website
```

## No online booking

Potential opportunity:

```text
Booking system
```

## Restaurant without online ordering

Potential opportunity:

```text
Online ordering
```

## Retail store without ecommerce

Potential opportunity:

```text
Ecommerce store
```

## Manual customer management

Potential opportunity:

```text
CRM / customer management
```

## Repetitive manual workflow

Potential opportunity:

```text
Business automation
```

Supported opportunity categories:

```typescript
type Opportunity =
  | "website"
  | "booking_system"
  | "ecommerce"
  | "online_ordering"
  | "crm"
  | "automation"
  | "customer_portal"
  | "other";
```

---

# 10. Lead Scoring

Give each business a score:

```text
0–100
```

The score represents how closely the business matches the user's requested target.

Do NOT ask the LLM to arbitrarily produce the complete score.

Use deterministic scoring rules.

Example:

```text
Correct business category       +20
Correct location                +10
Instagram found                 +10
Website missing                 +15
Booking system missing          +15
Clear software opportunity      +20
Matches custom criteria         +10
```

Example result:

```text
Lead Score: 87/100

Reasons:

+ Correct business type
+ Instagram found
+ No booking system detected
+ Potential booking opportunity
```

Store both:

```text
leadScore
scoreReasons
```

---

# 11. Groq AI Analysis

After factual information has been collected, send structured information to Groq.

Example:

```json
{
  "businessName": "Example Barber",
  "businessType": "Barbershop",
  "location": "Zaragoza",
  "website": "https://example.com",
  "instagram": "https://instagram.com/examplebarber",
  "hasBooking": false,
  "hasEcommerce": false,
  "targetDescription": "Independent barbershops without online booking"
}
```

Ask Groq to return structured JSON.

Example:

```json
{
  "opportunity": "booking_system",
  "reason": "No online appointment functionality was found.",
  "suggestedOffer": "A simple mobile-friendly booking system where customers can select a service and available time.",
  "confidence": "medium"
}
```

The model must distinguish:

```text
FACT
INFERENCE
UNKNOWN
```

Never invent information about a business.

Use language such as:

```text
Potential opportunity
Appears to...
Could benefit from...
No booking system was found
```

Avoid claiming:

```text
They definitely need...
Their website is bad...
They are losing customers...
```

unless there is actual evidence supporting the statement.

---

# 12. Outreach Message Generator

Each lead should have:

```text
Generate Message
```

When clicked, send the lead information and detected opportunity to Groq.

Generate a short personalized message.

Example:

```text
Hey! I came across Example Barber while looking at local barbershops in Zaragoza.

I noticed I couldn't find an online booking option.

I'm a software developer and build simple booking systems that let customers choose a service and available time without arranging everything through messages.

Would something like that be useful for your business?
```

Messages should:

* Be short
* Sound human
* Mention something specific
* Explain the value
* Avoid aggressive sales language
* Avoid pretending we know something we don't
* Not invent problems
* Not be generic spam

Provide:

```text
Copy Message
Open Instagram
```

The user manually sends the message.

---

# 13. Dashboard

Create a SaaS-style dashboard.

Sidebar:

```text
Dashboard
Find Leads
All Leads
Search History
Settings
```

Top area:

```text
Total Leads
New Leads
Contacted
Replies
Clients
```

Main lead table:

| Score | Business | Instagram | Website | Opportunity | Status    |
| ----- | -------- | --------- | ------- | ----------- | --------- |
| 92    | Barber A | @barbera  | Website | Booking     | New       |
| 85    | Barber B | @barberb  | None    | Website     | New       |
| 78    | Barber C | @barberc  | Website | Automation  | Contacted |

Use shadcn:

```text
Table
Badge
Button
DropdownMenu
Card
```

---

# 14. Lead Detail Page

Route:

```text
/leads/[id]
```

Show:

```text
Business Name

Category
Location

Instagram
Website
Google Maps
Source

Lead Score
```

Then:

```text
Detected Information

✓ Instagram found
✓ Website found
✗ Booking system not found
```

Then:

```text
Potential Opportunity

Online Booking System
```

Explanation:

```text
No online appointment functionality was detected on the public website.
```

Suggested software:

```text
Simple booking page allowing customers to select:

- service
- employee
- date
- available time
```

Then:

```text
Generated Outreach Message

[ message ]
```

Actions:

```text
Copy Message
Regenerate
Open Instagram
Open Website
```

Status:

```text
New
Contacted
Replied
Interested
Not Interested
Client
```

---

# 15. Database

For the local MVP, use:

```text
SQLite
```

Use:

```text
Prisma ORM
```

Install:

```bash
npm install prisma @prisma/client
npx prisma init
```

Database:

```env
DATABASE_URL="file:./dev.db"
```

Main models:

```text
Search
Lead
OutreachMessage
```

---

# 16. Search Model

Fields:

```text
id
businessType
location
description
requestedLeads
createdAt
```

---

# 17. Lead Model

Fields:

```text
id
searchId

businessName
businessType
location

googlePlaceId
googleMapsUrl

websiteUrl
instagramUrl
instagramUsername

hasWebsite
hasInstagram
hasBooking
hasEcommerce

opportunity
opportunityReason

leadScore
scoreReasons

status

createdAt
updatedAt
```

---

# 18. Outreach Message Model

Fields:

```text
id
leadId
message
createdAt
```

---

# 19. Lead Status

Use:

```typescript
enum LeadStatus {
  NEW
  CONTACTED
  REPLIED
  INTERESTED
  NOT_INTERESTED
  CLIENT
}
```

---

# 20. Duplicate Detection

Do not repeatedly create the same lead.

Detect duplicates using, in order:

```text
Google Place ID
Instagram username
Website domain
Business name + location
```

If the business already exists, update it instead of inserting another copy.

---

# 21. CSV Export

Allow leads to be exported.

Fields:

```text
businessName
businessType
location
instagram
website
opportunity
leadScore
status
```

Button:

```text
Export CSV
```

---

# 22. Project Structure

Use approximately:

```text
business-lead-finder/

├── app/
│   ├── api/
│   │   ├── leads/
│   │   ├── search/
│   │   └── ai/
│   │
│   ├── leads/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── searches/
│   │   └── page.tsx
│   │
│   ├── settings/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── leads/
│   └── search/
│
├── lib/
│   ├── db.ts
│   ├── groq.ts
│   │
│   ├── providers/
│   │   └── google-places.ts
│   │
│   ├── services/
│   │   ├── business-search.ts
│   │   ├── instagram-discovery.ts
│   │   ├── website-analyzer.ts
│   │   ├── lead-scorer.ts
│   │   └── ai-analyzer.ts
│   │
│   └── types/
│
├── prisma/
│   └── schema.prisma
│
├── public/
├── .env.example
├── .env.local
├── .gitignore
├── components.json
├── package.json
├── README.md
└── tsconfig.json
```

---

# 23. Credentials Required

The application should initially require only **two external credentials**.

```text
GROQ_API_KEY
GOOGLE_PLACES_API_KEY
```

SQLite does not require credentials.

Next.js does not require credentials when running locally.

shadcn/ui does not require an API key.

---

# 24. Groq API Credential

Required environment variable:

```env
GROQ_API_KEY=
```

## How to get it

1. Go to the GroqCloud Console.
2. Create or log into your Groq account.
3. Open the API Keys section.
4. Create a new API key.
5. Copy the key.
6. Add it to `.env.local`.

Example:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx
```

Never commit this key.

Never expose it using:

```text
NEXT_PUBLIC_GROQ_API_KEY
```

The key must only be accessible server-side.

---

# 25. Google Places Credential

Required:

```env
GOOGLE_PLACES_API_KEY=
```

## How to get it

1. Create/log into a Google Cloud account.
2. Create a Google Cloud project.
3. Configure billing for the project.
4. Open the Google Maps Platform APIs.
5. Enable:

```text
Places API (New)
```

6. Go to:

```text
APIs & Services
→ Credentials
```

7. Create an API key.
8. Restrict the key to the APIs needed by this application.
9. Add it to `.env.local`.

Example:

```env
GOOGLE_PLACES_API_KEY=xxxxxxxxxxxxxxxx
```

The application should call Google Places from the Next.js server, not directly from browser components.

Do not expose the key as:

```text
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
```

---

# 26. Environment File

Create:

```text
.env.example
```

containing:

```env
# AI
GROQ_API_KEY=

# Business discovery
GOOGLE_PLACES_API_KEY=

# Database
DATABASE_URL="file:./dev.db"
```

The real file:

```text
.env.local
```

should contain the actual secrets.

Make sure `.gitignore` includes:

```text
.env
.env.local
.env*.local
```

---

# 27. Credentials Validation

Create a server-side configuration validator.

When the application starts or an API requiring a credential is called, check whether the credential exists.

Example errors:

```text
Missing GROQ_API_KEY.

Add GROQ_API_KEY to .env.local.
```

or:

```text
Missing GOOGLE_PLACES_API_KEY.

Business discovery cannot run until the Google Places API key is configured.
```

Never print the actual secret in logs.

---

# 28. Settings Page

Create:

```text
/settings
```

Display configuration status:

```text
Groq API
✓ Configured

Google Places
✓ Configured

Database
✓ Connected
```

If something is missing:

```text
Google Places
⚠ API key missing
```

Do NOT display the API key itself.

---

# 29. Security

Secrets must only exist server-side.

Never expose credentials through:

```text
NEXT_PUBLIC_*
client components
browser JavaScript
API responses
logs
Git
```

All external API calls requiring secrets should happen through:

```text
Server Components
Server Actions
Route Handlers
server-only libraries
```

as appropriate.

---

# 30. MVP Development Plan

Do not build everything simultaneously.

## Phase 1 — Foundation

Build:

```text
Next.js project
Tailwind
shadcn/ui
Prisma
SQLite
Dashboard layout
Environment validation
```

Then verify the app runs.

---

## Phase 2 — Business Search

Build:

```text
Search form
        ↓
Google Places API
        ↓
Normalize businesses
        ↓
Store businesses in SQLite
        ↓
Display leads
```

Goal:

```text
Business type: Barbershop
Location: Zaragoza
Limit: 10
```

should return approximately 10 businesses.

---

## Phase 3 — Enrichment

Add:

```text
Website discovery
Instagram discovery
Website analysis
Duplicate detection
```

---

## Phase 4 — Opportunity Detection

Add:

```text
Deterministic lead scoring
Opportunity detection
Groq analysis
```

---

## Phase 5 — Outreach

Add:

```text
Generate personalized message
Copy message
Open Instagram
Open website
Change lead status
```

---

## Phase 6 — CRM

Add:

```text
Search history
Lead filtering
Lead statuses
Dashboard statistics
CSV export
```

---

# 31. Important Principles

Prioritize:

```text
QUALITY > QUANTITY
```

The application should NOT be designed to:

```text
Find 10,000 accounts
        ↓
Generate generic messages
        ↓
Spam everyone
```

It should be designed to:

```text
Find 10 businesses
        ↓
Collect useful public information
        ↓
Understand each business
        ↓
Identify a genuine potential software opportunity
        ↓
Generate a relevant personalized message
        ↓
User reviews it
        ↓
User contacts the business
```

---

# 32. Definition of Done — MVP

The MVP is complete when the user can:

1. Run the application locally.
2. Open the Next.js interface.
3. Enter a business type.
4. Enter a location.
5. Describe the ideal business.
6. Request approximately 10 leads.
7. Search using Google Places.
8. See the discovered businesses.
9. See their websites when available.
10. See their Instagram accounts when discovered.
11. Store leads in SQLite.
12. Avoid duplicate businesses.
13. Analyze basic website capabilities.
14. Calculate a lead score.
15. Identify a potential software opportunity.
16. Generate an outreach message using Groq.
17. Copy the generated message.
18. Open the business's Instagram.
19. Mark the business as contacted.
20. Export leads to CSV.

---

# 33. Instructions for Codex

Start by implementing **Phase 1 and Phase 2 only**.

Before writing significant code:

1. Read this entire specification.
2. Create a concise implementation plan.
3. Check which credentials are currently available in `.env.local`.
4. Create `.env.example`.
5. Never invent API keys.
6. Never hardcode credentials.
7. Ask the user for a credential only when it is actually needed.
8. Do not introduce paid third-party services without asking first.
9. Prefer official APIs over scraping.
10. Keep external providers behind interfaces so they can be replaced later.

Use:

```text
Next.js
TypeScript
App Router
Tailwind CSS
shadcn/ui
Prisma
SQLite
Google Places API (New)
Groq API
```

Once Phase 1 and Phase 2 work reliably, stop and report:

```text
What was implemented
How to run it
Which credentials are configured/missing
What should be implemented in Phase 3
```

Do not continue into later phases until requested.
