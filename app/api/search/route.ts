import { NextResponse } from "next/server";
import { z } from "zod";
import { searchAndSaveBusinesses } from "@/lib/services/business-search";
const inputSchema=z.object({businessType:z.string().trim().min(2).max(100),location:z.string().trim().min(2).max(150),description:z.string().max(2000).optional().default(""),limit:z.coerce.number().int().min(1).max(20).default(10)});
export async function POST(request:Request){ try { const input=inputSchema.parse(await request.json()); const result=await searchAndSaveBusinesses(input); return NextResponse.json({searchId:result.search.id,leads:result.leads}); } catch(error){ const message=error instanceof z.ZodError ? "Enter a business type and location, with a limit between 1 and 20." : error instanceof Error ? error.message : "Search failed."; return NextResponse.json({error:message},{status:400}); } }
