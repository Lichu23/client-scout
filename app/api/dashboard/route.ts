import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() { const [total, grouped, searches] = await Promise.all([db.lead.count(), db.lead.groupBy({ by: ["status"], _count: { _all: true } }), db.search.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { leads: true } } }, take: 20 })]); return NextResponse.json({ total, statuses: Object.fromEntries(grouped.map(g => [g.status, g._count._all])), searches }); }
