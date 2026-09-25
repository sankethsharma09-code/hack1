export default function StatCard({ title, value, subtitle, icon: Icon }) {
  let iconBgClass = "from-indigo-500/20 to-cyan-500/20";
  let iconColorClass = "text-cyan-400";
  
  if (title.toLowerCase().includes('flagged')) {
    iconBgClass = "from-amber-500/20 to-orange-500/20";
    iconColorClass = "text-amber-400";
  } else if (title.toLowerCase().includes('common')) {
    iconBgClass = "from-rose-500/20 to-red-500/20";
    iconColorClass = "text-rose-400";
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && (
            <p className="text-slate-400 text-sm mt-3 bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5">{subtitle}</p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconBgClass} ${iconColorClass} shadow-inner`}>
           <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
