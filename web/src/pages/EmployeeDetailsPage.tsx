import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteEmployee, fetchEmployee } from "../lib/api";
import { formatDate, STATUS_LABEL, STATUS_TONE } from "../lib/format";
import type { Employee } from "../lib/types";

export function EmployeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Employee ID is missing.");
      return;
    }

    const controller = new AbortController();
    setEmployee(null);
    setError(null);

    fetchEmployee(id, controller.signal)
      .then(setEmployee)
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });

    return () => controller.abort();
  }, [id]);

  async function removeEmployee() {
    if (!id || !window.confirm(`Soft-delete ${employee?.name ?? "this employee"}?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteEmployee(id);
      navigate("/employees");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete employee.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link to="/employees" className="text-sm text-slate-600 hover:text-slate-900">
        &larr; Back to employees
      </Link>

      {error ? (
        <div role="alert" className="rounded-lg border bg-white p-6 text-rose-600">{error}</div>
      ) : !employee ? (
        <div className="p-6 text-slate-500">Loading employee…</div>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <header>
              <h1 className="text-2xl font-semibold tracking-tight">{employee.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{employee.job_title}</p>
            </header>
            <div className="flex gap-2">
              <Link
                to={`/employees/${employee.id}/edit`}
                className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={removeEmployee}
                disabled={deleting}
                className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-lg border bg-slate-200 sm:grid-cols-2">
            <Detail label="Email" value={employee.email} />
            <Detail label="Country" value={employee.country} />
            <Detail label="Department" value={employee.department} />
            <Detail label="Employment status">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[employee.employment_status]}`}>
                {STATUS_LABEL[employee.employment_status]}
              </span>
            </Detail>
            <Detail label="Hire date" value={formatDate(employee.join_date)} />
            <Detail label="Salary" value={Number(employee.salary).toLocaleString()} />
          </dl>
        </>
      )}
    </div>
  );
}

function Detail({ label, value, children }: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children ?? value}</dd>
    </div>
  );
}
