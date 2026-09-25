export default function RiskBadge({ category, score }) {
  // Map API categories to display label + colors
  const lowerCategory = category?.toLowerCase();

  let displayLabel, strokeColor, glowColor;

  if (lowerCategory === 'legitimate') {
    displayLabel = 'Legitimate';
    strokeColor = 'text-emerald-400';
    glowColor = 'shadow-[0_0_15px_rgba(52,211,153,0.3)]';
  } else if (lowerCategory === 'spam') {
    displayLabel = 'Spam';
    strokeColor = 'text-amber-400';
    glowColor = 'shadow-[0_0_15px_rgba(251,191,36,0.3)]';
  } else if (lowerCategory === 'spoofing') {
    displayLabel = 'Spoofing';
    strokeColor = 'text-orange-400';
    glowColor = 'shadow-[0_0_15px_rgba(251,146,60,0.35)]';
  } else if (lowerCategory === 'phishing') {
    displayLabel = 'Phishing';
    strokeColor = 'text-rose-500';
    glowColor = 'shadow-[0_0_15px_rgba(244,63,94,0.4)]';
  } else {
    displayLabel = category || 'Unknown';
    strokeColor = 'text-slate-400';
    glowColor = 'shadow-[0_0_10px_rgba(148,163,184,0.2)]';
  }

  // Large variant with circular progress when score is provided
  if (score !== undefined) {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className={`inline-flex items-center gap-4 px-5 py-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 ${glowColor} transition-shadow duration-300`}>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={radius} className="stroke-slate-800" strokeWidth="4" fill="none" />
            <circle
              cx="22" cy="22" r={radius}
              className={`${strokeColor} transition-all duration-1000 ease-out`}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight">Risk Score</span>
          <span className={`text-base font-bold ${strokeColor}`}>{displayLabel}</span>
        </div>
      </div>
    );
  }

  // Small pill variant (used in history list)
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 ${strokeColor} ${glowColor} text-xs font-bold uppercase tracking-wider`}>
      <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
      {displayLabel}
    </div>
  );
}
