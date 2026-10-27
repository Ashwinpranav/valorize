import React, { useState, useEffect } from 'react';
import { Plus, ClipboardList, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requirementsApi, listingsApi } from '../../services/api';
import { BuyerRequirement, MaterialCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerRequirementsPage: React.FC = () => {
  const { t } = useLanguage();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [minQty, setMinQty] = useState<number>(500);
  const [maxQty, setMaxQty] = useState<number>(5000);
  const [unit, setUnit] = useState('KG');
  const [acceptedCondition, setAcceptedCondition] = useState('Recyclable');
  const [maxDistance, setMaxDistance] = useState<number>(150);
  const [maxBudget, setMaxBudget] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequirements = async () => {
    setIsLoading(true);
    try {
      const [reqs, cats] = await Promise.all([
        requirementsApi.getRequirements(true),
        listingsApi.getCategories(),
      ]);
      setRequirements(reqs);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) setCategoryId(cats[0].id);
    } catch (err) {
      console.error('Error loading requirements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    setIsSubmitting(true);
    try {
      await requirementsApi.createRequirement({
        title: title.trim(),
        category_id: Number(categoryId),
        min_quantity: Number(minQty),
        max_quantity: Number(maxQty),
        unit,
        accepted_condition: acceptedCondition,
        max_distance_km: Number(maxDistance),
        max_budget_per_unit: maxBudget ? Number(maxBudget) : null,
      });
      setShowAddModal(false);
      setTitle('');
      await fetchRequirements();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create requirement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this procurement requirement?')) return;
    try {
      await requirementsApi.deleteRequirement(id);
      setRequirements((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete requirement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#18324B]">{t('buyerRequirements')}</h2>
          <p className="text-xs text-[#64748B]">
            Configure automated procurement criteria for AI matching and notifications
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addRequirement')}</span>
        </button>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading procurement targets...</div>
        ) : requirements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase">
                  <th className="py-3 px-4">Requirement Title</th>
                  <th className="py-3 px-4">Material Category</th>
                  <th className="py-3 px-4">Acceptance Range</th>
                  <th className="py-3 px-4">Grade Spec</th>
                  <th className="py-3 px-4">Max Freight Radius</th>
                  <th className="py-3 px-4">Max Budget</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#1E293B]">
                {requirements.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-bold text-[#18324B]">{r.title}</td>
                    <td className="py-3 px-4 text-[#475569]">{r.category_name}</td>
                    <td className="py-3 px-4 font-bold text-[#20A486]">
                      {r.min_quantity.toLocaleString()} – {r.max_quantity.toLocaleString()} {r.unit}
                    </td>
                    <td className="py-3 px-4">{r.accepted_condition}</td>
                    <td className="py-3 px-4">{r.max_distance_km} km</td>
                    <td className="py-3 px-4">
                      {r.max_budget_per_unit ? `₹${r.max_budget_per_unit}/${r.unit}` : 'Flexible'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-[#64748B] hover:text-[#B91C1C] p-1"
                        title="Delete Requirement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <ClipboardList className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">No Procurement Requirements Created</h4>
            <p>Declare the material grades and tonnage you need to trigger automatic matching alerts.</p>
          </div>
        )}
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#18324B]">Add Procurement Requirement</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#94A3B8] hover:text-[#18324B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Requirement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Monthly Procurement: High-Purity Copper Wire"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Material Stream</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">Min Quantity</label>
                  <input
                    type="number"
                    value={minQty}
                    onChange={(e) => setMinQty(parseFloat(e.target.value) || 0)}
                    required
                    min={1}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">Max Quantity</label>
                  <input
                    type="number"
                    value={maxQty}
                    onChange={(e) => setMaxQty(parseFloat(e.target.value) || 0)}
                    required
                    min={1}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">Accepted Grade</label>
                  <select
                    value={acceptedCondition}
                    onChange={(e) => setAcceptedCondition(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486] bg-white"
                  >
                    <option value="Any">Any Grade</option>
                    <option value="Recyclable">Recyclable (Smelting)</option>
                    <option value="Reusable">Reusable</option>
                    <option value="Repairable">Repairable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#18324B] block mb-1">Max Freight Radius</label>
                  <input
                    type="number"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseFloat(e.target.value) || 0)}
                    placeholder="km"
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">
                  Target Price Ceiling (₹ / unit - Optional)
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseFloat(e.target.value) || '')}
                  placeholder="Leave blank if open to market spot rate"
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-semibold outline-none focus:border-[#20A486]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded-xl text-xs font-bold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#20A486] hover:bg-[#17856C] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

