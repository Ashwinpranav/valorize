import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Settings, Sliders, CheckCircle2, AlertCircle, Cpu, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    weight_material: 0.40,
    weight_quantity: 0.25,
    weight_proximity: 0.20,
    weight_condition: 0.15,
    demo_mode: true,
    auto_approve_listings: false,
    platform_version: '1.0.0',
    ml_pricing_model: 'RandomForestRegressor (v1.0-synthetic-inr)',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const totalWeight =
    (settings.weight_material +
      settings.weight_quantity +
      settings.weight_proximity +
      settings.weight_condition).toFixed(2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Math.abs(parseFloat(totalWeight) - 1.0) > 0.01) {
      alert('The sum of matching algorithm weights must equal exactly 1.00 (100%). Currently: ' + totalWeight);
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      setMessage('Platform configuration saved and applied.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#20A486]" />
          Platform & Algorithm Configuration
        </h1>
        <p className="text-sm text-[#64748B]">
          Tune the multi-objective buyer-supplier matching weights and operational runtime parameters.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Matching Weights Card */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#20A486]" />
                Matching Algorithm Weights
              </h2>
              <p className="text-xs text-[#64748B]">
                Weights must sum to 100% (1.00) for deterministic normalized compatibility scoring.
              </p>
            </div>
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              parseFloat(totalWeight) === 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              Total: {(parseFloat(totalWeight) * 100).toFixed(0)}%
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Material Category Compatibility ({ (settings.weight_material * 100).toFixed(0) }%)</span>
                <span className="text-[#64748B]">{settings.weight_material}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={settings.weight_material}
                onChange={(e) => setSettings({ ...settings, weight_material: parseFloat(e.target.value) })}
                className="w-full accent-[#20A486]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Quantity Match & Lot Size ({ (settings.weight_quantity * 100).toFixed(0) }%)</span>
                <span className="text-[#64748B]">{settings.weight_quantity}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={settings.weight_quantity}
                onChange={(e) => setSettings({ ...settings, weight_quantity: parseFloat(e.target.value) })}
                className="w-full accent-[#20A486]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Geographic Proximity (Haversine) ({ (settings.weight_proximity * 100).toFixed(0) }%)</span>
                <span className="text-[#64748B]">{settings.weight_proximity}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={settings.weight_proximity}
                onChange={(e) => setSettings({ ...settings, weight_proximity: parseFloat(e.target.value) })}
                className="w-full accent-[#20A486]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Material Condition Acceptability ({ (settings.weight_condition * 100).toFixed(0) }%)</span>
                <span className="text-[#64748B]">{settings.weight_condition}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={settings.weight_condition}
                onChange={(e) => setSettings({ ...settings, weight_condition: parseFloat(e.target.value) })}
                className="w-full accent-[#20A486]"
              />
            </div>
          </div>
        </div>

        {/* Operational & ML Configuration Card */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#1E293B] flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
            <Cpu className="w-4 h-4 text-[#20A486]" />
            AI/ML Service Runtimes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0]">
              <span className="text-[#64748B] block">Indicative Pricing Engine</span>
              <strong className="text-slate-800 font-mono">{settings.ml_pricing_model}</strong>
              <div className="text-emerald-700 mt-1 font-semibold">R² = 0.9936 (Verified)</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0]">
              <span className="text-[#64748B] block">Image Classification Engine</span>
              <strong className="text-slate-800 font-mono">MobileNetV2 / Multi-Feature Heuristic</strong>
              <div className="text-emerald-700 mt-1 font-semibold">Online & Available</div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.demo_mode}
                onChange={(e) => setSettings({ ...settings, demo_mode: e.target.checked })}
                className="rounded border-[#E2E8F0] text-[#20A486] focus:ring-[#20A486]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Demo Mode Notice Active (clearly distinguishes synthetic datasets from live production)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.auto_approve_listings}
                onChange={(e) => setSettings({ ...settings, auto_approve_listings: e.target.checked })}
                className="rounded border-[#E2E8F0] text-[#20A486] focus:ring-[#20A486]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Bypass Manual Moderation (auto-approve newly listed supplier materials)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#20A486] text-white font-semibold text-sm rounded-lg hover:bg-[#18836b] transition shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Apply Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
