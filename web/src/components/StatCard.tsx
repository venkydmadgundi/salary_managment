type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
};

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <article className="rounded-lg border bg-white p-4">
      <h2 className="text-sm font-medium text-slate-500">{label}</h2>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </article>
  );
}
