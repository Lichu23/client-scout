import Link from "next/link";
import { db } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function Dashboard() {
  const [total, newCount, contacted, replied, clients, recentLeads] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { status: "CONTACTED" } }),
    db.lead.count({ where: { status: "REPLIED" } }),
    db.lead.count({ where: { status: "CLIENT" } }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: {
      id: true, businessName: true, businessType: true, location: true, websiteUrl: true,
      instagramUrl: true, opportunity: true, leadScore: true, status: true, createdAt: true,
    } }),
  ]);
  const cards = [["Total leads", total], ["New", newCount], ["Contacted", contacted], ["Replies", replied], ["Clients", clients]] as const;
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-2 text-slate-500">Track your pipeline and review the latest gathered leads.</p></div><a href="/api/export" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Export CSV</a></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, count]) => <div className="rounded-xl border bg-white p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{count}</p></div>)}</div>
    <section className="mt-10 rounded-xl border bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="text-xl font-semibold">Latest gathered leads</h2><p className="mt-1 text-sm text-slate-500">The 20 most recently discovered businesses.</p></div><Link href="/leads" className="text-sm font-medium text-blue-600 hover:underline">Find more leads</Link></div>
      {recentLeads.length === 0 ? <div className="p-8 text-center text-slate-500"><p>No leads have been gathered yet.</p><Link href="/leads" className="mt-3 inline-block font-medium text-blue-600 hover:underline">Start your first search</Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-medium">Business</th><th className="px-5 py-3 font-medium">Score</th><th className="px-5 py-3 font-medium">Opportunity</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Gathered</th></tr></thead><tbody className="divide-y">{recentLeads.map((lead) => <tr key={lead.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/leads/${lead.id}`} className="font-semibold text-slate-900 hover:text-blue-600 hover:underline">{lead.businessName}</Link><p className="mt-1 text-xs text-slate-500">{lead.businessType} · {lead.location}</p><div className="mt-2 flex gap-3 text-xs">{lead.websiteUrl ? <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Website</a> : <span className="text-slate-400">No website</span>}{lead.instagramUrl && <a href={lead.instagramUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Instagram</a>}</div></td><td className="px-5 py-4 font-semibold">{lead.leadScore ?? "—"}</td><td className="px-5 py-4 text-slate-600">{lead.opportunity ?? "Not analyzed"}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{lead.status.replaceAll("_", " ")}</span></td><td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(lead.createdAt)}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
