import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { searchAndSaveBusinesses } from "@/lib/services/business-search";
const inputSchema=z.object({businessType:z.string().trim().min(2).max(100),location:z.string().trim().min(2).max(150),description:z.string().max(2000).optional().default(""),limit:z.coerce.number().int().min(1).max(50).default(10)});
export async function GET(request:Request){
  const searchId = new URL(request.url).searchParams.get("searchId");
  if (!searchId) return NextResponse.json({error:"A search id is required."},{status:400});
  const search = await db.search.findUnique({
    where:{id:searchId},
    include:{leads:{orderBy:{createdAt:"asc"}},appearances:{orderBy:{createdAt:"asc"},include:{lead:true}}},
  });
  if (!search) return NextResponse.json({error:"Search not found."},{status:404});
  const appearanceLeads = search.appearances.map((appearance)=>appearance.lead);
  const leads = [...appearanceLeads, ...search.leads.filter((lead)=>!appearanceLeads.some((item)=>item.id===lead.id))];
  return NextResponse.json({search,leads});
}
export async function POST(request:Request){ try { const input=inputSchema.parse(await request.json()); const result=await searchAndSaveBusinesses(input); return NextResponse.json({searchId:result.search.id,leads:result.leads}); } catch(error){ const message=error instanceof z.ZodError ? "Enter a business type and location, with a limit between 1 and 50." : error instanceof Error ? error.message : "Search failed."; return NextResponse.json({error:message},{status:400}); } }
