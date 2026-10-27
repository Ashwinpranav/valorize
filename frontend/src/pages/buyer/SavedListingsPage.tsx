import React, { useState, useEffect } from 'react';
import { Bookmark, AlertCircle } from 'lucide-react';
import { ListingCard } from '../../components/ListingCard';
import { listingsApi } from '../../services/api';
import { WasteListing } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const SavedListingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [savedListings, setSavedListings] = useState<WasteListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      try {
        const data = await listingsApi.getSavedListings();
        setSavedListings(data);
      } catch (err) {
        console.error('Error fetching saved listings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaved();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('savedListings')}</h2>
        <p className="text-xs text-[#64748B]">Bookmarked industrial scrap lots for ongoing monitoring</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-[#64748B]">Loading bookmarked lots...</div>
      ) : savedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-card p-12 text-center border border-[#E2E8F0] shadow-card space-y-3">
          <Bookmark className="w-10 h-10 text-[#94A3B8] mx-auto" />
          <h4 className="text-sm font-bold text-[#18324B]">No Saved Lots Yet</h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You can bookmark candidate materials directly on the marketplace to track price movements.
          </p>
        </div>
      )}
    </div>
  );
};

