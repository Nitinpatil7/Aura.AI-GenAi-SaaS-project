"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bot, Mail, Save, Trash2 } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import LeadBadge from "../LeadBadge";
import LeadNav from "../LeadNav";
import { leadStatuses, websiteQualities } from "../leadConstants";

export default function LeadDetailPage() {
  const { api } = useContext(appcontext);
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadLead = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${api}/api/leads/${id}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load lead");
      setLead(data.lead);
      setMessage(data.lead.message || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
  }, [api, id]);

  const patchLead = async (updates, label = "Saving") => {
    setWorking(label);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`${api}/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to update lead");
      setLead(data.lead);
      setMessage(data.lead.message || "");
      setNotice("Lead updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking("");
    }
  };

  const generateMessage = async () => {
    setWorking("Generating");
    setError("");
    setNotice("");

    try {
      const res = await fetch(`${api}/api/leads/${id}/generate-message`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to generate message");
      setLead(data.lead);
      setMessage(data.message || "");
      setNotice("Message generated. Review it before sending.");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking("");
    }
  };

  const sendEmail = async () => {
    const ok = window.confirm("Send this one email now? Review the message and recipient before confirming.");
    if (!ok) return;

    setWorking("Sending");
    setError("");
    setNotice("");

    try {
      const res = await fetch(`${api}/api/leads/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ confirmed: true, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to send email");
      setLead(data.lead);
      setMessage(data.lead.message || "");
      setNotice(data.message || "Email sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking("");
    }
  };

  const deleteLead = async () => {
    const ok = window.confirm("Delete this lead permanently?");
    if (!ok) return;

    setWorking("Deleting");
    try {
      const res = await fetch(`${api}/api/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to delete lead");
      router.push("/leads");
    } catch (err) {
      setError(err.message);
      setWorking("");
    }
  };

  const updateField = (name, value) => setLead((prev) => ({ ...prev, [name]: value }));

  return (
    <main className="min-h-screen bg-slate-50">
      <LeadNav />
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="h-64 animate-pulse rounded-md bg-white" />
        ) : error && !lead ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Link href="/leads" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Back to leads</Link>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-950">{lead.companyName}</h2>
                  <LeadBadge status={lead.status} />
                </div>
                <p className="mt-1 text-sm capitalize text-slate-500">{lead.type} lead</p>
              </div>
              <button
                onClick={deleteLead}
                disabled={Boolean(working)}
                className="inline-flex w-fit items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
            {notice && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

            <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-lg font-semibold text-slate-950">Lead details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["companyName", "Company"],
                    ["category", "Category"],
                    ["city", "City"],
                    ["country", "Country"],
                    ["website", "Website"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["instagram", "Instagram"],
                    ["linkedin", "LinkedIn"],
                    ["ownerName", "Owner"],
                    ["hrName", "HR"],
                    ["source", "Source"],
                  ].map(([name, label]) => (
                    <label key={name} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      {label}
                      <input
                        value={lead[name] || ""}
                        onChange={(e) => updateField(name, e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                      />
                    </label>
                  ))}

                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Status
                    <select
                      value={lead.status}
                      onChange={(e) => updateField("status", e.target.value)}
                      className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                    >
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Website quality
                    <select
                      value={lead.websiteQuality || ""}
                      onChange={(e) => updateField("websiteQuality", e.target.value)}
                      className="rounded-md border border-slate-200 px-3 py-2 font-normal outline-none focus:border-emerald-500"
                    >
                      {websiteQualities.map((quality) => (
                        <option key={quality || "blank"} value={quality}>{quality || "Not reviewed"}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(lead.hasWebsite)}
                      onChange={(e) => updateField("hasWebsite", e.target.checked)}
                      className="h-4 w-4"
                    />
                    Has website
                  </label>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => patchLead(lead)}
                    disabled={Boolean(working)}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Save size={16} />
                    {working === "Saving" ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">Outreach draft</h3>
                <p className="mt-1 text-sm text-slate-500">Generate, edit, and manually approve one email at a time.</p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={14}
                  className="mt-4 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
                  placeholder="Generate or write a message..."
                />
                <p className="mt-2 text-xs text-slate-500">Footer added automatically: If this is not relevant, please ignore this message.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={generateMessage}
                    disabled={Boolean(working)}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Bot size={16} />
                    {working === "Generating" ? "Generating..." : "Generate"}
                  </button>
                  <button
                    onClick={() => patchLead({ message, status: message ? "draft_created" : lead.status }, "Saving draft")}
                    disabled={Boolean(working)}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Save size={16} />
                    {working === "Saving draft" ? "Saving..." : "Save draft"}
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={Boolean(working) || !message || !lead.email}
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Mail size={16} />
                    {working === "Sending" ? "Sending..." : "Send email"}
                  </button>
                </div>
                <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <p>Last contacted: {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : "Never"}</p>
                  <p>Next follow-up: {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString() : "Not scheduled"}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
