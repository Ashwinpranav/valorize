import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { MatchScoreCard } from '../../components/MatchScoreCard';
import { requirementsApi } from '../../services/api';
import { BuyerMatch } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const SupplierMatchesPage: React.FC = () => {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [minScore, setMinScore] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const data = await requirementsApi.getMatches({ min_score: minScore });
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [minScore]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#18324B]">{t('buyerMatches')}</h2>
            <span className="text-xs font-bold bg-[#E6FFFA] text-[#116552] border border-[#20A486]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#20A486]" /> Deterministic Scoring
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time ranked matching between your inventory lots and active buyer procurement requests.
          </p>
        </div>

        {/* Filter by score */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-[#64748B]">Min Score:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
            className="h-9 px-3 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#18324B] bg-white outline-none focus:border-[#20A486]"
          >
            <option value="30">≥ 30% Match</option>
            <option value="50">≥ 50% Match</option>
            <option value="75">≥ 75% Strong Match</option>
            <option value="90">≥ 90% High Precision</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#64748B]">Computing deterministic compatibility...</div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m, i) => (
            <MatchScoreCard key={i} match={m} targetType="requirement" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-card p-12 text-center border border-[#E2E8F0] shadow-card space-y-3">
          <AlertCircle className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h3 className="text-base font-bold text-[#18324B]">No matches meet this score threshold</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            Try lowering the minimum score filter to inspect partial material or volume fits.
          </p>
          <button
            onClick={() => setMinScore(30)}
            className="px-4 py-2 bg-[#20A486] text-white text-xs font-bold rounded-lg"
          >
            Reset to ≥ 30% Match
          </button>
        </div>
      )}
    </div>
  );
};

