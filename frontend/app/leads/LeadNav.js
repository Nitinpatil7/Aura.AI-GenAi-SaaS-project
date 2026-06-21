"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bell, ListChecks, Plus } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Stats", icon: BarChart3 },
  { href: "/leads", label: "Leads", icon: ListChecks },
  { href: "/leads/add", label: "Add", icon: Plus },
  { href: "/leads/followups", label: "Follow-ups", icon: Bell },
];

export default function LeadNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-700">Lead CRM</p>
          <h1 className="text-2xl font-semibold text-slate-950">Freelance and internship outreach</h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
