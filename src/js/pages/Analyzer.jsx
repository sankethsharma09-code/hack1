import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import AnalysisResultCard from '../components/AnalysisResultCard';

export default function Analyzer() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      // Safely parse the response — .json() throws on empty/non-JSON bodies
      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        // Server returned something non-JSON (e.g. HTML error page or empty body)
        throw new Error(
          response.ok
            ? 'AI service returned an unexpected response. Please try again.'
            : `Server error (${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || `Analysis failed (${response.status}). Please try again.`);
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');

    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
          Analyze a Message
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Paste any suspicious text message, email, or social media DM below.
          Our AI will check it for phishing, spoofing, and scam tactics in real time.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/10 p-6 sm:p-8 mb-8 transition-transform duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Message Content
        </label>
        <textarea
          rows={6}
          className="w-full p-5 bg-slate-950/50 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder:text-slate-600 resize-none mb-2 shadow-inner"
          placeholder="Paste a suspicious message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className="text-xs text-slate-600 mb-5">Tip: Press Ctrl+Enter to analyze quickly</p>

        {error && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing}
            className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl hover:from-indigo-400 hover:to-violet-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
          </button>
        </div>
      </div>

      {result ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <AnalysisResultCard result={result} />
        </div>
      ) : !isAnalyzing && (
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-dashed border-white/10 p-12 text-center transition-all duration-300">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-5 border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Waiting for input</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Paste a message above and click Analyze to see the full safety breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
