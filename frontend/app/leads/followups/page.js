"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import LeadBadge from "../LeadBadge";
import LeadNav from "../LeadNav";

export default function FollowupsPage() {
  const { api } = useContext(appcontext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFollowups = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${api}/api/leads/followups`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load follow-ups");
        setLeads(data.leads || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFollowups();
  }, [api]);

  return (
    <main className="min-h-screen bg-slate-50">
      <LeadNav />
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <Bell size={20} />
            Follow-ups
          </h2>
          <p className="text-sm text-slate-500">These leads need manual review. No follow-up emails are sent automatically.</p>
        </div>

        {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <div className="rounded-md border border-slate-200 bg-white">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-md bg-slate-100" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarClock className="mx-auto text-slate-400" size={38} />
              <p className="mt-3 font-medium text-slate-800">No follow-ups due</p>
              <p className="mt-1 text-sm text-slate-500">Sent leads will appear here after their follow-up date passes.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <Link key={lead._id} href={`/leads/${lead._id}`} className="block p-4 hover:bg-slate-50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-950">{lead.companyName}</h3>
                        <LeadBadge status={lead.status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {lead.email || "No email"} | {lead.type} | {lead.category || "No category"}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-rose-700">
                      Due {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : "now"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
