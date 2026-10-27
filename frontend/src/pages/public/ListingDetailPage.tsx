import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Weight,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowLeft,
  Calendar,
  AlertCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { StatusBadge } from '../../components/StatusBadge';
import { PriceEstimateCard } from '../../components/PriceEstimateCard';
import { listingsApi, enquiriesApi } from '../../services/api';
import { WasteListing } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listing, setListing] = useState<WasteListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enquiry state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryQty, setEnquiryQty] = useState<number>(0);
  const [enquiryMsg, setEnquiryMsg] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      setIsLoading(true);
      try {
        const data = await listingsApi.getListing(parseInt(listingId, 10));
        setListing(data);
        setEnquiryQty(data.quantity);
      } catch (err: any) {
        setError('Listing not found or currently unavailable.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!listing) return;

    setIsSubmittingEnquiry(true);
    try {
      const res = await enquiriesApi.createEnquiry({
        listing_id: listing.id,
        initial_quantity: enquiryQty,
        initial_message: enquiryMsg.trim(),
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        navigate(`/app/enquiries/${res.id}`);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit enquiry');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <PublicNavbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-64 bg-[#E2E8F0] rounded-card" />
            <div className="h-6 bg-[#E2E8F0] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-[#E2E8F0] rounded w-1/2 mx-auto" />
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
        <PublicNavbar />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#B91C1C] mx-auto" />
          <h2 className="text-xl font-bold text-[#18324B]">{error || 'Lot Not Found'}</h2>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#20A486] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const primaryImage =
    listing.images && listing.images.length > 0
      ? listing.images[0].image_url
      : 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <PublicNavbar />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-[#E2E8F0] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <Link to="/marketplace" className="hover:text-[#20A486] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
            <span>/</span>
            <span className="text-[#18324B] font-semibold truncate max-w-xs">{listing.title}</span>
          </div>

          <StatusBadge status={listing.status} />
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual & Material specs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Visual Box */}
            <div className="bg-white rounded-card overflow-hidden border border-[#E2E8F0] shadow-card">
              <div className="aspect-[16/10] bg-[#18324B] relative overflow-hidden">
                <img
                  src={primaryImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#18324B]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#20A486]" />
                  <span>Physical Assay Verified</span>
                </div>
              </div>

              {/* Title & Key Meta */}
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
                    {listing.category_name} • Lot #{listing.id}
                  </span>
                  <h1 className="text-2xl font-black text-[#18324B] mt-1">{listing.title}</h1>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#F1F5F9]">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">Available Net Weight</span>
                    <span className="text-base font-bold text-[#18324B]">
                      {listing.quantity.toLocaleString()} {listing.unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#64748B] block">Condition Grade</span>
                    <span className="text-base font-bold text-[#18324B]">{listing.condition}</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#64748B] block">Regional Depot</span>
                    <span className="text-base font-bold text-[#18324B] truncate block">
                      {listing.location}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#64748B] block">Declared On</span>
                    <span className="text-base font-bold text-[#18324B]">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-[#18324B] uppercase tracking-wider mb-2">
                    Material Specification & Assay Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-[#486581] leading-relaxed whitespace-pre-line">
                    {listing.description || 'No additional technical specifications provided for this lot.'}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Indicative Valuation Section */}
            {listing.ai_estimated_price_min && listing.ai_estimated_price_max && (
              <PriceEstimateCard
                unitPriceMin={listing.ai_estimated_price_min}
                unitPriceMax={listing.ai_estimated_price_max}
                totalPriceMin={round(listing.ai_estimated_price_min * listing.quantity, 2)}
                totalPriceMax={round(listing.ai_estimated_price_max * listing.quantity, 2)}
                unit={listing.unit}
                isDemo={true}
              />
            )}
          </div>

          {/* Right Column: Commercial Quote & Action Box */}
          <div className="lg:col-span-4 space-y-6">
            {/* Commercial Action Card */}
            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card space-y-6 sticky top-24">
              <div>
                <span className="text-xs text-[#64748B] block">Seller Asking Rate</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#18324B]">
                    {listing.seller_price ? `₹${listing.seller_price.toLocaleString()}` : 'Quote on Request'}
                  </span>
                  {listing.seller_price && (
                    <span className="text-sm font-semibold text-[#64748B]">/ {listing.unit}</span>
                  )}
                </div>
                {listing.seller_price && (
                  <span className="text-xs text-[#15803D] font-semibold block mt-1">
                    Est. Total Asking Value: ₹{(listing.seller_price * listing.quantity).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Verified Supplier Box */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Originating Supplier
                </span>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#20A486]" />
                  <span className="text-sm font-bold text-[#18324B] truncate">
                    {listing.company_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#15803D] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Corporate KYC</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full h-12 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Enquiry & Negotiate</span>
                </button>
              </div>

              <p className="text-[11px] text-[#94A3B8] text-center italic">
                *Valorize provides deterministic buyer matching and secure transaction escrow terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#18324B]">Initiate Procurement Enquiry</h3>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-[#94A3B8] hover:text-[#18324B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {enquirySuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h4 className="text-base font-bold text-[#18324B]">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-[#64748B]">Redirecting to the negotiation conversation...</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">
                    Requested Volume ({listing.unit})
                  </label>
                  <input
                    type="number"
                    value={enquiryQty}
                    onChange={(e) => setEnquiryQty(parseFloat(e.target.value) || 0)}
                    max={listing.quantity}
                    min={1}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                  />
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">
                    Available in lot: {listing.quantity} {listing.unit}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">
                    Initial Message or Special Instructions
                  </label>
                  <textarea
                    value={enquiryMsg}
                    onChange={(e) => setEnquiryMsg(e.target.value)}
                    rows={3}
                    placeholder="We are interested in this lot for secondary remelting. Can we verify moisture content?"
                    className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEnquiry}
                    className="px-5 py-2 rounded-lg bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    {isSubmittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};

function round(val: number, decimals: number = 2) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}
