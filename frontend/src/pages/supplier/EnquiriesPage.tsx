import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { enquiriesApi } from '../../services/api';
import { Enquiry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const EnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      setIsLoading(true);
      try {
        const data = await enquiriesApi.getEnquiries();
        setEnquiries(data);
      } catch (err) {
        console.error('Failed to load enquiries:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('enquiries')}</h2>
        <p className="text-xs text-[#64748B]">
          Direct buyer-supplier commercial negotiations and procurement dialogues
        </p>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading enquiry threads...</div>
        ) : enquiries.length > 0 ? (
          <div className="divide-y divide-[#F1F5F9]">
            {enquiries.map((e) => {
              const latestMsg = e.messages && e.messages.length > 0 ? e.messages[e.messages.length - 1] : null;
              return (
                <Link
                  key={e.id}
                  to={`/app/enquiries/${e.id}`}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors block"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#18324B]">Enquiry #{e.id}</span>
                      <span>•</span>
                      <span className="text-xs font-semibold text-[#20A486] truncate">
                        {e.listing_title}
                      </span>
                      <StatusBadge status={e.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>
                        Buyer: <strong className="text-[#1E293B]">{e.buyer_company_name}</strong> ↔ Supplier: <strong className="text-[#1E293B]">{e.supplier_company_name}</strong>
                      </span>
                    </div>

                    {latestMsg && (
                      <p className="text-xs text-[#64748B] italic truncate max-w-xl">
                        “{latestMsg.message_text}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-[#18324B] block">
                        {e.initial_quantity.toLocaleString()} Units Requested
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(e.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#18324B]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <MessageSquare className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">No Active Enquiries</h4>
            <p>Enquiries submitted on marketplace listings will appear here for negotiation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

