import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { EmployeeFilters } from "../../lib/types";

export function Pagination({ meta, filters }: {
  meta: { page: number; per_page: number; total_count: number; total_pages: number };
  filters: EmployeeFilters;
}) {
  const { page, total_pages } = meta;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...filters, page: p })) {
      if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
    }
    return `/employees?${sp.toString()}`;
  };

  const window = 2;
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= total_pages; p++) {
    if (p === 1 || p === total_pages || Math.abs(p - page) <= window) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">Page {page} of {total_pages}</span>
      <div className="flex items-center gap-1">
        <PageLink href={href(Math.max(1, page - 1))} disabled={page === 1}>Prev</PageLink>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-slate-400">…</span>
          ) : (
            <PageLink key={p} href={href(p)} active={p === page}>{p}</PageLink>
          ),
        )}
        <PageLink href={href(Math.min(total_pages, page + 1))} disabled={page === total_pages}>Next</PageLink>
      </div>
    </div>
  );
}

function PageLink({ href, children, active, disabled }: {
  href: string; children: ReactNode; active?: boolean; disabled?: boolean;
}) {
  if (disabled) return <span className="rounded-md border px-3 py-1 text-slate-300">{children}</span>;
  return (
    <Link to={href}
      className={`rounded-md border px-3 py-1 hover:bg-slate-50 ${active ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900" : ""}`}>
      {children}
    </Link>
  );
}
