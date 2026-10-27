import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const PublicNavbar: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'buyer': return '/app/buyer/dashboard';
      case 'partner': return '/app/partner/dashboard';
      case 'admin': return '/app/admin/dashboard';
      case 'supplier':
      default:
        return '/app/supplier/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#18324B] flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-[#20A486] text-lg">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-[#18324B] leading-none">
              Valorize
            </span>
            <span className="text-[10px] text-[#64748B] font-semibold tracking-wider uppercase mt-0.5">
              Industrial Exchange
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#486581]">
          <Link to="/marketplace" className="hover:text-[#20A486] transition-colors">
            {t('marketplace')}
          </Link>
          <Link to="/how-it-works" className="hover:text-[#20A486] transition-colors">
            {t('howItWorks')}
          </Link>
          <Link to="/about" className="hover:text-[#20A486] transition-colors">
            {t('about')}
          </Link>
        </nav>

        {/* Right side CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switch */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                language === 'en' ? 'bg-white text-[#18324B] shadow-sm' : 'text-[#64748B]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                language === 'ta' ? 'bg-white text-[#18324B] shadow-sm' : 'text-[#64748B]'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {user ? (
            <Link
              to={getDashboardLink()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>{t('dashboard')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-[#18324B] hover:text-[#20A486] transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18324B] hover:bg-[#243B53] text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>{t('register')}</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#1E293B]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#18324B] py-2"
          >
            {t('marketplace')}
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#18324B] py-2"
          >
            {t('howItWorks')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#18324B] py-2"
          >
            {t('about')}
          </Link>

          <div className="pt-3 border-t border-[#F1F5F9] flex flex-col gap-2">
            {user ? (
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-[#20A486] text-white text-xs font-bold"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#18324B]"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#18324B] text-white text-xs font-bold"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
