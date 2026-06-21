"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, Clock3, Send, Users } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import LeadNav from "../leads/LeadNav";
import { leadStatuses, statusLabel } from "../leads/leadConstants";

export default function LeadDashboardPage() {
  const { api } = useContext(appcontext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${api}/api/leads/stats`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load stats");
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [api]);

  const cards = [
    { label: "Total leads", value: stats?.total || 0, icon: Users, color: "text-slate-700" },
    { label: "Sent", value: stats?.byStatus?.sent || 0, icon: Send, color: "text-blue-700" },
    { label: "Follow-ups", value: stats?.followUpsDue || 0, icon: Clock3, color: "text-rose-700" },
    { label: "Converted", value: stats?.converted || 0, icon: CheckCircle2, color: "text-emerald-700" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <LeadNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Dashboard</h2>
            <p className="text-sm text-slate-500">A quick read on freelance and internship outreach progress.</p>
          </div>
          <Link href="/leads" className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <BriefcaseBusiness size={16} />
            Open leads
          </Link>
        </div>

        {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-md bg-white" />)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-md border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <Icon className={card.color} size={20} />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">By status</h3>
                <div className="mt-4 space-y-3">
                  {leadStatuses.map((status) => {
                    const count = stats?.byStatus?.[status] || 0;
                    const width = stats?.total ? `${Math.max((count / stats.total) * 100, count ? 6 : 0)}%` : "0%";
                    return (
                      <div key={status}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="capitalize text-slate-600">{statusLabel(status)}</span>
                          <span className="font-medium text-slate-950">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">By type</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {["freelance", "internship"].map((type) => (
                    <div key={type} className="rounded-md border border-slate-200 p-4">
                      <p className="text-sm capitalize text-slate-500">{type}</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950">{stats?.byType?.[type] || 0}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                  Email sending is intentionally manual. The scheduler only marks leads that need attention.
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
