import { Link } from "react-router-dom";
import { formatDate, STATUS_LABEL, STATUS_TONE } from "../../lib/format";
import type { Employee } from "../../lib/types";

const COLUMNS: { key: string; sortKey?: string; label: string; className?: string }[] = [
  { key: "name", sortKey: "name", label: "Name" },
  { key: "email", sortKey: "email", label: "Email", className: "hidden md:table-cell" },
  { key: "country", sortKey: "country", label: "Country" },
  { key: "department", sortKey: "department", label: "Department", className: "hidden lg:table-cell" },
  { key: "job_title", label: "Title", className: "hidden xl:table-cell" },
  { key: "employment_status", sortKey: "employment_status", label: "Status" },
  { key: "salary", sortKey: "salary", label: "Salary", className: "text-right" },
  { key: "join_date", sortKey: "join_date", label: "Hired", className: "hidden lg:table-cell" },
];

function sortHref(current: string, key: string): string {
  const [col, dir] = current.split(":");
  const nextDir = col === key && dir === "asc" ? "desc" : "asc";
  return `/employees?sort=${key}:${nextDir}`;
}

export function EmployeesTable({ employees, sort }: { employees: Employee[]; sort: string }) {
  if (employees.length === 0) {
    return <div className="p-12 text-center text-sm text-slate-500">No employees match these filters.</div>;
  }

  const [sortKey, sortDir] = sort.split(":");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-4 py-3 font-medium ${c.className ?? ""}`}>
                {c.sortKey ? (
                  <Link to={sortHref(sort, c.sortKey)} className="inline-flex items-center gap-1 hover:text-slate-900">
                    {c.label}
                    {sortKey === c.sortKey && <span aria-hidden>{sortDir === "asc" ? "▲" : "▼"}</span>}
                  </Link>
                ) : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {employees.map((e) => (
            <tr key={e.id} className="align-middle hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                <Link to={`/employees/${e.id}`} className="hover:underline">{e.name}</Link>
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 md:table-cell">{e.email}</td>
              <td className="whitespace-nowrap px-4 py-3">{e.country}</td>
              <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">{e.department}</td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 xl:table-cell">{e.job_title}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[e.employment_status]}`}>
                  {STATUS_LABEL[e.employment_status]}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums">
                {Number(e.salary).toLocaleString()}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-600 lg:table-cell">{formatDate(e.join_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
