"use client";

import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { employeeExportUrl } from "../../lib/api";
import type { EmployeeFilters } from "../../lib/types";

const COUNTRIES = ["US", "DE", "GB", "IN", "BR", "NG", "CH", "SG"];
const DEPARTMENTS = ["Engineering","Product","Design","Sales","Marketing","HR","Finance","Operations"];
const STATUSES = ["active", "on_leave", "terminated"] as const;

export function FiltersBar({ filters }: { filters: EmployeeFilters }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(filters.q ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      if ((filters.q ?? "") === q) return;
      update({ q, page: 1 });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function update(patch: Partial<EmployeeFilters>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    }
    setSearchParams(next);
  }

  function reset() { setSearchParams({}); }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email…"
        className="h-9 w-64 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      />
      <Select value={filters.country ?? ""} onChange={(v) => update({ country: v || undefined, page: 1 })} placeholder="All countries" options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
      <Select value={filters.department ?? ""} onChange={(v) => update({ department: v || undefined, page: 1 })} placeholder="All departments" options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
      <Select value={filters.status ?? ""} onChange={(v) => update({ status: (v || undefined) as EmployeeFilters["status"], page: 1 })} placeholder="Any status" options={STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))} />
      <button onClick={reset} className="ml-auto h-9 rounded-md border px-3 text-sm text-slate-600 hover:bg-slate-50">Reset</button>
      <a
        href={employeeExportUrl(filters)}
        className="inline-flex h-9 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700"
      >
        Export CSV
      </a>
    </div>
  );
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
