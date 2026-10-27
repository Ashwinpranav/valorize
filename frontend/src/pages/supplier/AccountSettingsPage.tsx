import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AccountSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('accountSettings')}</h2>
        <p className="text-xs text-[#64748B]">Manage your individual authentication and security preferences</p>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Representative Name</label>
              <input
                type="text"
                defaultValue={user?.full_name}
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Contact Email</label>
              <input
                type="email"
                defaultValue={user?.email}
                disabled
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-medium text-[#64748B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue={user?.phone || '+91 98430 11223'}
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Assigned Role</label>
              <input
                type="text"
                defaultValue={user?.role}
                disabled
                className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#20A486] uppercase"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
            {saved ? (
              <span className="text-xs font-bold text-[#15803D] flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences Saved
              </span>
            ) : <span />}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

