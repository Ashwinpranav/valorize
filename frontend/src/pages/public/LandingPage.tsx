import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Recycle,
  Factory,
  Search,
  CheckCircle2,
  MapPin,
  Cpu,
  Layers,
  BarChart3,
  HelpCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const primaryCta = user ? '/app/supplier/listings/new' : '/register';
  const secondaryCta = '/marketplace';

  const demoStats = [
    { label: "Completed Industrial Exchanges", value: "148+", note: "Demo Benchmark" },
    { label: "Material Diverted from Landfill", value: "340.5 MT", note: "Measured Lot Weights" },
    { label: "CO2 Emissions Avoided", value: "1,150 MT", note: "BIR LCA Factor Model" },
    { label: "Average Valuation Accuracy", value: "94.2%", note: "RandomForest R² Score" },
  ];

  const materialCategories = [
    { name: "Copper Scrap", desc: "Transformer coils, stripped busbars, wire windings", img: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80", count: "12 Lots Active" },
    { name: "Aluminium Scrap", desc: "6063 extrusions, aerospace offcuts, castings", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80", count: "18 Lots Active" },
    { name: "Steel Scrap", desc: "Heavy melting steel HMS-1, beam fabrication ends", img: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", count: "24 Lots Active" },
    { name: "Machinery Parts", desc: "3-phase motors, gearboxes, industrial pumps", img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", count: "9 Lots Active" },
  ];

  const faqs = [
    {
      q: "How does the AI computer vision assay work?",
      a: "Suppliers upload clear photographs of their industrial scrap or surplus assets. A deep learning pipeline evaluates visual characteristics, reflectance, color ratios, and edge density to classify the material and indicate estimated purity with an explainable rationale.",
    },
    {
      q: "How is the indicative price estimated?",
      a: "Our machine learning service employs a RandomForest regression model trained on regional Indian secondary metal spot benchmarks (Coimbatore, Chennai, Bangalore clusters), volume tiers, and material conditions.",
    },
    {
      q: "How does the buyer matching engine work?",
      a: "The engine uses a deterministic multi-criteria scoring algorithm: Material Compatibility (40%), Quantity Fit (25%), Freight Proximity (20%), and Condition Hierarchy (15%), giving full transparency into why a candidate match is ranked.",
    },
    {
      q: "How are environmental impact records verified?",
      a: "Impact metrics are calculated strictly from verified 'Completed' transactions. Net diverted tonnage is tracked directly, while CO2 emissions avoided are calculated using published IPCC and Bureau of International Recycling (BIR) life-cycle assessments.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F5F7FA] pt-16 pb-20 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#E6FFFA] border border-[#20A486]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#116552]">
                <Sparkles className="w-4 h-4 text-[#20A486]" />
                <span>AI-Assisted Circular Resource Exchange</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-[#18324B] tracking-tight leading-[1.15]">
                {t('heroHeadline')}
              </h1>

              <p className="text-base sm:text-lg text-[#486581] max-w-2xl leading-relaxed">
                {t('heroSubtitle')}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={primaryCta}
                  className="px-6 py-3.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>{t('listWasteBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={secondaryCta}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#18324B] border-2 border-[#18324B] font-bold text-sm transition-all"
                >
                  {t('exploreMaterialsBtn')}
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E2E8F0] grid grid-cols-3 gap-4 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#20A486]" />
                  <span>Verified Corporate KYC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#20A486]" />
                  <span>Computer Vision Assays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-[#20A486]" />
                  <span>Traceable Circularity</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
                {/* Visual Header */}
                <div className="relative aspect-[16/10] bg-[#18324B] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80"
                    alt="Industrial scrap lot"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute top-3 left-3 bg-[#18324B]/90 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#20A486] animate-pulse" />
                    <span>AI Assay Complete • 99.2% Purity</span>
                  </div>
                </div>

                {/* Card Telemetry */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#20A486] uppercase tracking-wider">
                        Classified Lot #CBE-2026-0891
                      </span>
                      <h3 className="text-base font-bold text-[#18324B]">
                        Bundled Copper Wire Scrap (Heavy)
                      </h3>
                    </div>
                    <span className="bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded-full text-xs font-bold">
                      94% Match
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#64748B] block">Available Weight</span>
                      <span className="font-bold text-[#18324B] text-sm">850.0 KG</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block">Indicative Spot Value</span>
                      <span className="font-bold text-[#15803D] text-sm">₹680 - ₹740 / kg</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#64748B] pt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#20A486]" /> Kurichi SIDCO, Coimbatore
                    </span>
                    <span className="font-semibold text-[#20A486]">Ready for Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Platform Statistics */}
      <section className="bg-white py-12 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-bold text-[#18324B]">Demonstrable Exchange Impact</h2>
            <p className="text-xs text-[#64748B] mt-1 italic">
              *All statistical metrics below reflect recorded transactions and simulated regional baselines.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {demoStats.map((stat, i) => (
              <div key={i} className="bg-[#F5F7FA] rounded-card p-5 border border-[#E2E8F0] text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#18324B]">{stat.value}</div>
                <div className="text-xs font-semibold text-[#334E68] mt-1">{stat.label}</div>
                <span className="inline-block mt-2 text-[10px] text-[#20A486] font-semibold bg-[#E6FFFA] px-2 py-0.5 rounded-full">
                  {stat.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Exchange Process */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18324B] mt-1">
              How Industrial Exchange Works
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              From factory floor scrap declaration to verified secondary circular manufacturing in three structured steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card relative">
              <div className="w-10 h-10 rounded-xl bg-[#18324B] text-white flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-[#18324B] mb-2">Declare & AI Assay</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                Supplier uploads lot photos or dictates via Tamil/English voice. The computer vision model analyzes metallic composition, estimates purity, and suggests regional spot pricing.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#20A486] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Vision Telemetry</span>
              </div>
            </div>

            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card relative">
              <div className="w-10 h-10 rounded-xl bg-[#20A486] text-white flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-[#18324B] mb-2">Algorithmic Match & Negotiation</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                Our matching engine pairs lots with registered buyer demand using material, lot volume, location radius, and condition compatibility. Parties negotiate terms securely.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#20A486] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transparent Scoring Weights</span>
              </div>
            </div>

            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card relative">
              <div className="w-10 h-10 rounded-xl bg-[#18324B] text-white flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-[#18324B] mb-2">Dispatch & Verified Impact</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                Logistics milestone tracking verifies weighbridge receipts. Completed exchanges automatically issue verifiable carbon and landfill avoidance certificates.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#20A486] font-semibold">
                <Recycle className="w-3.5 h-3.5" />
                <span>Certified Circular Audit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Material Categories */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
                Active Material Streams
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#18324B] mt-1">
                Explore Industrial Categories
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="mt-4 md:mt-0 text-xs font-bold text-[#20A486] hover:text-[#17856C] flex items-center gap-1"
            >
              <span>View All 7 Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materialCategories.map((cat, i) => (
              <Link
                key={i}
                to="/marketplace"
                className="group rounded-card border border-[#E2E8F0] overflow-hidden bg-white hover:shadow-card-hover transition-all"
              >
                <div className="aspect-[16/10] bg-[#F1F5F9] overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#18324B] text-sm group-hover:text-[#20A486] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-[#20A486] font-semibold bg-[#E6FFFA] px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-2">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[#F5F7FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#18324B]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#64748B] mt-2">
              Everything you need to know about the Valorize platform architecture and AI services.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-card p-5 border border-[#E2E8F0] shadow-card">
                <h3 className="text-sm font-bold text-[#18324B] mb-1.5 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#20A486] mt-0.5 flex-shrink-0" />
                  <span>{f.q}</span>
                </h3>
                <p className="text-xs text-[#64748B] pl-6 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="bg-[#18324B] py-14 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to Monetize Industrial Surplus and Cut Carbon Footprints?
          </h2>
          <p className="text-sm text-[#BCCCDC] max-w-2xl mx-auto">
            Join factories, foundries, and recyclers across Tamil Nadu and South India on Valorize.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={primaryCta}
              className="px-6 py-3 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-sm transition-all shadow-md"
            >
              Get Started with Valorize
            </Link>
            <Link
              to="/marketplace"
              className="px-6 py-3 rounded-xl bg-transparent hover:bg-[#243B53] text-white border border-[#486581] font-bold text-sm transition-all"
            >
              Browse Open Listings
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

