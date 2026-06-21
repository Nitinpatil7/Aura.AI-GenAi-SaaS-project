"use client";

export const leadTypes = ["freelance", "internship"];

export const leadStatuses = [
  "new",
  "message_generated",
  "draft_created",
  "sent",
  "replied",
  "follow_up_needed",
  "converted",
  "rejected",
];

export const websiteQualities = ["", "none", "poor", "average", "good", "excellent"];

export function statusLabel(status) {
  return String(status || "new").replaceAll("_", " ");
}

export function statusClass(status) {
  const classes = {
    new: "bg-slate-100 text-slate-700",
    message_generated: "bg-indigo-100 text-indigo-700",
    draft_created: "bg-amber-100 text-amber-800",
    sent: "bg-blue-100 text-blue-700",
    replied: "bg-cyan-100 text-cyan-700",
    follow_up_needed: "bg-rose-100 text-rose-700",
    converted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-zinc-200 text-zinc-700",
  };

  return classes[status] || classes.new;
}

export const emptyLead = {
  type: "freelance",
  companyName: "",
  category: "",
  city: "",
  country: "",
  website: "",
  email: "",
  phone: "",
  instagram: "",
  linkedin: "",
  ownerName: "",
  hrName: "",
  source: "",
  hasWebsite: false,
  websiteQuality: "",
  status: "new",
  message: "",
};
