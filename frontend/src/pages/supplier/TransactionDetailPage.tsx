import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Calendar,
  Building2,
  Scale,
  Recycle,
  ShieldCheck,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { transactionsApi } from '../../services/api';
import { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const TransactionDetailPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState('In Transit');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const fetchTx = async () => {
    if (!transactionId) return;
    try {
      const data = await transactionsApi.getTransaction(parseInt(transactionId, 10));
      setTx(data);
    } catch (err) {
      console.error('Failed to load transaction:', err);
    }
  };

  useEffect(() => {
    fetchTx();
  }, [transactionId]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !eventDesc.trim()) return;
    setIsSubmittingEvent(true);
    try {
      await transactionsApi.addEvent(parseInt(transactionId, 10), {
        event_type: eventType,
        description: eventDesc.trim(),
      });
      setShowEventModal(false);
      setEventDesc('');
      await fetchTx();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update milestone event');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  if (!tx) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Loading transaction contract...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <Link
            to="/app/transactions"
            className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-[#18324B] hover:bg-[#F1F5F9]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#18324B]">Transaction Agreement #{tx.id}</h2>
              <StatusBadge status={tx.status} />
            </div>
            <span className="text-xs text-[#64748B]">
              Ref Lot: <strong>{tx.listing_title}</strong> (Listing #{tx.listing_id})
            </span>
          </div>
        </div>

        {tx.status !== 'Completed' && (
          <button
            type="button"
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Update Logistics Milestone</span>
          </button>
        )}
      </div>

      {/* Agreed Terms Card */}
      <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card">
        <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-4">
          Agreed Commercial Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-[#64748B] block">Originating Supplier</span>
            <span className="text-sm font-bold text-[#18324B] truncate block">
              {tx.supplier_company_name}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#64748B] block">Procuring Buyer</span>
            <span className="text-sm font-bold text-[#18324B] truncate block">
              {tx.buyer_company_name}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#64748B] block">Agreed Volume & Rate</span>
            <span className="text-sm font-bold text-[#18324B]">
              {tx.agreed_quantity.toLocaleString()} Units @ ₹{tx.agreed_price_per_unit.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#64748B] block">Total Contract Settlement</span>
            <span className="text-base font-black text-[#15803D]">
              ₹{tx.total_amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Verified Circular Impact Certificate (If completed) */}
      {tx.status === 'Completed' && (
        <div className="bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] border border-[#BBF7D0] rounded-card p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] uppercase tracking-wider">
            <Recycle className="w-4 h-4" />
            <span>Certified Circular Recovery Completed</span>
          </div>
          <h3 className="text-lg font-black text-[#18324B]">
            Verifiable Environmental Avoidance Certificate
          </h3>
          <p className="text-xs text-[#334155] leading-relaxed max-w-2xl">
            This transaction successfully diverted{' '}
            <strong className="text-[#18324B]">{tx.agreed_quantity.toLocaleString()} KG</strong> of
            secondary material into circular manufacturing loops, avoiding landfill accumulation and
            approximately{' '}
            <strong className="text-[#15803D]">
              {(tx.agreed_quantity * 3.4).toLocaleString()} KG CO2e
            </strong>{' '}
            in primary extraction emissions.
          </p>
          <span className="text-[10px] text-[#64748B] block italic">
            *Verified using published Bureau of International Recycling (BIR) life-cycle assessment models.
          </span>
        </div>
      )}

      {/* Event Milestones Timeline */}
      <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#18324B]">Logistics & Verification Timeline</h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
          {tx.events.map((ev, i) => (
            <div key={ev.id} className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#20A486] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div className="flex-1 bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#18324B]">{ev.event_type}</span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {new Date(ev.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#486581]">{ev.description}</p>
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Logged by: {ev.actor_name || 'System Representative'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Milestone Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#18324B]">Update Exchange Milestone</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-[#94A3B8] hover:text-[#18324B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Milestone Status</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-bold outline-none focus:border-[#20A486] bg-white"
                >
                  <option value="Dispatch Initiated">Dispatch Initiated (Loaded into Transport)</option>
                  <option value="In Transit">In Transit (En Route to Plant)</option>
                  <option value="Weight Verified">Weight Verified (Weighbridge Slip Slip Attached)</option>
                  <option value="Completed">Completed (Material Received & Verified)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">
                  Milestone Details & Slip Numbers
                </label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Weighbridge gross verified at 1,250 KG. Transport TN 38 BH 4012."
                  className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 bg-[#20A486] hover:bg-[#17856C] text-white rounded-lg text-xs font-bold"
                >
                  {isSubmittingEvent ? 'Recording...' : 'Record Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

