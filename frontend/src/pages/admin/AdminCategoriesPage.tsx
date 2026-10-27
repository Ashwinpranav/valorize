import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Layers, Plus, Edit2, Check, X, Leaf, Zap } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    standard_unit: 'KG',
    co2_factor_per_kg: 2.5,
    energy_saved_percent: 70.0,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
      } else {
        await adminApi.createCategory(formData);
      }
      setShowAddModal(false);
      setEditingId(null);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      standard_unit: 'KG',
      co2_factor_per_kg: 2.5,
      energy_saved_percent: 70.0,
      is_active: true,
    });
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description || '',
      standard_unit: cat.standard_unit,
      co2_factor_per_kg: cat.co2_factor_per_kg,
      energy_saved_percent: cat.energy_saved_percent,
      is_active: cat.is_active,
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#20A486]" />
            Material Category Management
          </h1>
          <p className="text-sm text-[#64748B]">
            Configure standardized material taxonomy, units of measure, and certified LCA impact factors.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#20A486] hover:bg-[#18836b] rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Loading material categories...
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-base">{c.name}</h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.code}
                    </span>
                  </div>
                  <StatusBadge status={c.is_active ? 'Active' : 'Archived'} />
                </div>
                <p className="text-xs text-[#64748B] mb-4 min-h-[32px] line-clamp-2">
                  {c.description || 'No specific description provided.'}
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F5F7FA] rounded-lg text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>{c.co2_factor_per_kg}</strong> kg CO₂e/kg</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span><strong>{c.energy_saved_percent}%</strong> Energy Saved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs">
                <span className="text-slate-500 font-medium">
                  Unit: <strong>{c.standard_unit}</strong> ({c.listings_count} listings)
                </span>
                <button
                  onClick={() => handleEdit(c)}
                  className="inline-flex items-center gap-1 text-[#20A486] hover:text-[#18836b] font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#E2E8F0]">
              <h2 className="text-lg font-bold text-[#1E293B]">
                {editingId ? 'Edit Category' : 'Create Material Category'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Scrap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">
                  Unique Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. COPPER_SCRAP"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm font-mono focus:outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E293B] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">
                    Standard Unit
                  </label>
                  <select
                    value={formData.standard_unit}
                    onChange={(e) => setFormData({ ...formData, standard_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#20A486]"
                  >
                    <option value="KG">KG</option>
                    <option value="MT">MT</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Barrels">Barrels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">
                    CO₂ Avoided (kg/kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.co2_factor_per_kg}
                    onChange={(e) => setFormData({ ...formData, co2_factor_per_kg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1E293B] mb-1">
                    Energy Saved (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.energy_saved_percent}
                    onChange={(e) => setFormData({ ...formData, energy_saved_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-[#E2E8F0] text-[#20A486] focus:ring-[#20A486]"
                    />
                    <span className="text-xs font-medium text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#20A486] text-white rounded-lg text-xs font-semibold hover:bg-[#18836b]"
                >
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
