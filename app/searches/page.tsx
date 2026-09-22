import Link from "next/link";
import { db } from "@/lib/db";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function Searches() {
  const rows = await db.search.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold">Search history</h1>
        <p className="mt-2 text-slate-500">Open a search to review the businesses gathered in that run.</p>
      </div>
      <Link href="/leads" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Find more leads</Link>
    </div>
    {rows.length === 0 ? <div className="mt-6 rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">No searches have been gathered yet.</div> : <div className="mt-6 grid gap-3">{rows.map((search) => <Link key={search.id} href={`/leads?searchId=${encodeURIComponent(search.id)}`} className="block rounded-xl border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{search.businessType}</h2><p className="mt-1 text-sm text-slate-600">{search.location}</p>{search.description && <p className="mt-2 line-clamp-1 text-sm text-slate-500">{search.description}</p>}</div><div className="text-right text-sm text-slate-500"><p>{search._count.leads} leads gathered</p><p className="mt-1 text-xs">{formatDate(search.createdAt)}</p></div></div><p className="mt-3 text-xs font-medium text-blue-600">Open gathered businesses <span aria-hidden="true">?</span></p></Link>)}</div>}
  </div>;
}
