import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Weight,
  Layers,
  ArrowRight,
  Trash2,
  Star,
  Plus,
  Eye,
  Users,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { VoiceAssistant } from '../../components/VoiceAssistant';
import { PriceEstimateCard } from '../../components/PriceEstimateCard';
import { LocationPickerMap } from '../../components/LocationPickerMap';
import { MaterialImage } from '../../components/MaterialImage';
import { listingsApi, aiApi, requirementsApi } from '../../services/api';
import { MaterialCategory, WasteListing, BuyerRequirement } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';

interface UploadedImageItem {
  url: string;
  isPrimary: boolean;
  file?: File;
}

export const AddListingPage: React.FC = () => {
  const { t } = useLanguage();
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  
  // Multi-image state
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('KG');
  const [condition, setCondition] = useState('Recyclable');
  const [location, setLocation] = useState('Kurichi SIDCO, Coimbatore, India');
  const [latitude, setLatitude] = useState<number>(10.9572);
  const [longitude, setLongitude] = useState<number>(76.9744);
  const [sellerPrice, setSellerPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // AI states
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isValuating, setIsValuating] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);

  // Market context preview (similar listings & nearby buyers)
  const [similarListings, setSimilarListings] = useState<WasteListing[]>([]);
  const [nearbyBuyers, setNearbyBuyers] = useState<BuyerRequirement[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  // Submit state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await listingsApi.getCategories();
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch similar listings and buyers whenever categoryId changes
  useEffect(() => {
    if (!categoryId) return;
    const loadMarketContext = async () => {
      setIsLoadingMarketData(true);
      try {
        const [listings, buyers] = await Promise.all([
          listingsApi.getListings({ category_id: categoryId }),
          requirementsApi.getRequirements(false),
        ]);
        setSimilarListings(listings.slice(0, 3));
        const matchedBuyers = buyers.filter((b) => b.category_id === categoryId);
        setNearbyBuyers(matchedBuyers.slice(0, 3));
      } catch (err) {
        console.error('Failed to load market context:', err);
      } finally {
        setIsLoadingMarketData(false);
      }
    };
    loadMarketContext();
  }, [categoryId]);

  // Handle multi-image file selection
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);
    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const uploadedItems: UploadedImageItem[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const res = await listingsApi.uploadImage(file);
        uploadedItems.push({
          url: res.image_url,
          isPrimary: images.length === 0 && i === 0,
          file,
        });
      }

      const updatedImages = [...images, ...uploadedItems];
      // Ensure at least one is primary
      if (!updatedImages.some((img) => img.isPrimary) && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      setImages(updatedImages);

      // Trigger AI classification on the first uploaded image
      if (selectedFiles.length > 0) {
        triggerAIAnalysis(selectedFiles[0]);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerAIAnalysis = async (file: File) => {
    setIsClassifying(true);
    try {
      const aiRes = await aiApi.classifyImage(file);
      setClassificationResult(aiRes);

      // Auto-suggest category if matched
      const matchedCat = categories.find((c) =>
        c.name.toLowerCase().includes(aiRes.predicted_category.toLowerCase())
      );
      if (matchedCat) {
        setCategoryId(matchedCat.id);
        if (!title) {
          setTitle(`${aiRes.predicted_category} Scrap Lot`);
        }
      }

      // Auto-estimate price if quantity exists
      const catName = matchedCat ? matchedCat.name : aiRes.predicted_category;
      if (quantity > 0) {
        runPriceEstimation(catName, quantity, condition);
      }
    } catch (err: any) {
      console.error('Classification assay error:', err);
    } finally {
      setIsClassifying(false);
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

  const runPriceEstimation = async (catName: string, qty: number, cond: string) => {
    setIsValuating(true);
    try {
      const est = await aiApi.estimatePrice({
        category_name: catName,
        quantity: qty,
        condition: cond,
        region: location,
      });
      setPriceEstimate(est);
    } catch (err) {
      console.error('Price estimation error:', err);
    } finally {
      setIsValuating(false);
    }
  };

  // Voice assistant parsed callback
  const handleVoiceData = (data: any) => {
    if (data.materialName) setTitle(data.materialName);
    if (data.quantity) setQuantity(data.quantity);
    if (data.unit) setUnit(data.unit);
    if (data.condition) setCondition(data.condition);
    if (data.rawText) {
      setDescription(`Spoken Lot Declaration: “${data.rawText}”`);
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const catName = currentCat ? currentCat.name : 'Copper scrap';
    if (data.quantity) {
      runPriceEstimation(catName, data.quantity, data.condition || condition);
    }
  };

  const handleSubmit = async (status: 'Available' | 'Draft') => {
    if (!title.trim() || !categoryId || quantity <= 0) {
      setErrorMessage('Please fill in material title, category, and quantity.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Sort images so primary comes first
      const orderedUrls = [...images]
        .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        .map((img) => img.url);

      const payload: any = {
        title: title.trim(),
        category_id: Number(categoryId),
        quantity: Number(quantity),
        unit,
        condition,
        location: location.trim(),
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        seller_price: sellerPrice ? Number(sellerPrice) : null,
        description: description.trim(),
        status,
        image_urls: orderedUrls,
      };

      if (priceEstimate) {
        payload.ai_estimated_price_min = priceEstimate.indicative_unit_price_min;
        payload.ai_estimated_price_max = priceEstimate.indicative_unit_price_max;
      }

      await listingsApi.createListing(payload);
      navigate('/app/supplier/listings');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">Add Industrial Secondary Material Lot</h2>
        <p className="text-xs text-[#64748B]">
          Publish surplus inventory with AI-assisted material assay, global geolocation, and multi-image documentation.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Voice Assistant Module */}
      <VoiceAssistant onParsedData={handleVoiceData} />

      {/* ========================================================================= */}
      {/* 1. Multi-Image System & Image Preview Gallery (Requirement 1 & 9) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#20A486]" />
            <span>1. Material Lot Photographs (Multi-Image Documentation)</span>
          </h3>
          <span className="text-xs font-semibold text-[#64748B]">
            {images.length} {images.length === 1 ? 'image' : 'images'} added
          </span>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-5 text-center hover:border-[#20A486] transition-colors bg-[#F8FAFC]">
          <input
            id="multi_photo_upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <label htmlFor="multi_photo_upload" className="cursor-pointer block space-y-2">
            <Upload className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <span className="text-xs font-bold text-[#18324B] block">
              Click or drag to upload lot photos (Multiple Supported)
            </span>
            <span className="text-[11px] text-[#64748B] block">
              PNG, JPG, WEBP. Uploading triggers automatic MobileNetV2 material classification.
            </span>
          </label>
          {isUploadingImage && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#20A486]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading and processing image bytes...</span>
            </div>
          )}
        </div>

        {/* Uploaded Thumbnails Preview Strip */}
        {images.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[#18324B] block">
              Image Gallery Preview (Click star to set Cover Image):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-video bg-black/5 ${
                    img.isPrimary ? 'border-[#20A486] ring-2 ring-[#20A486]/20' : 'border-[#E2E8F0]'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Lot thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Primary Badge */}
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 bg-[#20A486] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}

                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="p-1.5 bg-white/90 hover:bg-white text-[#18324B] rounded-lg shadow text-xs font-bold transition flex items-center gap-1"
                        title="Make Cover Image"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow text-xs transition"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. Enhanced AI Result Screen (Requirement 9) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#20A486]" />
            <span>2. AI Material Composition Assay & Market Discovery</span>
          </h3>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            MobileNetV2 Vision Model
          </span>
        </div>

        {isClassifying ? (
          <div className="p-8 text-center space-y-2 bg-[#F0FDFA] rounded-xl border border-[#99F6E4]">
            <Sparkles className="w-8 h-8 text-[#20A486] animate-spin mx-auto" />
            <span className="text-xs font-bold text-[#115E59] block">
              Running Neural Surface Assay on Primary Lot Photo...
            </span>
            <span className="text-[11px] text-[#64748B] block">
              Extracting specular highlights, metallic grain patterns, and scrap classification signatures
            </span>
          </div>
        ) : classificationResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              {/* Image inspected */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#64748B] block">Assayed Lot Photo</span>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white">
                  {images.length > 0 ? (
                    <img src={images[0].url} alt="Assay preview" className="w-full h-full object-cover" />
                  ) : (
                    <MaterialImage categoryName={classificationResult.predicted_category} className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Classification details */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">
                      Predicted Material
                    </span>
                    <h4 className="text-lg font-black text-[#18324B]">
                      {classificationResult.predicted_category}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[#64748B] block">Model Confidence</span>
                    <span className="text-sm font-black text-[#20A486]">
                      {Math.round(classificationResult.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#20A486] h-full transition-all duration-500"
                    style={{ width: `${Math.round(classificationResult.confidence * 100)}%` }}
                  />
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {classificationResult.rationale}
                </p>

                {/* Suggested actions & quick apply */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const matched = categories.find((c) =>
                        c.name.toLowerCase().includes(classificationResult.predicted_category.toLowerCase())
                      );
                      if (matched) setCategoryId(matched.id);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#18324B] text-white hover:bg-[#234566] transition"
                  >
                    Confirm Category: {classificationResult.predicted_category}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('Recyclable')}
                    className="text-[11px] font-bold px-2.5 py-1 rounded bg-white border border-[#CBD5E1] text-[#18324B] hover:bg-slate-50 transition"
                  >
                    Suggest Condition: Recyclable
                  </button>
                </div>
              </div>
            </div>

            {/* Similar Listings & Nearby Buyers Preview (Requirement 9) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Similar listings preview */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-xs font-bold text-[#18324B] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#20A486]" />
                  Active Market Listings for Same Material ({similarListings.length})
                </span>
                {similarListings.length === 0 ? (
                  <p className="text-[11px] text-[#64748B]">No competing listings active for this material.</p>
                ) : (
                  <div className="space-y-1.5">
                    {similarListings.map((sim) => (
                      <div
                        key={sim.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <span className="font-semibold text-[#18324B] truncate max-w-[180px]">{sim.title}</span>
                        <span className="font-bold text-[#20A486]">
                          {sim.seller_price ? formatPrice(sim.seller_price) : 'Quote'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nearby buyers preview */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                <span className="text-xs font-bold text-[#18324B] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Active Procurement Requests for this Scrap ({nearbyBuyers.length})
                </span>
                {nearbyBuyers.length === 0 ? (
                  <p className="text-[11px] text-[#64748B]">No pending buyer requests matching this category.</p>
                ) : (
                  <div className="space-y-1.5">
                    {nearbyBuyers.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50/50 border border-blue-100"
                      >
                        <span className="font-semibold text-[#18324B] truncate max-w-[180px]">{b.title}</span>
                        <span className="font-bold text-blue-700">
                          {b.max_quantity} {b.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[#64748B] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
            Upload an image above to automatically assay metallic grade, estimate pricing, and view nearby buyers.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. Confirmed Specifications Form with Manual Corrections (Requirement 9) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#20A486]" />
          <span>3. Material Lot Specifications (Manual Correction & Publishing)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#18324B] block mb-1">Lot Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bundled Insulated Copper Wire Scrap"
              required
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Material Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                setCategoryId(id);
                const c = categories.find((x) => x.id === id);
                if (c && quantity > 0) runPriceEstimation(c.name, quantity, condition);
              }}
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
              onChange={(e) => {
                setCondition(e.target.value);
                const c = categories.find((x) => x.id === categoryId);
                if (c && quantity > 0) runPriceEstimation(c.name, quantity, e.target.value);
              }}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
            >
              <option value="Recyclable">Recyclable (Secondary Smelting)</option>
              <option value="Reusable">Reusable (Direct Utilization)</option>
              <option value="Repairable">Repairable (Refurbishment)</option>
              <option value="New Surplus">New Surplus (Unused Factory Overstock)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#18324B] block mb-1">Net Quantity</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={quantity || ''}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 0;
                  setQuantity(q);
                  const c = categories.find((x) => x.id === categoryId);
                  if (c && q > 0) runPriceEstimation(c.name, q, condition);
                }}
                placeholder="e.g. 850"
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
              Seller Asking Rate ({currency} per {unit})
            </label>
            <input
              type="number"
              value={sellerPrice || ''}
              onChange={(e) => setSellerPrice(parseFloat(e.target.value) || '')}
              placeholder={`Asking price in ${currency}`}
              className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#18324B] block mb-1">
              Description & Assay Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Transformer rewinding scrap, unoxidized, free of heavy iron bolts or paint."
              className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Global Map Depot & Coordinate Picker (Requirement 2) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#20A486]" />
            <span>4. Depot Location & Worldwide GPS Coordinates</span>
          </h3>
          <Link
            to="/exchange-map"
            target="_blank"
            className="text-xs font-bold text-[#20A486] hover:underline flex items-center gap-1"
          >
            <span>Open Global Exchange Map</span>
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

      {/* Indicative Price Estimation Card (if calculated) */}
      {priceEstimate && (
        <PriceEstimateCard
          unitPriceMin={priceEstimate.indicative_unit_price_min}
          unitPriceMax={priceEstimate.indicative_unit_price_max}
          totalPriceMin={priceEstimate.estimated_min_price}
          totalPriceMax={priceEstimate.estimated_max_price}
          unit={unit}
          isDemo={priceEstimate.is_demo}
          limitationsNotice={priceEstimate.limitations_notice}
        />
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => handleSubmit('Draft')}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F1F5F9] text-xs font-bold text-[#475569] transition-colors"
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('Available')}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaving ? 'Publishing Material Lot...' : 'Publish Material Lot'}</span>
        </button>
      </div>
    </div>
  );
};
