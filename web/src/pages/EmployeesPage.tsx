import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchEmployees } from "../lib/api";
import type { Employee, EmployeeFilters } from "../lib/types";
import { EmployeesTable } from "./_components/employees-table";
import { FiltersBar } from "./_components/filters-bar";
import { Pagination } from "./_components/pagination";

type Meta = { page: number; per_page: number; total_count: number; total_pages: number };

export function EmployeesPage() {
  const [searchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters: EmployeeFilters = {
    q: searchParams.get("q") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    status: (searchParams.get("status") ?? undefined) as EmployeeFilters["status"],
    sort: searchParams.get("sort") ?? "name:asc",
    page: Number(searchParams.get("page") ?? 1),
  };

  // Key the effect off the serialized search params so it re-runs on any change
  const searchKey = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEmployees(filters)
      .then((res) => {
        if (cancelled) return;
        setEmployees(res.data);
        setMeta(res.meta);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500">
            {meta ? `${meta.total_count.toLocaleString()} employees match your filters` : "Loading…"}
          </p>
        </div>
        <Link
          to="/employees/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Create employee
        </Link>
        <Link
          to="/employees/deleted"
          className="rounded-md border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          Deleted employees
        </Link>
      </header>

      <FiltersBar filters={filters} />

      <div className={`rounded-lg border bg-white ${loading ? "opacity-60" : ""}`}>
        {error ? (
          <div className="p-12 text-center text-sm text-rose-600">{error}</div>
        ) : (
          <EmployeesTable employees={employees} sort={filters.sort!} />
        )}
      </div>

      {meta && <Pagination meta={meta} filters={filters} />}
    </div>
  );
}
