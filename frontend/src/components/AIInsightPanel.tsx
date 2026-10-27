import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AIInsightPanelProps {
  predictedCategory: string;
  confidence: number;
  rationale: string;
  isDemo?: boolean;
  modelName?: string;
  secondaryPredictions?: Array<{ category: string; confidence: number }>;
  onConfirm?: () => void;
  onSelectCategory?: (category: string) => void;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  predictedCategory,
  confidence,
  rationale,
  isDemo = true,
  modelName = 'MobileNetV2-Industrial-Transfer-v1.1',
  secondaryPredictions = [],
  onConfirm,
  onSelectCategory,
}) => {
  const { t } = useLanguage();
  const percentage = Math.round(confidence * 100);

  return (
    <div className="bg-white rounded-card border border-[#20A486]/30 p-5 shadow-card relative overflow-hidden">
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#18324B] via-[#20A486] to-[#4FD1C5]" />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#20A486]/10 text-[#20A486] text-xs font-semibold px-2 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              {t('aiClassification')}
            </span>
            {isDemo && (
              <span className="bg-[#FEF3C7] text-[#92400E] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                Demo Prediction
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-[#18324B] mt-1">{predictedCategory}</h4>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1 rounded-full text-xs font-bold text-[#15803D]">
            <ShieldCheck className="w-4 h-4 text-[#20A486]" />
            <span>{percentage}% Match</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] mt-1">{modelName}</span>
        </div>
      </div>

      {/* Computer Vision Rationale */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3.5 mb-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#20A486] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-[#334155] leading-relaxed">
            <span className="font-semibold text-[#18324B] block mb-0.5">Visual Feature Rationale:</span>
            {rationale}
          </div>
        </div>
      </div>

      {/* Secondary Predictions */}
      {secondaryPredictions && secondaryPredictions.length > 0 && (
        <div className="mb-4">
          <span className="text-xs font-semibold text-[#64748B] block mb-2">Secondary Model Candidates:</span>
          <div className="flex flex-wrap gap-2">
            {secondaryPredictions.map((cand, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cand.category)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] transition-colors flex items-center gap-1.5"
              >
                <span>{cand.category}</span>
                <span className="text-[10px] text-[#64748B]">({Math.round(cand.confidence * 100)}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
        <span className="text-[11px] text-[#64748B] italic">
          *Confidence alone does not prove composition. Please verify lot grade.
        </span>
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#20A486] hover:bg-[#17856C] text-white transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Material</span>
          </button>
        )}
      </div>
    </div>
  );
};
