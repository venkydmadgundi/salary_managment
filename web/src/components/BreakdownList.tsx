import { formatNumber, formatSalary } from "../lib/format";

type BreakdownRow = {
  key: string;
  headcount: number;
  averageSalary: number;
};

type BreakdownListProps = {
  title: string;
  rows: BreakdownRow[];
};

export function BreakdownList({ title, rows }: BreakdownListProps) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No data available.</p>
      ) : (
        <ul className="mt-3 divide-y">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium">{row.key}</span>
              <span className="text-right text-slate-500">
                {formatNumber(row.headcount)}
                <> · avg {formatSalary(row.averageSalary)}</>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
