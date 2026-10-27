import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsApi } from '../../services/api';
import { WasteListing, MaterialCategory } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const EditListingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('KG');
  const [condition, setCondition] = useState('Recyclable');
  const [sellerPrice, setSellerPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!listingId) return;
      setIsLoading(true);
      try {
        const [cats, listing] = await Promise.all([
          listingsApi.getCategories(),
          listingsApi.getListing(parseInt(listingId, 10)),
        ]);
        setCategories(cats);
        setTitle(listing.title);
        setCategoryId(listing.category_id);
        setQuantity(listing.quantity);
        setUnit(listing.unit);
        setCondition(listing.condition);
        setSellerPrice(listing.seller_price ?? '');
        setLocation(listing.location);
        setDescription(listing.description || '');
        setStatus(listing.status);
      } catch (err: any) {
        setError('Failed to load listing for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) return;
    setIsSaving(true);
    setError(null);

    try {
      await listingsApi.updateListing(parseInt(listingId, 10), {
        title: title.trim(),
        category_id: Number(categoryId),
        quantity: Number(quantity),
        unit,
        condition,
        seller_price: sellerPrice ? Number(sellerPrice) : null,
        location: location.trim(),
        description: description.trim(),
        status,
      });
      navigate('/app/supplier/listings');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Loading lot specifications...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">Edit Lot #{listingId}</h2>
        <p className="text-xs text-[#64748B]">Update volume, asking price, or operational status</p>
      </div>

      {error && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <div>
          <label className="text-xs font-bold text-[#18324B] block mb-1">Lot Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Material Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Physical Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
            >
              <option value="Recyclable">Recyclable</option>
              <option value="Reusable">Reusable</option>
              <option value="Repairable">Repairable</option>
              <option value="New Surplus">New Surplus</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Net Weight ({unit})</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              required
              min={1}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Seller Asking Price (₹/{unit})</label>
            <input
              type="number"
              value={sellerPrice}
              onChange={(e) => setSellerPrice(parseFloat(e.target.value) || '')}
              placeholder="Leave empty for quote on request"
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Depot Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Listing Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
            >
              <option value="Available">Available (Active on Marketplace)</option>
              <option value="Draft">Draft (Hidden)</option>
              <option value="Reserved">Reserved (Offer Under Review)</option>
              <option value="Completed">Completed (Sold & Dispatched)</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#18324B] block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/supplier/listings')}
            className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#64748B]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 bg-[#20A486] hover:bg-[#17856C] text-white rounded-xl text-xs font-bold"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
