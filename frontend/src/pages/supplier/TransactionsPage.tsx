import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightLeft, ArrowRight, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { transactionsApi } from '../../services/api';
import { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      setIsLoading(true);
      try {
        const data = await transactionsApi.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTxs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('transactions')}</h2>
        <p className="text-xs text-[#64748B]">
          Active procurement contracts, dispatch milestones, and circular recovery records
        </p>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading transactions...</div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-[#F1F5F9]">
            {transactions.map((tx) => (
              <Link
                key={tx.id}
                to={`/app/transactions/${tx.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors block"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18324B]">Tx #{tx.id}</span>
                    <span>•</span>
                    <span className="text-xs font-semibold text-[#20A486] truncate">
                      {tx.listing_title}
                    </span>
                    <StatusBadge status={tx.status} size="sm" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>
                      Supplier: <strong className="text-[#1E293B]">{tx.supplier_company_name}</strong> ↔ Buyer: <strong className="text-[#1E293B]">{tx.buyer_company_name}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-[#475569]">
                    <span>Quantity: {tx.agreed_quantity.toLocaleString()} Units</span>
                    <span>Rate: ₹{tx.agreed_price_per_unit.toLocaleString()} / unit</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#15803D] block">
                      ₹{tx.total_amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#18324B]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <ArrowRightLeft className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">No Transactions Recorded Yet</h4>
            <p>Accepted commercial offers will automatically establish active transaction agreements here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

