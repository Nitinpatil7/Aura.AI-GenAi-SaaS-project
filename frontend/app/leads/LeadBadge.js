"use client";

import { statusClass, statusLabel } from "./leadConstants";

export default function LeadBadge({ status }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
