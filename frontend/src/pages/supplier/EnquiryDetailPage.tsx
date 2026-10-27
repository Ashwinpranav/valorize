import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Building2,
  CheckCircle2,
  DollarSign,
  FileCheck,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { enquiriesApi } from '../../services/api';
import { Enquiry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const EnquiryDetailPage: React.FC = () => {
  const { enquiryId } = useParams<{ enquiryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerQty, setOfferQty] = useState<number>(0);
  const [offerNotes, setOfferNotes] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const fetchEnquiry = async () => {
    if (!enquiryId) return;
    try {
      const data = await enquiriesApi.getEnquiry(parseInt(enquiryId, 10));
      setEnquiry(data);
      if (data) {
        setOfferQty(data.initial_quantity);
      }
    } catch (err) {
      console.error('Failed to load enquiry:', err);
    }
  };

  useEffect(() => {
    fetchEnquiry();
  }, [enquiryId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !enquiryId) return;
    setIsSending(true);
    try {
      await enquiriesApi.sendMessage(parseInt(enquiryId, 10), {
        message_text: replyText.trim(),
      });
      setReplyText('');
      await fetchEnquiry();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryId || offerPrice <= 0 || offerQty <= 0) return;
    setIsSubmittingOffer(true);
    try {
      await enquiriesApi.submitOffer(parseInt(enquiryId, 10), {
        offered_price_per_unit: offerPrice,
        offered_quantity: offerQty,
        notes: offerNotes.trim(),
        currency: 'INR',
      });
      setShowOfferModal(false);
      setOfferNotes('');
      await fetchEnquiry();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit commercial offer');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!enquiryId) return;
    if (!window.confirm('Accept this offer and initiate formal transaction contract?')) return;
    try {
      const res = await enquiriesApi.acceptOffer(parseInt(enquiryId, 10), offerId);
      alert('Offer accepted! Transaction agreement has been initiated.');
      navigate(`/app/transactions/${res.transaction_id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept offer');
    }
  };

  if (!enquiry) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Loading negotiation thread...</div>;
  }

  const isMyCompanyBuyer = user?.company?.id === enquiry.buyer_company_id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <Link
            to="/app/enquiries"
            className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-[#18324B] hover:bg-[#F1F5F9]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#18324B]">Enquiry #{enquiry.id}</h2>
              <StatusBadge status={enquiry.status} size="sm" />
            </div>
            <span className="text-xs text-[#64748B]">
              Ref Lot: <strong>{enquiry.listing_title}</strong> (Listing #{enquiry.listing_id})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOfferModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Make Formal Commercial Offer</span>
        </button>
      </div>

      {/* Two column layout: Chat on left, Offers on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat / Negotiation Log (Left) */}
        <div className="lg:col-span-7 bg-white rounded-card border border-[#E2E8F0] shadow-card flex flex-col h-[560px]">
          <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between">
            <span className="text-xs font-bold text-[#18324B]">Negotiation History</span>
            <span className="text-[11px] text-[#64748B]">
              {enquiry.buyer_company_name} ↔ {enquiry.supplier_company_name}
            </span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {enquiry.messages.map((m) => {
              const isMine = m.sender_user_id === user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-[10px] text-[#64748B] mb-0.5">
                    {m.sender_company_name} ({m.sender_user_name})
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-[#18324B] text-white rounded-br-xs'
                        : 'bg-[#F1F5F9] text-[#1E293B] rounded-bl-xs'
                    }`}
                  >
                    {m.message_text}
                  </div>
                  <span className="text-[9px] text-[#94A3B8] mt-0.5">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reply input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#F1F5F9] flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message or inspection terms..."
              className="flex-1 h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
            />
            <button
              type="submit"
              disabled={isSending || !replyText.trim()}
              className="px-4 h-10 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Commercial Offers Box (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#20A486]" />
                <h3 className="text-sm font-bold text-[#18324B]">Commercial Offers</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E6FFFA] text-[#116552]">
                {enquiry.offers.length} Recorded
              </span>
            </div>

            {enquiry.offers.length > 0 ? (
              <div className="space-y-3">
                {enquiry.offers.map((offer) => {
                  const isSenderMine = offer.sender_company_id === user?.company?.id;
                  return (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-xl border transition-all ${
                        offer.status === 'Accepted'
                          ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#64748B]">
                          Offer from {offer.sender_company_name}
                        </span>
                        <StatusBadge status={offer.status} size="sm" />
                      </div>

                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-lg font-black text-[#18324B]">
                          ₹{offer.offered_price_per_unit.toLocaleString()} / unit
                        </span>
                        <span className="text-xs font-semibold text-[#64748B]">
                          Qty: {offer.offered_quantity.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#15803D] pt-1 border-t border-[#E2E8F0]/60 flex items-center justify-between">
                        <span>Total Commercial Value:</span>
                        <span>₹{offer.total_amount.toLocaleString()}</span>
                      </div>

                      {offer.notes && (
                        <p className="text-[11px] text-[#64748B] italic mt-2 bg-white/70 p-2 rounded">
                          “{offer.notes}”
                        </p>
                      )}

                      {/* Accept button for recipient */}
                      {!isSenderMine && offer.status === 'Pending' && (
                        <div className="mt-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptOffer(offer.id)}
                            className="w-full py-2 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Offer & Proceed to Contract</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
                <p>No formal commercial offers submitted yet.</p>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="text-xs font-bold text-[#20A486] hover:underline"
                >
                  + Submit Proposed Terms
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#18324B]">Submit Commercial Term Sheet</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-[#94A3B8] hover:text-[#18324B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">
                  Proposed Unit Price (₹ / unit)
                </label>
                <input
                  type="number"
                  value={offerPrice || ''}
                  onChange={(e) => setOfferPrice(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 710"
                  required
                  min={1}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-bold outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">
                  Lot Quantity to Procure
                </label>
                <input
                  type="number"
                  value={offerQty || ''}
                  onChange={(e) => setOfferQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 850"
                  required
                  min={1}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-bold outline-none focus:border-[#20A486]"
                />
              </div>

              {offerPrice > 0 && offerQty > 0 && (
                <div className="p-3 bg-[#F0FDF4] rounded-lg border border-[#BBF7D0] flex items-center justify-between text-xs">
                  <span className="text-[#15803D] font-semibold">Total Gross Amount:</span>
                  <span className="text-sm font-black text-[#15803D]">
                    ₹{(offerPrice * offerQty).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">
                  Commercial Terms & Notes
                </label>
                <textarea
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Ex-factory dispatch, weighbridge receipt slip required before final settlement."
                  className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded-lg text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="px-5 py-2 bg-[#20A486] hover:bg-[#17856C] text-white rounded-lg text-xs font-bold"
                >
                  {isSubmittingOffer ? 'Submitting...' : 'Submit Commercial Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
