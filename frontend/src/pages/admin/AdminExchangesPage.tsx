import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { ArrowLeftRight, Search, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';

export default function AdminExchangesPage() {
  const [data, setData] = useState<{ total_enquiries: number; total_transactions: number; transactions: any[] }>({
    total_enquiries: 0,
    total_transactions: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getExchanges();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const filtered = data.transactions.filter((t) =>
    t.transaction_code.toLowerCase().includes(search.toLowerCase()) ||
    t.listing_title.toLowerCase().includes(search.toLowerCase()) ||
    t.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    t.buyer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-[#20A486]" />
            Exchange & Transaction Management
          </h1>
          <p className="text-sm text-[#64748B]">
            Real-time audit of all cross-company enquiries, negotiated offers, and verified settlements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs text-[#64748B] font-medium">Platform Enquiries Logged</div>
          <div className="text-2xl font-extrabold text-[#18324B] mt-1">{data.total_enquiries}</div>
          <p className="text-xs text-slate-400 mt-1">Active negotiation channels between buyers and suppliers</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs text-[#64748B] font-medium">Commercial Transactions Executed</div>
          <div className="text-2xl font-extrabold text-[#20A486] mt-1">{data.total_transactions}</div>
          <p className="text-xs text-slate-400 mt-1">Binding circular exchange contracts with verified impact records</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by transaction code, material, supplier or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4 font-semibold">Code</th>
                <th className="py-3 px-4 font-semibold">Material</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Buyer</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Total Value</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#18324B]">
                      {t.transaction_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                      {t.listing_title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{t.supplier_name}</td>
                    <td className="py-3.5 px-4 text-slate-700">{t.buyer_name}</td>
                    <td className="py-3.5 px-4 font-medium">
                      {t.agreed_quantity} KG
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{t.total_amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/app/transactions/${t.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#20A486] font-medium hover:underline"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
