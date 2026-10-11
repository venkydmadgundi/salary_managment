import { formatNumber, formatSalary } from "../lib/format";

type SalaryBucket = {
  salary_start: number;
  salary_end: number;
  count: number;
};

type SalaryHistogramProps = {
  data: SalaryBucket[];
};

export function SalaryHistogram({ data }: SalaryHistogramProps) {
  const maxCount = Math.max(1, ...data.map((bucket) => bucket.count));

  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="font-semibold">Salary distribution</h2>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No salary data available.</p>
      ) : (
        <div className="mt-4 flex h-56 items-end gap-2 border-b border-slate-200 px-2">
          {data.map((bucket) => (
            <div
              key={`${bucket.salary_start}-${bucket.salary_end}`}
              className="group relative flex h-full min-w-0 flex-1 items-end"
              title={`${formatSalary(bucket.salary_start)}–${formatSalary(bucket.salary_end)}: ${formatNumber(bucket.count)} employees`}
            >
              <div
                className="w-full rounded-t bg-slate-700"
                style={{ height: `${Math.max(2, (bucket.count / maxCount) * 100)}%` }}
                aria-label={`${formatNumber(bucket.count)} employees`}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
