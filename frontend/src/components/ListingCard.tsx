import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Building2, Weight, ArrowRight, ShieldCheck, Bookmark, Globe } from 'lucide-react';
import { WasteListing } from '../types';
import { StatusBadge } from './StatusBadge';
import { MaterialImage } from './MaterialImage';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';

interface ListingCardProps {
  listing: WasteListing;
  onSave?: (id: number) => void;
  isSaved?: boolean;
  userCoords?: { latitude: number; longitude: number } | null;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSave,
  isSaved,
  userCoords,
}) => {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // Distance calculation if userCoords provided
  const calculateDistanceKm = (): number | null => {
    if (!userCoords || !listing.latitude || !listing.longitude) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((listing.latitude - userCoords.latitude) * Math.PI) / 180;
    const dLon = ((listing.longitude - userCoords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.latitude * Math.PI) / 180) *
        Math.cos((listing.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distanceKm = calculateDistanceKm();

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col group hover:-translate-y-0.5">
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-[#0F172A] overflow-hidden">
        <MaterialImage
          images={listing.images}
          categoryName={listing.category_name}
          title={listing.title}
          alt={listing.title}
          showControls={true}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="bg-[#18324B]/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/10 uppercase tracking-wide">
            {listing.category_name || 'Industrial Material'}
          </span>
          <div className="pointer-events-auto">
            <StatusBadge status={listing.status} size="sm" />
          </div>
        </div>

        {/* Bookmark button */}
        {onSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(listing.id);
            }}
            className={`absolute top-2.5 right-20 w-7 h-7 rounded-full flex items-center justify-center transition-all z-10 ${
              isSaved
                ? 'bg-[#20A486] text-white'
                : 'bg-white/80 text-[#1E293B] hover:bg-white hover:text-[#20A486]'
            } shadow-sm backdrop-blur-sm`}
            title={isSaved ? 'Saved to bookmarks' : 'Save listing'}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        )}

        {/* AI Valuation Chip */}
        {listing.ai_estimated_price_min && listing.ai_estimated_price_max && (
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-[#E2E8F0] flex items-center gap-1.5 text-xs z-10">
            <Sparkles className="w-3.5 h-3.5 text-[#20A486]" />
            <span className="text-[#64748B] font-medium text-[11px]">AI Est:</span>
            <span className="font-bold text-[#18324B] text-[11px]">
              {formatPrice(listing.ai_estimated_price_min)} - {formatPrice(listing.ai_estimated_price_max)} /{listing.unit}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Supplier & Verification */}
          <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5">
            <div className="flex items-center gap-1.5 truncate max-w-[70%]">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span className="truncate font-medium text-slate-700">
                {listing.company_name || 'Verified Industrial Supplier'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          </div>

          {/* Title */}
          <Link to={`/marketplace/${listing.id}`}>
            <h3 className="text-sm md:text-base font-bold text-[#1E293B] group-hover:text-[#20A486] transition-colors line-clamp-1 leading-snug">
              {listing.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-[#64748B] line-clamp-2 mt-1 mb-3">
            {listing.description || 'Verified industrial secondary resource lot ready for immediate procurement.'}
          </p>
        </div>

        {/* Specs footer */}
        <div className="pt-3 border-t border-[#F1F5F9] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[#1E293B] font-semibold">
              <Weight className="w-3.5 h-3.5 text-[#20A486]" />
              <span>
                {listing.quantity.toLocaleString()} {listing.unit}
              </span>
              <span className="text-xs font-normal text-slate-500">
                • {listing.condition}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[#64748B] text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#20A486] flex-shrink-0" />
              <span className="truncate max-w-[130px]">{listing.location}</span>
              {distanceKm !== null && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  {distanceKm} km
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] font-medium text-[#64748B] block uppercase tracking-wider">
                Asking Price
              </span>
              <span className="text-sm font-extrabold text-[#18324B]">
                {listing.seller_price
                  ? `${formatPrice(listing.seller_price)} / ${listing.unit}`
                  : 'Open for Bids'}
              </span>
            </div>

            <Link
              to={`/marketplace/${listing.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#20A486] hover:bg-[#18836b] text-white transition-colors shadow-sm"
            >
              <span>{t('viewDetails')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
