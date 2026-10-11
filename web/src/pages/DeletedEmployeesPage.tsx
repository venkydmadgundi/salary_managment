import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchDeletedEmployees, restoreEmployee } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Employee, Paginated } from "../lib/types";

export function DeletedEmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const [result, setResult] = useState<Paginated<Employee> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    fetchDeletedEmployees(page)
      .then((data) => {
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [page, reload]);

  async function restore(employee: Employee) {
    setRestoringId(employee.id);
    setError(null);
    setNotice(null);
    try {
      await restoreEmployee(employee.id);
      setNotice(`${employee.name} was restored and set to active.`);
      setReload((current) => current + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to restore employee.");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <Link to="/employees" className="text-sm text-slate-600 hover:text-slate-900">
          &larr; Back to employees
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Deleted employees</h1>
        <p className="text-sm text-slate-500">
          {result ? `${result.meta.total_count.toLocaleString()} deleted employees` : "Loading…"}
        </p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

      <div className="overflow-x-auto rounded-lg border bg-white">
        {error && !result ? null : result?.data.length ? (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Name</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Email</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Department</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Status before restore</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Hire date</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.data.map((employee) => (
                <tr key={employee.id} className="align-middle">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{employee.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{employee.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{employee.department}</td>
                  <td className="whitespace-nowrap px-4 py-3">{employee.employment_status.replace("_", " ")}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(employee.join_date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => restore(employee)}
                      disabled={restoringId !== null}
                      className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {restoringId === employee.id ? "Restoring…" : "Restore as active"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : result ? (
          <p className="p-10 text-center text-sm text-slate-500">There are no deleted employees to restore.</p>
        ) : !error ? (
          <p className="p-10 text-center text-sm text-slate-500">Loading deleted employees…</p>
        ) : null}
      </div>

      {result && result.meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {result.meta.page} of {result.meta.total_pages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1) })}
              className="rounded-md border px-3 py-1 disabled:text-slate-300"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= result.meta.total_pages}
              onClick={() => setSearchParams({ page: String(page + 1) })}
              className="rounded-md border px-3 py-1 disabled:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
