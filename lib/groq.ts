import "server-only";
import Groq from "groq-sdk";
import { getConfig } from "./config";
export function getGroqClient() { const key=getConfig().GROQ_API_KEY; if (!key) throw new Error("Missing GROQ_API_KEY. Add it to .env.local."); return new Groq({apiKey:key}); }
