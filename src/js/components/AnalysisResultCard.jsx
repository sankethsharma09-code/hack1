import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function AnalysisResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300">
      <div className="mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Analysis Result
        </h3>
        <RiskBadge status={result.status} score={result.score} />
      </div>

      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
          {result.redFlags.length > 0 ? (
            <AlertTriangle className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          )}
          Red Flags Identified
        </h4>
        {result.redFlags.length > 0 ? (
          <ul className="space-y-3">
            {result.redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-rose-400 mt-0.5 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5">
            No red flags were found in this message.
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl p-5 border border-indigo-500/20">
        <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2 mb-3">
          <Info className="w-5 h-5" />
          What this means
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          {result.explanation}
        </p>
      </div>
    </div>
  );
}
