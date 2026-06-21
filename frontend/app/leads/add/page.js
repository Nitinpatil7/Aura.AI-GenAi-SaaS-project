"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import LeadNav from "../LeadNav";
import { emptyLead, leadTypes, websiteQualities } from "../leadConstants";

const fields = [
  ["companyName", "Company name", "text", true],
  ["category", "Category", "text"],
  ["city", "City", "text"],
  ["country", "Country", "text"],
  ["website", "Website", "url"],
  ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["instagram", "Instagram", "url"],
  ["linkedin", "LinkedIn", "url"],
  ["ownerName", "Owner name", "text"],
  ["hrName", "HR name", "text"],
  ["source", "Source", "text"],
];

export default function AddLeadPage() {
  const { api } = useContext(appcontext);
  const router = useRouter();
  const [form, setForm] = useState(emptyLead);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${api}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to create lead");
      router.push(`/leads/${data.lead._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <LeadNav />
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-950">Add lead</h2>
          <p className="text-sm text-slate-500">Use provided or public business contact data only.</p>
        </div>

        {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        <form onSubmit={submit} className="rounded-md border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Lead type
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
              >
                {leadTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Website quality
              <select
                value={form.websiteQuality}
                onChange={(e) => update("websiteQuality", e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
              >
                {websiteQualities.map((quality) => (
                  <option key={quality || "blank"} value={quality}>{quality || "Not reviewed"}</option>
                ))}
              </select>
            </label>

            {fields.map(([name, label, type, required]) => (
              <label key={name} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                {label}
                <input
                  type={type}
                  required={required}
                  value={form[name]}
                  onChange={(e) => update(name, e.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                />
              </label>
            ))}

            <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.hasWebsite}
                onChange={(e) => update("hasWebsite", e.target.checked)}
                className="h-4 w-4"
              />
              Has website
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save lead"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
