import RiskBadge from './RiskBadge';
import { ChevronRight } from 'lucide-react';

export default function MessageHistoryItem({ item, onClick }) {
  // API returns category & created_at; normalize for display
  const displayDate = item.created_at || item.date;

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 shadow-sm hover:shadow-md dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-slate-200 text-sm font-semibold truncate mb-3">
            "{item.message || item.message_content}"
          </p>
          <div className="flex items-center gap-3">
            <RiskBadge category={item.category} />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {displayDate ? new Date(displayDate).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-900 dark:text-slate-500 dark:group-hover:text-white group-hover:translate-x-1 transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
