export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#1f2533] py-10 px-6">
      <div className="max-w-[1100px] mx-auto flex justify-between items-center flex-wrap gap-4">
        <div className="font-[var(--font-display)] font-extrabold text-sm text-[#5a6478] tracking-tight">
          METAGRID
        </div>
        <div className="font-[var(--font-mono)] text-[11px] text-[#5a6478] flex gap-4 flex-wrap">
          <span>&copy; {new Date().getFullYear()} Metagrid. All rights reserved.</span>
          <span className="text-[#5a6478]">&middot;</span>
          <span>Patent Pending</span>
        </div>
      </div>
    </footer>
  );
}
