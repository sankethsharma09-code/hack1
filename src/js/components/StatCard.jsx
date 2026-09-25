export default function StatCard({ title, value, subtitle, icon: Icon, valueClassName }) {
  let iconBgClass = "from-indigo-500/20 to-cyan-500/20";
  let iconColorClass = "text-indigo-600 dark:text-cyan-400";
  
  if (title.toLowerCase().includes('flagged')) {
    iconBgClass = "from-amber-500/20 to-orange-500/20";
    iconColorClass = "text-amber-600 dark:text-amber-400";
  } else if (title.toLowerCase().includes('common')) {
    iconBgClass = "from-rose-500/20 to-red-500/20";
    iconColorClass = "text-rose-600 dark:text-rose-400";
  }

  const isLong = typeof value === 'string' && value.length > 12;
  const computedValueClass = valueClassName || (
    isLong
      ? "text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words"
      : "text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight"
  );

  return (
    <div className="bg-white dark:bg-white/10 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-2">{title}</p>
          <h3 className={computedValueClass} title={typeof value === 'string' ? value : undefined}>
            {value || 'None'}
          </h3>
          {subtitle && (
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-3 bg-slate-100 dark:bg-white/5 inline-block px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconBgClass} ${iconColorClass} shadow-inner`}>
           <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
