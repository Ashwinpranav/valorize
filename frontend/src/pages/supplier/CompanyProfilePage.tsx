import React from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CompanyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const company = user?.company;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('companyProfile')}</h2>
        <p className="text-xs text-[#64748B]">
          Corporate identity, facility registration, and KYC verification records
        </p>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-6">
        {/* Company Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#18324B] text-white flex items-center justify-center font-black text-xl">
              {company?.name ? company.name.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#18324B]">{company?.name || 'My Industrial Company'}</h3>
                {company?.verified && (
                  <span className="inline-flex items-center gap-1 bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#20A486]" />
                    Verified KYC
                  </span>
                )}
              </div>
              <span className="text-xs text-[#64748B]">
                {company?.industry || 'Industrial Manufacturing'} • Registered Corporate Exchanger
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Primary Manufacturing Plant
            </label>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold text-[#18324B] block">{company?.address || 'SIDCO Industrial Estate'}</span>
              <span className="text-[#64748B] block">
                {company?.city}, {company?.state}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Authorized Trade Representative
            </label>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
              <span className="font-bold text-[#18324B] block">{user?.full_name}</span>
              <span className="text-[#64748B] block">{user?.email}</span>
              <span className="text-[#64748B] block">{user?.phone || 'Phone not registered'}</span>
            </div>
          </div>
        </div>

        {/* Circular Certification Stamp */}
        <div className="p-4 bg-[#E6FFFA] rounded-xl border border-[#20A486]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#20A486]" />
            <div>
              <h4 className="text-xs font-bold text-[#116552]">Tamil Nadu Circularity Accredited Partner</h4>
              <p className="text-[11px] text-[#0C4A3C]">
                Facility adheres to transparent weighbridge and secondary resource lifecycle tracking.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#116552]">Grade A</span>
        </div>
      </div>
    </div>
  );
};
