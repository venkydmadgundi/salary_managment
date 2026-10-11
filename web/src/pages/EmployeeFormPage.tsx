import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEmployee, fetchEmployee, updateEmployee } from "../lib/api";
import type { EmployeeAttributes } from "../lib/api";
import type { EmploymentStatus } from "../lib/types";

const EMPTY_EMPLOYEE: EmployeeAttributes = {
  name: "",
  email: "",
  country: "",
  department: "",
  job_title: "",
  join_date: "",
  employment_status: "active",
  salary: "",
};

const STATUSES: EmploymentStatus[] = ["active", "on_leave", "terminated"];
const CONTROL_CLASS = "h-10 w-full rounded-md border px-3";

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [employee, setEmployee] = useState<EmployeeAttributes>(EMPTY_EMPLOYEE);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchEmployee(id, controller.signal)
      .then(({ id: _employeeId, ...attributes }) => setEmployee(attributes))
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  function updateField<K extends keyof EmployeeAttributes>(
    field: K,
    value: EmployeeAttributes[K],
  ) {
    setEmployee((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const saved = id
        ? await updateEmployee(id, employee)
        : await createEmployee(employee);
      navigate(`/employees/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save employee.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-3xl p-6 text-slate-500">Loading employee…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Link
        to={id ? `/employees/${id}` : "/employees"}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        &larr; {id ? "Back to employee" : "Back to employees"}
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {editing ? "Edit employee" : "Create employee"}
        </h1>
      </header>

      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className={CONTROL_CLASS} required value={employee.name} onChange={(e) => updateField("name", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={CONTROL_CLASS} required type="email" value={employee.email} onChange={(e) => updateField("email", e.target.value)} />
          </Field>
          <Field label="Country code">
            <input className={CONTROL_CLASS} required minLength={2} maxLength={2} value={employee.country} onChange={(e) => updateField("country", e.target.value.toUpperCase())} />
          </Field>
          <Field label="Department">
            <input className={CONTROL_CLASS} required value={employee.department} onChange={(e) => updateField("department", e.target.value)} />
          </Field>
          <Field label="Job title">
            <input className={CONTROL_CLASS} required value={employee.job_title} onChange={(e) => updateField("job_title", e.target.value)} />
          </Field>
          <Field label="Hire date">
            <input className={CONTROL_CLASS} required type="date" value={employee.join_date.slice(0, 10)} onChange={(e) => updateField("join_date", e.target.value)} />
          </Field>
          <Field label="Employment status">
            <select
              className={`${CONTROL_CLASS} bg-white`}
              required
              value={employee.employment_status}
              onChange={(e) => updateField("employment_status", e.target.value as EmploymentStatus)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace("_", " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Salary">
            <input
              className={CONTROL_CLASS}
              required
              type="number"
              min="0"
              step="0.01"
              value={employee.salary}
              onChange={(e) => updateField("salary", e.target.value)}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3">
          <Link
            to={id ? `/employees/${id}` : "/employees"}
            className="rounded-md border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Create employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
