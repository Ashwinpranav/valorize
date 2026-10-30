import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Menu,
  X,
  Phone,
  Mail,
  HelpCircle,
  Building2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'buyer':
        return '/app/buyer/dashboard';
      case 'partner':
        return '/app/partner/dashboard';
      case 'admin':
        return '/app/admin/dashboard';
      case 'supplier':
      default:
        return '/app/supplier/dashboard';
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Exchange Map', path: '/exchange-map' },
    { label: 'Dashboard', path: getDashboardLink() },
    { label: 'About Us', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F5F7FA] flex flex-col justify-between selection:bg-[#20A486]/30 selection:text-[#F5F7FA]">
      {/* ===================================================================== */}
      {/* 1. Header / Navigation (Dark Enterprise Theme) */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0B1220]/90 backdrop-blur-md border-b border-[#18324B]/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo in Header */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18324B] to-[#111C2E] border border-[#20A486]/40 flex items-center justify-center shadow-md group-hover:border-[#20A486] transition-all">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#20A486]"
              >
                <path
                  d="M7 6L16 26L25 6H19.5L16 16.5L12.5 6H7Z"
                  fill="currentColor"
                />
                <circle cx="16" cy="10" r="2.5" fill="#38BDF8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#F5F7FA] leading-none group-hover:text-[#20A486] transition-colors">
                Valorize
              </span>
              <span className="text-[10px] text-[#AAB7C8] font-semibold tracking-wider uppercase mt-0.5">
                Industrial Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#AAB7C8]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="hover:text-[#20A486] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="hover:text-[#20A486] transition-colors text-sm font-semibold text-[#AAB7C8]"
            >
              Contact / Help
            </button>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="px-4 py-2 rounded-xl bg-[#111C2E] hover:bg-[#18324B] border border-[#18324B] text-[#F5F7FA] font-bold text-xs transition shadow-sm"
                >
                  Dashboard ({user.role})
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs text-[#AAB7C8] hover:text-[#F5F7FA] font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-[#18324B] bg-[#111C2E]/60 text-[#F5F7FA] hover:bg-[#18324B] hover:border-[#20A486]/50 font-bold text-xs transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#20A486] hover:bg-[#18836b] text-white font-bold text-xs transition shadow-md shadow-[#20A486]/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#F5F7FA] hover:bg-[#111C2E]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111C2E] border-b border-[#18324B] px-4 pt-3 pb-5 space-y-3 shadow-2xl">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-[#AAB7C8]">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-[#18324B] hover:text-[#20A486] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowContactModal(true);
                }}
                className="py-2 px-3 text-left rounded-lg hover:bg-[#18324B] hover:text-[#20A486] transition-colors"
              >
                Contact / Help
              </button>
            </nav>

            <div className="pt-3 border-t border-[#18324B] flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center rounded-xl bg-[#20A486] text-white font-bold text-xs"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs text-[#AAB7C8] hover:text-white font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-xl border border-[#18324B] bg-[#0B1220] text-[#F5F7FA] font-bold text-xs"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-xl bg-[#20A486] text-white font-bold text-xs"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* 2. Hero Section (Large Centered Valorize Logo + Minimal Action) */}
      {/* ===================================================================== */}
      <main className="flex-1 flex items-center justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#20A486]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#18324B]/30 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
          {/* Prominent Large Centered Valorize Logo */}
          <div className="flex flex-col items-center justify-center group">
            <div className="relative">
              {/* Outer Decorative Glow Ring */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#20A486]/20 via-[#18324B]/40 to-[#38BDF8]/20 blur-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Logo Container */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#111C2E] to-[#0B1220] border-2 border-[#18324B] group-hover:border-[#20A486]/70 shadow-2xl flex items-center justify-center transition-all duration-300">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-14 h-14 sm:w-16 sm:h-16 filter drop-shadow-[0_2px_12px_rgba(32,164,134,0.4)]"
                >
                  <defs>
                    <linearGradient id="vGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#20A486" />
                      <stop offset="0.6" stopColor="#14B8A6" />
                      <stop offset="1" stopColor="#38BDF8" />
                    </linearGradient>
                    <linearGradient id="circGrad" x1="32" y1="14" x2="32" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38BDF8" />
                      <stop offset="1" stopColor="#20A486" />
                    </linearGradient>
                  </defs>
                  {/* Left Arm of 'V' */}
                  <path
                    d="M14 12L32 52L40 34L26 12H14Z"
                    fill="url(#vGrad)"
                  />
                  {/* Right Arm of 'V' */}
                  <path
                    d="M50 12L37 40L42.5 52L50 12Z"
                    fill="#20A486"
                    fillOpacity="0.85"
                  />
                  {/* Apex Resource Core */}
                  <circle cx="32" cy="20" r="5" fill="url(#circGrad)" />
                </svg>
              </div>
            </div>

            {/* Brand Typography beneath logo */}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#F5F7FA]">
                Valorize
              </span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#20A486] uppercase mt-0.5">
                Industrial Waste Exchange
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F5F7FA] tracking-tight leading-[1.15]">
              Turn Industrial Waste Into Valuable Resources
            </h1>

            {/* Exact Short Description */}
            <p className="text-base sm:text-lg lg:text-xl text-[#AAB7C8] max-w-2xl mx-auto leading-relaxed">
              Connect with suppliers, buyers, and recyclers worldwide to give industrial materials a second life.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Button */}
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#20A486] hover:bg-[#18836b] text-white font-bold text-sm transition-all shadow-lg shadow-[#20A486]/25 hover:shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Secondary Button */}
            <Link
              to="/exchange-map"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111C2E] hover:bg-[#18324B] text-[#F5F7FA] border border-[#18324B] hover:border-[#20A486]/40 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02]"
            >
              <Globe className="w-4 h-4 text-[#20A486]" />
              <span>View Exchange Map</span>
            </Link>
          </div>
        </div>
      </main>

      {/* ===================================================================== */}
      {/* 3. Minimal Footer (Dark Theme) */}
      {/* ===================================================================== */}
      <footer className="border-t border-[#18324B]/70 bg-[#0B1220] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAB7C8]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#18324B] border border-[#20A486]/40 flex items-center justify-center text-[10px] font-bold text-[#20A486]">
              V
            </div>
            <span>© 2026 Valorize Industrial Waste Exchange Platform.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link to="/about" className="hover:text-[#20A486] transition-colors">
              About Us
            </Link>
            <Link to="/marketplace" className="hover:text-[#20A486] transition-colors">
              Marketplace
            </Link>
            <Link to="/exchange-map" className="hover:text-[#20A486] transition-colors">
              Exchange Map
            </Link>
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="hover:text-[#20A486] transition-colors"
            >
              Contact / Help
            </button>
          </div>
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* Contact / Help Modal (Dark Theme) */}
      {/* ===================================================================== */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111C2E] text-[#F5F7FA] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#18324B] space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#18324B] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#20A486]" />
                <h3 className="text-base font-bold text-[#F5F7FA]">Valorize Support & Trade Desk</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="text-[#AAB7C8] hover:text-[#F5F7FA] text-xl font-bold p-1"
                aria-label="Close Modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#AAB7C8]">
              <p>
                Our industrial materials desk assists certified manufacturers, registered scrap buyers, and circular economy aggregators worldwide with assays, pricing, logistics routing, and platform navigation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0B1220] border border-[#18324B] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18324B] flex items-center justify-center text-[#20A486]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#AAB7C8] block">Trade Desk Hotline</span>
                    <strong className="text-xs text-[#F5F7FA]">+1 (800) 825-6749</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1220] border border-[#18324B] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18324B] flex items-center justify-center text-[#20A486]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#AAB7C8] block">Assay & Logistics</span>
                    <strong className="text-xs text-[#F5F7FA]">support@valorize.io</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#18324B]/40 border border-[#18324B] flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#20A486] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F7FA] block text-xs">Global Industrial Operations</strong>
                  <span className="text-[11px] text-[#AAB7C8]">
                    Operating hubs in Detroit, MI (North America), Birmingham (Europe), Dubai (Middle East), and Coimbatore (Asia-Pacific).
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-[#20A486] hover:bg-[#18836b] text-white font-bold text-xs rounded-xl transition shadow"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
