import Link from "next/link";
import { db } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function Dashboard() {
  const [total, newCount, contacted, replied, clients, recentSearches] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { status: "CONTACTED" } }),
    db.lead.count({ where: { status: "REPLIED" } }),
    db.lead.count({ where: { status: "CLIENT" } }),
    db.search.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        _count: { select: { leads: true } },
        leads: {
          orderBy: { createdAt: "asc" },
          take: 4,
          select: { id: true, businessName: true },
        },
      },
    }),
  ]);
  const cards = [["Total leads", total], ["New", newCount], ["Contacted", contacted], ["Replies", replied], ["Clients", clients]] as const;
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Dashboard</h1><p className="mt-2 text-slate-500">Track your pipeline and review the latest gathered leads.</p></div><a href="/api/export" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Export CSV</a></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, count]) => <div className="rounded-xl border bg-white p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{count}</p></div>)}</div>
    <section className="mt-10"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Recent searches</h2><p className="mt-1 text-sm text-slate-500">Each card represents one gathering run and its businesses.</p></div><Link href="/searches" className="text-sm font-medium text-blue-600 hover:underline">View search history</Link></div>
      {recentSearches.length === 0 ? <div className="mt-4 rounded-xl border bg-white p-8 text-center text-slate-500"><p>No searches have been gathered yet.</p><Link href="/leads" className="mt-3 inline-block font-medium text-blue-600 hover:underline">Start your first search</Link></div> : <div className="mt-4 grid gap-4 lg:grid-cols-2">{recentSearches.map((search) => <Link key={search.id} href={`/leads?searchId=${search.id}`} className="block rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"><article><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-slate-900">{search.businessType}</h3><p className="mt-1 text-sm text-slate-600">{search.location}</p></div><p className="whitespace-nowrap text-xs text-slate-500">{formatDate(search.createdAt)}</p></div>{search.description && <p className="mt-3 line-clamp-2 text-sm text-slate-500">{search.description}</p>}<div className="mt-4 border-t pt-4"><p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{search._count.leads}</span> of {search.requestedLeads} leads gathered</p></div><div className="mt-3 flex flex-wrap gap-2">{search.leads.map((lead) => <span key={lead.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{lead.businessName}</span>)}{search._count.leads > search.leads.length && <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">+{search._count.leads - search.leads.length} more</span>}</div></article></Link>)}</div>}
    </section>
  </div>;
}
