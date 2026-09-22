import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const lead = await db.lead.findUnique({ where: { id }, include: { outreachMessages: { orderBy: { createdAt: "desc" } } } }); return lead ? NextResponse.json({ lead }) : NextResponse.json({ error: "Lead not found." }, { status: 404 }); }
