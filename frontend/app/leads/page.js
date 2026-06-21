"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import LeadBadge from "./LeadBadge";
import LeadNav from "./LeadNav";
import { leadStatuses, leadTypes } from "./leadConstants";

export default function LeadsPage() {
  const { api } = useContext(appcontext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", type: "" });

  const query = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  }, [filters]);

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${api}/api/leads${query ? `?${query}` : ""}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load leads");
        setLeads(data.leads || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [api, query]);

  return (
    <main className="min-h-screen bg-slate-50">
      <LeadNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Lead pipeline</h2>
            <p className="text-sm text-slate-500">Store public business contacts, draft outreach, and track manual follow-ups.</p>
          </div>
          <Link
            href="/leads/add"
            className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add lead
          </Link>
        </div>

        <div className="mb-5 grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[1fr_180px_220px]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search company, city, email, source..."
              className="w-full rounded-md border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All types</option>
            {leadTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All statuses</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
            ))}
          </select>
        </div>

        {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
            <Filter size={16} />
            {loading ? "Loading leads..." : `${leads.length} lead${leads.length === 1 ? "" : "s"}`}
          </div>
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-800">No leads found</p>
              <p className="mt-1 text-sm text-slate-500">Add a lead or clear filters to see your pipeline.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/leads/${lead._id}`} className="font-semibold text-slate-950 hover:text-emerald-700">
                          {lead.companyName}
                        </Link>
                        <p className="text-xs text-slate-500">{lead.category || lead.source || "No category"}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-700">{lead.type}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.email || lead.phone || "No contact"}</td>
                      <td className="px-4 py-3 text-slate-600">{[lead.city, lead.country].filter(Boolean).join(", ") || "-"}</td>
                      <td className="px-4 py-3"><LeadBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
