import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, Building2, Weight, ArrowRight } from 'lucide-react';
import { WasteListing } from '../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

interface ListingCardProps {
  listing: WasteListing;
  onSave?: (id: number) => void;
  isSaved?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSave, isSaved }) => {
  const { t } = useLanguage();
  const primaryImage = listing.images && listing.images.length > 0 ? listing.images[0].image_url : null;

  return (
    <div className="bg-white rounded-card border border-[#E2E8F0] overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col group">
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] p-4 text-center">
            <Weight className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-xs font-medium">Industrial Scrap Lot</span>
          </div>
        )}

        {/* Status & Category overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="bg-[#18324B]/80 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-md">
            {listing.category_name || 'Industrial Scrap'}
          </span>
          <StatusBadge status={listing.status} size="sm" />
        </div>

        {/* AI Valuation Chip */}
        {listing.ai_estimated_price_min && listing.ai_estimated_price_max && (
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-[#E2E8F0] flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#20A486]" />
            <span className="text-[#64748B] font-medium">AI Est:</span>
            <span className="font-semibold text-[#18324B]">
              ₹{listing.ai_estimated_price_min} - ₹{listing.ai_estimated_price_max} /{listing.unit}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{listing.company_name || 'Industrial Supplier'}</span>
          </div>

          <Link to={`/marketplace/${listing.id}`}>
            <h3 className="text-base font-semibold text-[#1E293B] group-hover:text-[#20A486] transition-colors line-clamp-1">
              {listing.title}
            </h3>
          </Link>

          <p className="text-xs text-[#64748B] line-clamp-2 mt-1 mb-3">
            {listing.description || 'Verified industrial surplus material available for immediate procurement.'}
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
              <span className="text-[#94A3B8] font-normal">({listing.condition})</span>
            </div>

            <div className="flex items-center gap-1 text-[#64748B]">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="truncate max-w-[120px]">{listing.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[11px] text-[#64748B] block">Asking Price</span>
              <span className="text-sm font-bold text-[#18324B]">
                {listing.seller_price ? `₹${listing.seller_price.toLocaleString()} / ${listing.unit}` : 'Contact for Quote'}
              </span>
            </div>

            <Link
              to={`/marketplace/${listing.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#20A486] hover:bg-[#17856C] text-white transition-colors"
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
