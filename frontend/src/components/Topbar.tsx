import React from 'react';
import { Menu, Bell, Search, Globe, ChevronDown, ExternalLink, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency, CurrencyCode, CURRENCY_CONFIG } from '../context/CurrencyContext';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onOpenMobile: () => void;
  title?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobile,
  title,
  breadcrumbs = [],
}) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile menu toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          {breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#64748B]">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span>/</span>}
                  {b.to ? (
                    <Link to={b.to} className="hover:text-[#20A486]">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-[#1E293B] font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {title && <h1 className="text-base font-bold text-[#18324B] leading-tight">{title}</h1>}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Currency Switcher */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="text-xs font-semibold px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#18324B] hover:border-[#20A486] focus:outline-none focus:ring-1 focus:ring-[#20A486] cursor-pointer"
            title="Select Display Currency"
          >
            {Object.values(CURRENCY_CONFIG).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Public marketplace link */}
        <Link
          to="/marketplace"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334E68] transition-colors"
        >
          <span>Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
              language === 'en'
                ? 'bg-white text-[#18324B] shadow-sm'
                : 'text-[#64748B] hover:text-[#18324B]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              language === 'ta'
                ? 'bg-white text-[#18324B] shadow-sm'
                : 'text-[#64748B] hover:text-[#18324B]'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Notifications Icon */}
        <Link
          to="/app/notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#18324B] hover:bg-[#F1F5F9] transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#20A486]" />
        </Link>

        {/* User Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="w-8 h-8 rounded-full bg-[#18324B] text-white flex items-center justify-center text-xs font-bold">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#18324B]">{user?.full_name}</span>
            <span className="text-[10px] text-[#20A486] font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

