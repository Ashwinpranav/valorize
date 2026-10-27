import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();

  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]';
      case 'matched':
        return 'bg-[#F0FDFA] text-[#115E59] border-[#99F6E4]';
      case 'in negotiation':
      case 'negotiating':
      case 'offer made':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
      case 'agreed':
      case 'in transit':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
      case 'delivered':
      case 'completed':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'draft':
      case 'pending review':
        return 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]';
      case 'cancelled':
      case 'archived':
      case 'declined':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]';
    }
  };

  const getLabel = () => {
    switch (status.toLowerCase()) {
      case 'available': return t('statusAvailable');
      case 'matched': return t('statusMatched');
      case 'in negotiation':
      case 'negotiating': return t('statusNegotiating');
      case 'agreed': return t('statusAgreed');
      case 'in transit': return t('statusInTransit');
      case 'delivered': return t('statusDelivered');
      case 'completed': return t('statusCompleted');
      case 'draft': return t('statusDraft');
      case 'pending review': return t('statusPendingReview');
      case 'archived': return t('statusArchived');
      default: return status;
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${getStyle()} tracking-wide`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {getLabel()}
    </span>
  );
};

