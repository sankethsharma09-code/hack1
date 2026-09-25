import { useState, useEffect } from 'react';
import { History as HistoryIcon, X, Loader2 } from 'lucide-react';
import MessageHistoryItem from '../components/MessageHistoryItem';
import AnalysisResultCard from '../components/AnalysisResultCard';

export default function History() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/analyses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
      {/* History List */}
      <div className={`flex-1 ${selectedItem ? 'hidden md:block' : 'block'}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
            <HistoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Recent Analyses
          </h1>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400 font-medium">
              No analyses found. Go to the Analyzer to check a message.
            </div>
          ) : (
            history.map((item) => (
              <MessageHistoryItem 
                key={item.id} 
                item={item} 
                onClick={setSelectedItem} 
              />
            ))
          )}
        </div>
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="w-full md:w-5/12 lg:w-1/2">
          <div className="sticky top-24 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Details</h2>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl mb-6 shadow-sm dark:shadow-inner">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-500 mb-2 uppercase tracking-widest">Original Message</p>
              <p className="text-slate-900 dark:text-slate-200 italic font-medium">"{selectedItem.message}"</p>
            </div>

            <AnalysisResultCard result={selectedItem} />
          </div>
        </div>
      )}
    </div>
  );
}
