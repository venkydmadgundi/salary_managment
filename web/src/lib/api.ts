import type {
  DashboardStats,
  Employee,
  EmployeeFilters,
  Paginated,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export type EmployeeAttributes = Omit<Employee, "id">;

async function requestError(res: Response, action: string): Promise<Error> {
  const body = await res.text();
  if (body) {
    try {
      const payload: unknown = JSON.parse(body);
      if (payload && typeof payload === "object") {
        const messages = Object.values(payload).flatMap((value) =>
          Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") :
            typeof value === "string" ? [value] : [],
        );
        if (messages.length) return new Error(messages.join(", "));
      }
    } catch {
      return new Error(`${action} (${res.status}): ${body}`);
    }
  }
  return new Error(`${action} (${res.status})`);
}

function toQuery(filters: EmployeeFilters): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function fetchEmployees(
  filters: EmployeeFilters,
  signal?: AbortSignal,
): Promise<Paginated<Employee>> {
  const res = await fetch(`${BASE}/api/employees${toQuery(filters)}`, { signal });
  if (!res.ok) throw new Error(`Failed to load employees (${res.status})`);
  return res.json();
}

export async function fetchDeletedEmployees(page = 1): Promise<Paginated<Employee>> {
  const res = await fetch(`${BASE}/api/employees/deleted${toQuery({ page })}`);
  if (!res.ok) throw new Error(`Failed to load deleted employees (${res.status})`);
  return res.json();
}

export function employeeExportUrl(filters: EmployeeFilters): string {
  const { page: _page, ...exportFilters } = filters;
  return `${BASE}/api/employees/export.csv${toQuery(exportFilters)}`;
}

export async function fetchEmployee(
  id: string,
  signal?: AbortSignal,
): Promise<Employee> {
  const res = await fetch(`${BASE}/api/employees/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) throw new Error(`Failed to load employee (${res.status})`);
  return res.json();
}

export async function createEmployee(attributes: EmployeeAttributes): Promise<Employee> {
  const res = await fetch(`${BASE}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee: attributes }),
  });
  if (!res.ok) throw await requestError(res, "Failed to create employee");
  return res.json();
}

export async function updateEmployee(
  id: string,
  attributes: EmployeeAttributes,
): Promise<Employee> {
  const res = await fetch(`${BASE}/api/employees/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee: attributes }),
  });
  if (!res.ok) throw await requestError(res, "Failed to update employee");
  return res.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/employees/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw await requestError(res, "Failed to delete employee");
}

export async function restoreEmployee(id: number): Promise<Employee> {
  const res = await fetch(`${BASE}/api/employees/${id}/restore`, { method: "PATCH" });
  if (!res.ok) throw await requestError(res, "Failed to restore employee");
  return res.json();
}

export async function fetchStats(signal?: AbortSignal): Promise<DashboardStats> {
  const res = await fetch(`${BASE}/api/stats`, { signal });
  if (!res.ok) throw new Error(`Failed to load stats (${res.status})`);
  return res.json();
}
