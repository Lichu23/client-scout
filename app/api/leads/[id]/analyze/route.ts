import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeLeadWithGroq } from "@/lib/services/ai-analyzer";
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  try {
    const result = await analyzeLeadWithGroq({ businessName: lead.businessName, businessType: lead.businessType, location: lead.location, website: lead.websiteUrl, instagram: lead.instagramUrl, hasBooking: lead.hasBooking, hasEcommerce: lead.hasEcommerce, opportunity: lead.opportunity });
    const updated = await db.lead.update({ where: { id }, data: { opportunity: result.opportunity, opportunityReason: result.reason, suggestedOffer: result.suggestedOffer, analysisConfidence: result.confidence, analysisEvidence: JSON.stringify(result.evidence) } });
    return NextResponse.json({ lead: updated, analysis: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Groq analysis failed." }, { status: 503 });
  }
}
