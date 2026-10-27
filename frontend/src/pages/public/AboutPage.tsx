import React from 'react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { Leaf, Shield, Cpu, Code2, Database, Sparkles, Building2, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <PublicNavbar />

      <div className="bg-[#18324B] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#243B53]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
            Engineering Sustainable Industry
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            About Valorize Industrial Exchange
          </h1>
          <p className="text-sm text-[#BCCCDC] max-w-2xl mx-auto leading-relaxed">
            Bridging heavy manufacturing scrap generation with high-grade secondary remelting loops through computer vision and deterministic matching.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* Mission Statement */}
        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#20A486] bg-[#E6FFFA] px-3 py-1 rounded-full">
            <Leaf className="w-3.5 h-3.5" />
            <span>Circular Economy Imperative</span>
          </div>
          <h2 className="text-2xl font-black text-[#18324B]">
            Why Industrial Waste Requires Smarter Digital Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-[#486581] leading-relaxed">
            In major manufacturing hubs such as Coimbatore, Tiruppur, and Chennai, precision machining, casting foundries, and transformer manufacturing produce massive volumes of high-purity scrap—copper winding cutoffs, 6063 aluminium extrusion offcuts, and heavy melting steel. Simultaneously, secondary smelters and refurbishment workshops struggle with opaque broker chains, inaccurate manual grading, and lack of supply visibility.
          </p>
          <p className="text-xs sm:text-sm text-[#486581] leading-relaxed">
            Valorize provides an enterprise SaaS exchange that eliminates middleman friction with transparent computer vision assays, real-time regional valuation, and verifiable circular audit trails.
          </p>
        </div>

        {/* Tech Stack Pillars */}
        <div>
          <h3 className="text-xl font-bold text-[#18324B] mb-6 text-center">
            Modern Modular Full-Stack & AI Architecture
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#18324B]/10 text-[#18324B] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[#20A486]" />
              </div>
              <h4 className="text-base font-bold text-[#18324B]">Frontend Engineering</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                React 18 + TypeScript + Vite + Tailwind CSS with Enterprise Navy/Teal design system tokens, TanStack Query, and bilingual English/Tamil layout stabilization.
              </p>
            </div>

            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#18324B]/10 text-[#18324B] flex items-center justify-center">
                <Database className="w-5 h-5 text-[#20A486]" />
              </div>
              <h4 className="text-base font-bold text-[#18324B]">Backend & Database</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                FastAPI high-concurrency async framework + SQLAlchemy 2.0 ORM + Alembic migrations + PostgreSQL (with SQLite zero-config development fallback).
              </p>
            </div>

            <div className="bg-white rounded-card p-6 border border-[#E2E8F0] shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#18324B]/10 text-[#18324B] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#20A486]" />
              </div>
              <h4 className="text-base font-bold text-[#18324B]">AI / Machine Learning</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                MobileNetV2 transfer learning image classifier + scikit-learn RandomForestRegressor valuation + deterministic multi-factor matching engine.
              </p>
            </div>
          </div>
        </div>

        {/* Project Context */}
        <div className="bg-[#18324B] rounded-card p-8 text-white space-y-3">
          <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
            Academic & Capstone Scope
          </span>
          <h3 className="text-xl font-bold">Final Year BCA AI/ML Capstone Project</h3>
          <p className="text-xs text-[#BCCCDC] leading-relaxed max-w-3xl">
            Valorize was designed and engineered as a comprehensive, demonstrable, end-to-end full-stack artificial intelligence application. Every module—from password security and relational transaction state machines to computer vision feature extraction and carbon lifecycle accounting—operates in real code with automated test coverage.
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
