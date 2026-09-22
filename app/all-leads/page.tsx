"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Status = "NEW" | "CONTACTED" | "REPLIED" | "INTERESTED" | "NOT_INTERESTED" | "CLIENT";
type Lead = {
  id: string;
  businessName: string;
  businessType: string;
  location: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  hasWebsite: boolean;
  hasInstagram: boolean;
  hasBooking: boolean | null;
  opportunity: string | null;
  leadScore: number | null;
  status: Status;
  createdAt: string;
};

const statuses: Array<{ value: "" | Status; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "REPLIED", label: "Replied" },
  { value: "INTERESTED", label: "Interested" },
  { value: "NOT_INTERESTED", label: "Not interested" },
  { value: "CLIENT", label: "Client" },
];

function statusLabel(status: Status) {
  return status.replaceAll("_", " ").toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
}

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | Status>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load leads.");
      setLeads(data.leads);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => { void loadLeads(); }, [loadLeads]);

  async function updateStatus(id: string, nextStatus: Status) {
    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not update status.");
      return;
    }
    setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status: data.lead.status } : lead));
  }

  return <div className="mx-auto max-w-7xl">
    <header className="mb-8">
      <p className="text-sm font-semibold text-blue-600">Pipeline</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">All leads</h1>
      <p className="mt-2 text-slate-600">Review every business gathered across your searches.</p>
    </header>

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
        <label className="text-sm font-semibold">Search leads
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void loadLeads(); }} placeholder="Business name or location" className="mt-2 w-full rounded-lg border p-3 font-normal" />
        </label>
        <label className="text-sm font-semibold">Status
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | Status)} className="mt-2 w-full rounded-lg border p-3 font-normal">
            {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void loadLeads()} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700">Search</button>
      </div>
    </section>

    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{loading ? "Loading leads…" : `${leads.length} lead${leads.length === 1 ? "" : "s"}`}</h2><Link href="/leads" className="text-sm font-medium text-blue-600 hover:underline">Find more leads</Link></div>
      {!loading && !leads.length ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No leads match these filters.</div> : <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{leads.map((lead) => <article key={lead.id} className="p-5 transition hover:bg-slate-50/60"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link href={`/leads/${lead.id}`} className="text-lg font-bold hover:text-blue-600 hover:underline">{lead.businessName}</Link><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{statusLabel(lead.status)}</span></div><p className="mt-1 text-sm text-slate-600">{lead.businessType} · {lead.location}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-2 py-1">Score: {lead.leadScore ?? "—"}</span>{lead.opportunity && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{lead.opportunity}</span>}<span className={`rounded-full px-2 py-1 ${lead.hasWebsite ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{lead.hasWebsite ? "Website" : "No website"}</span><span className={`rounded-full px-2 py-1 ${lead.hasInstagram ? "bg-pink-50 text-pink-700" : "bg-slate-100 text-slate-500"}`}>{lead.hasInstagram ? "Instagram" : "No Instagram"}</span>{lead.hasBooking && <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">Booking</span>}</div><p className="mt-3 text-xs text-slate-500">Gathered {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(lead.createdAt))}</p></div><div className="flex flex-wrap items-center gap-3 lg:justify-end"><select aria-label={`Status for ${lead.businessName}`} value={lead.status} onChange={(event) => void updateStatus(lead.id, event.target.value as Status)} className="rounded-lg border px-3 py-2 text-sm"><option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="REPLIED">Replied</option><option value="INTERESTED">Interested</option><option value="NOT_INTERESTED">Not interested</option><option value="CLIENT">Client</option></select>{lead.websiteUrl && <a href={lead.websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Website</a>}{lead.instagramUrl && <a href={lead.instagramUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Instagram</a>}<Link href={`/leads/${lead.id}`} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50">View details</Link></div></div></article>)}</div></div>}
    </section>
  </div>;
}
