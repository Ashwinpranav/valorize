import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { CheckCircle2, XCircle, Archive, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export default function AdminModerationPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reasonMap, setReasonMap] = useState<Record<number, string>>({});

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getListings();
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'archive') => {
    try {
      setActionLoading(id);
      const reason = reasonMap[id] || 'Standard moderation review';
      await adminApi.moderateListing(id, action, reason);
      await fetchModerationQueue();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#20A486]" />
            Listing Moderation & Quality Assurance
          </h1>
          <p className="text-sm text-[#64748B]">
            Review material listings for compliance, accurate documentation, and fair categorization.
          </p>
        </div>
        <button
          onClick={fetchModerationQueue}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#18324B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Queue
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Enterprise Moderation Policy:</span> All moderation actions (approvals, rejections, archival) are immutably logged to the platform audit trail with the administrator ID and timestamp.
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center text-slate-400">
            Loading listings for moderation...
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] text-center text-slate-400">
            No listings currently require moderation.
          </div>
        ) : (
          listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#1E293B] text-base">{item.title}</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-xs text-[#64748B] flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Supplier:</strong> {item.company_name}</span>
                  <span><strong>Category:</strong> {item.category_name}</span>
                  <span><strong>Quantity:</strong> {item.quantity} {item.unit}</span>
                  <span><strong>Price:</strong> ₹{item.seller_price?.toLocaleString('en-IN') || 'Open'}</span>
                  <span><strong>Location:</strong> {item.location}</span>
                </div>
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Optional review notes or reason..."
                    value={reasonMap[item.id] || ''}
                    onChange={(e) =>
                      setReasonMap({ ...reasonMap, [item.id]: e.target.value })
                    }
                    className="w-full text-xs px-3 py-1.5 border border-[#E2E8F0] rounded bg-slate-50 focus:bg-white focus:outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(item.id, 'approve')}
                  disabled={actionLoading === item.id || item.status === 'Available'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approve (Publish)
                </button>
                <button
                  onClick={() => handleAction(item.id, 'reject')}
                  disabled={actionLoading === item.id || item.status === 'Pending Review'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition disabled:opacity-40"
                >
                  <XCircle className="w-4 h-4 text-amber-600" />
                  Hold / Flag
                </button>
                <button
                  onClick={() => handleAction(item.id, 'archive')}
                  disabled={actionLoading === item.id || item.status === 'Archived'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-40"
                >
                  <Archive className="w-4 h-4 text-slate-500" />
                  Archive
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
