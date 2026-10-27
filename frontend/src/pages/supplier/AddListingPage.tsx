import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { VoiceAssistant } from '../../components/VoiceAssistant';
import { AIInsightPanel } from '../../components/AIInsightPanel';
import { PriceEstimateCard } from '../../components/PriceEstimateCard';
import { listingsApi, aiApi } from '../../services/api';
import { MaterialCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const AddListingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('KG');
  const [condition, setCondition] = useState('Recyclable');
  const [location, setLocation] = useState('Kurichi SIDCO, Coimbatore');
  const [sellerPrice, setSellerPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // AI states
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [isValuating, setIsValuating] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);

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

  // When image is selected: run upload and AI classification
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    setIsClassifying(true);
    setErrorMessage(null);
    try {
      // 1. Upload
      const uploadRes = await listingsApi.uploadImage(file);
      setUploadedImageUrl(uploadRes.image_url);

      // 2. Classify
      const aiRes = await aiApi.classifyImage(file);
      setClassificationResult(aiRes);

      // Map to category in dropdown
      const matchedCat = categories.find((c) =>
        c.name.toLowerCase().includes(aiRes.predicted_category.toLowerCase())
      );
      if (matchedCat) {
        setCategoryId(matchedCat.id);
        if (!title) {
          setTitle(`${aiRes.predicted_category} (Lot CBE-2026)`);
        }
      }

      // Automatically fetch indicative price estimate if quantity entered
      if (quantity > 0) {
        runPriceEstimation(aiRes.predicted_category, quantity, condition);
      }
    } catch (err: any) {
      console.error('Classification error:', err);
      setErrorMessage(err.response?.data?.detail || 'Failed to analyze image with computer vision.');
    } finally {
      setIsClassifying(false);
    }
  };

  const runPriceEstimation = async (catName: string, qty: number, cond: string) => {
    setIsValuating(true);
    try {
      const est = await aiApi.estimatePrice({
        category_name: catName,
        quantity: qty,
        condition: cond,
        region: 'Coimbatore',
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

    // Trigger valuation
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
      const payload: any = {
        title: title.trim(),
        category_id: Number(categoryId),
        quantity: Number(quantity),
        unit,
        condition,
        location: location.trim(),
        seller_price: sellerPrice ? Number(sellerPrice) : null,
        description: description.trim(),
        status,
        image_urls: uploadedImageUrl ? [uploadedImageUrl] : [],
      };

      if (priceEstimate) {
        payload.ai_estimated_price_min = priceEstimate.indicative_unit_price_min;
        payload.ai_estimated_price_max = priceEstimate.indicative_unit_price_max;
      }

      await listingsApi.createListing(payload);
      navigate('/app/supplier/listings');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create listing');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">Add Industrial Waste Lot</h2>
        <p className="text-xs text-[#64748B]">
          Upload lot photographs for AI composition analysis or dictate using voice recognition.
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

      {/* Image Upload & Computer Vision Assay */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#20A486]" />
          <span>1. Industrial Photo Assay (MobileNetV2 Vision)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Dropzone */}
          <div className="relative border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 text-center hover:border-[#20A486] transition-colors bg-[#F8FAFC]">
            {previewUrl ? (
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-black/10">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <label
                  htmlFor="photo_upload"
                  className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 text-xs font-bold text-[#18324B] rounded shadow cursor-pointer hover:bg-white"
                >
                  Change Image
                </label>
              </div>
            ) : (
              <label htmlFor="photo_upload" className="cursor-pointer block space-y-2">
                <Upload className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <span className="text-xs font-bold text-[#18324B] block">
                  Click to upload lot photo
                </span>
                <span className="text-[11px] text-[#64748B] block">
                  Supports JPEG, PNG, WEBP (Max 10 MB)
                </span>
              </label>
            )}
            <input
              id="photo_upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Classification result or status */}
          <div>
            {isClassifying ? (
              <div className="p-6 text-center space-y-2 bg-[#F0FDFA] rounded-xl border border-[#99F6E4]">
                <Sparkles className="w-8 h-8 text-[#20A486] animate-spin mx-auto" />
                <span className="text-xs font-bold text-[#115E59] block">
                  Running Computer Vision Assay...
                </span>
                <span className="text-[11px] text-[#64748B] block">
                  Extracting surface reflectance and metallic signatures
                </span>
              </div>
            ) : classificationResult ? (
              <AIInsightPanel
                predictedCategory={classificationResult.predicted_category}
                confidence={classificationResult.confidence}
                rationale={classificationResult.rationale}
                isDemo={classificationResult.is_demo}
                modelName={classificationResult.model_version}
                secondaryPredictions={classificationResult.secondary_predictions}
                onConfirm={() => {
                  const c = categories.find((x) =>
                    x.name.toLowerCase().includes(classificationResult.predicted_category.toLowerCase())
                  );
                  if (c) setCategoryId(c.id);
                }}
              />
            ) : (
              <div className="p-6 text-center text-xs text-[#64748B] border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
                Upload an image above to automatically detect metallic composition and estimated grade.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lot Parameters Form */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#20A486]" />
          <span>2. Confirmed Lot Specifications</span>
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
              Seller Asking Rate (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-[#64748B]">₹</span>
              <input
                type="number"
                value={sellerPrice || ''}
                onChange={(e) => setSellerPrice(parseFloat(e.target.value) || '')}
                placeholder="Asking price per unit"
                className="w-full h-10 pl-7 pr-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-[#18324B] block mb-1">Depot Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kurichi SIDCO, Coimbatore"
              required
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
          <span>{isSaving ? 'Publishing Lot...' : 'Publish Material Lot'}</span>
        </button>
      </div>
    </div>
  );
};

