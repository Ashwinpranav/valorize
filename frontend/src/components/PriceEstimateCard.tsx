import React from 'react';
import { TrendingUp, AlertTriangle, Cpu, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PriceEstimateCardProps {
  unitPriceMin: number;
  unitPriceMax: number;
  totalPriceMin?: number;
  totalPriceMax?: number;
  currency?: string;
  unit?: string;
  modelName?: string;
  limitationsNotice?: string;
  isDemo?: boolean;
}

export const PriceEstimateCard: React.FC<PriceEstimateCardProps> = ({
  unitPriceMin,
  unitPriceMax,
  totalPriceMin,
  totalPriceMax,
  currency = 'INR',
  unit = 'KG',
  modelName = 'RandomForestRegressor-Scrap-v1.1',
  limitationsNotice = 'Indicative spot valuation only. Final trade price depends on physical lab assay and mutual terms.',
  isDemo = true,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#20A486]/10 flex items-center justify-center text-[#20A486]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18324B]">{t('aiValuation')}</h4>
            <span className="text-[11px] text-[#64748B]">Regional Industrial Cluster Benchmark</span>
          </div>
        </div>

        {isDemo && (
          <span className="text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full">
            Indicative Demo
          </span>
        )}
      </div>

      {/* Unit price highlight */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-3">
        <div className="text-xs text-[#15803D] font-medium mb-1">Estimated Unit Rate</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[#18324B]">
            ₹{unitPriceMin.toLocaleString()} – ₹{unitPriceMax.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-[#64748B]">/ {unit}</span>
        </div>
        {totalPriceMin && totalPriceMax && (
          <div className="mt-2 pt-2 border-t border-[#DCFCE7] flex items-center justify-between text-xs">
            <span className="text-[#64748B]">Est. Lot Gross:</span>
            <span className="font-bold text-[#18324B]">
              ₹{totalPriceMin.toLocaleString()} – ₹{totalPriceMax.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Model & Disclaimer */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
          <Cpu className="w-3.5 h-3.5 text-[#20A486]" />
          <span>Trained with {modelName}</span>
        </div>

        <div className="flex items-start gap-1.5 text-[11px] text-[#92400E] bg-[#FFFBEB] p-2.5 rounded-lg border border-[#FDE68A]">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{limitationsNotice}</span>
        </div>
      </div>
    </div>
  );
};
