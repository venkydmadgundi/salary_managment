import { useEffect, useState } from "react";
import { fetchStats } from "../lib/api";
import type { DashboardStats } from "../lib/types";
import { StatCard } from "../components/StatCard";
import { BreakdownList } from "../components/BreakdownList";
import { SalaryHistogram } from "../components/SalaryHistogram";
import { formatNumber, formatSalary } from "../lib/format";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats().then(setStats).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className="p-6 text-rose-600">{error}</div>;
  if (!stats) return <div className="p-6 text-slate-500">Loading dashboard…</div>;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Salary figures use stored values.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Headcount" value={formatNumber(stats.headcount)} sub={`${formatNumber(stats.active_headcount)} active`} />
        <StatCard label="Average stored salary" value={formatSalary(stats.avg_salary)} />
        <StatCard label="Median stored salary" value={formatSalary(stats.median_salary)} />
        <StatCard label="Total stored salary" value={formatSalary(stats.total_salary)} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownList title="Headcount by country" rows={stats.by_country.map((r) => ({ key: r.country, headcount: r.headcount, averageSalary: r.avg_salary }))} />
        <BreakdownList title="Headcount by department" rows={stats.by_department.map((r) => ({ key: r.department, headcount: r.headcount, averageSalary: r.avg_salary }))} />
      </section>

      <section>
        <SalaryHistogram data={stats.salary_histogram} />
      </section>
    </div>
  );
}
