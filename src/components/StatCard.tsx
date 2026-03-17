export default function StatCard({
  stat,
  label,
  source,
}: {
  stat: string;
  label: string;
  source?: string;
}) {
  return (
    <div className="bg-[#12151c] rounded-lg border border-[#1f2533] p-7">
      <div className="font-[var(--font-display)] text-3xl font-extrabold text-[#00d4aa] mb-2 tracking-tight">
        {stat}
      </div>
      <div className="font-[var(--font-body)] text-sm text-[#e8eaf0] leading-relaxed mb-2.5">
        {label}
      </div>
      {source && (
        <div className="font-[var(--font-mono)] text-[10px] text-[#5a6478]">
          {source}
        </div>
      )}
    </div>
  );
}
