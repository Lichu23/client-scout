import "server-only";
import { z } from "zod";
const schema = z.object({ GROQ_API_KEY: z.string().optional(), GOOGLE_PLACES_API_KEY: z.string().optional(), DATABASE_URL: z.string().default("file:./dev.db") });
export function getConfig() { return schema.parse({ GROQ_API_KEY: process.env.GROQ_API_KEY, GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY, DATABASE_URL: process.env.DATABASE_URL }); }
export function credentialStatus() { const c = getConfig(); return { groq: Boolean(c.GROQ_API_KEY), googlePlaces: Boolean(c.GOOGLE_PLACES_API_KEY), database: Boolean(c.DATABASE_URL) }; }
export function requireGooglePlacesKey() { const key = getConfig().GOOGLE_PLACES_API_KEY; if (!key) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local to search businesses."); return key; }
