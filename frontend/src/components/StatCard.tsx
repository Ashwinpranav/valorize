import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  highlight = false,
}) => {
  return (
    <div
      className={`bg-white rounded-card p-5 border shadow-card transition-all hover:shadow-card-hover ${
        highlight ? 'border-[#20A486]/40 ring-1 ring-[#20A486]/20' : 'border-[#E2E8F0]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#64748B]">{title}</span>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            highlight ? 'bg-[#20A486]/10 text-[#20A486]' : 'bg-[#F0F4F8] text-[#18324B]'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-[#1E293B] tracking-tight">{value}</div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-[#DCFCE7] text-[#15803D]'
                : 'bg-[#FEE2E2] text-[#B91C1C]'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#64748B] mt-1.5">{subtitle}</p>}
    </div>
  );
};
