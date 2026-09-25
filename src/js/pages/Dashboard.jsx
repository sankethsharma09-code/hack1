import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, AlertTriangle, Flag, Loader2 } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/analyses/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-rose-500">
        {error}
      </div>
    );
  }

  const maxRisk = stats.trend ? Math.max(...stats.trend.map(d => d.riskScore), 1) : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          Your Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Analyzed" 
          value={stats.total} 
          icon={FileText}
        />
        <StatCard 
          title="Flagged as Risky" 
          value={`${stats.flaggedPercent}%`} 
          icon={AlertTriangle}
        />
        <StatCard 
          title="Common Red Flag" 
          value={stats.commonRedFlag || 'None detected'} 
          subtitle="Frequent in risky texts"
          icon={Flag}
          valueClassName="text-sm sm:text-base font-semibold text-white/95 leading-snug line-clamp-3"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-8">
          Risk Trend (Last 7 Days)
        </h3>
        
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4">
          {stats.trend && stats.trend.map((data, index) => {
            const heightPercent = maxRisk > 0 ? (data.riskScore / maxRisk) * 100 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end">
                <div className="relative w-full flex justify-center h-[200px] items-end pb-2">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {data.riskScore} risky msgs
                  </div>
                  <div 
                    className="w-full max-w-[3rem] bg-gradient-to-t from-indigo-900/50 to-indigo-500/80 group-hover:to-cyan-400/80 rounded-t-lg transition-all duration-500 relative border-t border-x border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                  >
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
