import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi } from '../../services/api';
import { WasteListing, MaterialCategory } from '../../types';
import {
  AlertCircle,
  CheckCircle2,
  Camera,
  Upload,
  Sparkles,
  MapPin,
  Layers,
  Star,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { LocationPickerMap } from '../../components/LocationPickerMap';
import { MaterialImage } from '../../components/MaterialImage';
import { useCurrency } from '../../context/CurrencyContext';

interface UploadedImageItem {
  url: string;
  isPrimary: boolean;
}

export const EditListingPage: React.FC = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { currency } = useCurrency();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('KG');
  const [condition, setCondition] = useState('Recyclable');
  const [sellerPrice, setSellerPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Available');

  // Images state
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        setLatitude(listing.latitude ?? null);
        setLongitude(listing.longitude ?? null);
        setDescription(listing.description || '');
        setStatus(listing.status);

        if (listing.images && listing.images.length > 0) {
          setImages(
            listing.images.map((img, idx) => ({
              url: img.image_url,
              isPrimary: img.is_primary || idx === 0,
            }))
          );
        }
      } catch (err: any) {
        setError('Failed to load listing for editing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [listingId]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    setIsUploadingImage(true);
    setError(null);

    try {
      const uploadedItems: UploadedImageItem[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const res = await listingsApi.uploadImage(selectedFiles[i]);
        uploadedItems.push({
          url: res.image_url,
          isPrimary: images.length === 0 && i === 0,
        });
      }

      const updated = [...images, ...uploadedItems];
      if (!updated.some((i) => i.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      setImages(updated);
    } catch (err: any) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((item, idx) => ({
        ...item,
        isPrimary: idx === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) return;
    setIsSaving(true);
    setError(null);

    try {
      const orderedUrls = [...images]
        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        .map((img) => img.url);

      await listingsApi.updateListing(parseInt(listingId, 10), {
        title: title.trim(),
        category_id: Number(categoryId),
        quantity: Number(quantity),
        unit,
        condition,
        seller_price: sellerPrice ? Number(sellerPrice) : null,
        location: location.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        description: description.trim(),
        status,
        image_urls: orderedUrls,
      });
      navigate('/app/supplier/listings');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#20A486] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-semibold text-[#64748B]">Loading lot specifications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">Edit Lot #{listingId}</h2>
        <p className="text-xs text-[#64748B]">Update volume, asking price, images, or GPS coordinates</p>
      </div>

      {error && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images section */}
        <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#20A486]" />
              <span>Lot Photos & Gallery</span>
            </h3>
            <span className="text-xs font-semibold text-[#64748B]">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </div>

          <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 text-center hover:border-[#20A486] transition-colors bg-[#F8FAFC]">
            <input
              id="edit_photo_upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <label htmlFor="edit_photo_upload" className="cursor-pointer block space-y-1">
              <Upload className="w-6 h-6 text-[#94A3B8] mx-auto" />
              <span className="text-xs font-bold text-[#18324B] block">
                Click to add more photos
              </span>
            </label>
            {isUploadingImage && (
              <span className="text-xs text-[#20A486] font-semibold mt-1 inline-block">
                Uploading photo...
              </span>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-video bg-black/5 ${
                    img.isPrimary ? 'border-[#20A486] ring-2 ring-[#20A486]/20' : 'border-[#E2E8F0]'
                  }`}
                >
                  <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 bg-[#20A486] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="p-1.5 bg-white/90 hover:bg-white text-[#18324B] rounded shadow text-xs"
                        title="Set as Cover"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow text-xs"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#20A486]" />
            <span>Lot Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#18324B] block mb-1">Lot Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Category</label>
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
                <option value="Recyclable">Recyclable (Secondary Smelting)</option>
                <option value="Reusable">Reusable (Direct Utilization)</option>
                <option value="Repairable">Repairable (Refurbishment)</option>
                <option value="New Surplus">New Surplus (Unused Factory Overstock)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Quantity</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  min={1}
                  required
                  className="flex-1 h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-20 h-10 px-2 rounded-xl border border-[#CBD5E1] text-xs font-bold outline-none focus:border-[#20A486] bg-white"
                >
                  <option value="KG">KG</option>
                  <option value="MT">MT</option>
                  <option value="Units">Units</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">
                Seller Asking Price ({currency} / {unit})
              </label>
              <input
                type="number"
                value={sellerPrice || ''}
                onChange={(e) => setSellerPrice(parseFloat(e.target.value) || '')}
                placeholder="Optional asking rate"
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
              >
                <option value="Available">Available</option>
                <option value="Draft">Draft</option>
                <option value="Reserved">Reserved</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#18324B] block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
              />
            </div>
          </div>
        </div>

        {/* Global Map Location Picker */}
        <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
            <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#20A486]" />
              <span>Depot Location & GPS Coordinates</span>
            </h3>
            <Link
              to="/exchange-map"
              target="_blank"
              className="text-xs font-bold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>View Global Map</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <LocationPickerMap
            initialLocation={location}
            latitude={latitude}
            longitude={longitude}
            onChange={(coords) => {
              setLocation(coords.location);
              setLatitude(coords.latitude);
              setLongitude(coords.longitude);
            }}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/app/supplier/listings')}
            className="px-5 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
