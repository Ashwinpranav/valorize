import React from 'react';
import { Sparkles, Check, MapPin, Scale, Layers, ChevronRight } from 'lucide-react';
import { BuyerMatch } from '../types';
import { Link } from 'react-router-dom';

interface MatchScoreCardProps {
  match: BuyerMatch;
  targetType?: 'listing' | 'requirement';
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({ match, targetType = 'listing' }) => {
  const score = Math.round(match.overall_score);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[#15803D] bg-[#DCFCE7] border-[#86EFAC]';
    if (s >= 60) return 'text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]';
    return 'text-[#B91C1C] bg-[#FEE2E2] border-[#FECACA]';
  };

  const targetLink =
    targetType === 'listing'
      ? `/marketplace/${match.listing_id}`
      : `/app/buyer/requirements`;

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#18324B]/10 text-[#18324B]">
              Lot #{match.listing_id} ↔ Req #{match.requirement_id}
            </span>
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#20A486]" /> Deterministic Match
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#1E293B] line-clamp-1">
            {match.listing?.title || match.requirement?.title || 'Industrial Match Candidate'}
          </h4>
        </div>

        {/* Big Score Gauge Badge */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl border text-base font-black ${getScoreColor(
            score
          )}`}
        >
          {score}%
        </div>
      </div>

      {/* 4-Factor Breakdown */}
      <div className="grid grid-cols-4 gap-2 py-2.5 border-y border-[#F1F5F9] my-2">
        <div className="text-center">
          <span className="text-[10px] text-[#64748B] block font-medium">Material (40%)</span>
          <span className="text-xs font-bold text-[#1E293B]">{Math.round(match.material_score)}%</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#64748B] block font-medium">Volume (25%)</span>
          <span className="text-xs font-bold text-[#1E293B]">{Math.round(match.quantity_score)}%</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#64748B] block font-medium">Proximity (20%)</span>
          <span className="text-xs font-bold text-[#1E293B]">{Math.round(match.proximity_score)}%</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#64748B] block font-medium">Grade (15%)</span>
          <span className="text-xs font-bold text-[#1E293B]">{Math.round(match.condition_score)}%</span>
        </div>
      </div>

      {/* Explanation text */}
      <p className="text-xs text-[#64748B] mt-2 mb-3 leading-relaxed">{match.explanation}</p>

      {/* Action */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-[#94A3B8] italic">
          *Ranking indicator, not a guaranteed transaction.
        </span>
        <Link
          to={targetLink}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#20A486] hover:text-[#17856C]"
        >
          <span>Inspect Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
