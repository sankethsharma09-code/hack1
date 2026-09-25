import RiskBadge from './RiskBadge';
import { ChevronRight } from 'lucide-react';

export default function MessageHistoryItem({ item, onClick }) {
  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm truncate mb-3">
            "{item.message}"
          </p>
          <div className="flex items-center gap-3">
            <RiskBadge status={item.status} />
            <span className="text-xs text-slate-500">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
