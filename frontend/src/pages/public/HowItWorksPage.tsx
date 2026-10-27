import React from 'react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { Sparkles, Camera, Cpu, ArrowRightLeft, ShieldCheck, Recycle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <PublicNavbar />

      <div className="bg-[#18324B] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#243B53]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
            Platform Architecture & Methodology
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            How Valorize AI Powers Industrial Circularity
          </h1>
          <p className="text-sm text-[#BCCCDC] max-w-2xl mx-auto leading-relaxed">
            A step-by-step technical breakdown of our computer vision material assay, deterministic buyer matching, and verified life-cycle carbon tracking.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-12">
        {/* Step 1 */}
        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18324B] text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h2 className="text-xl font-bold text-[#18324B]">
              Image-Based Material Assay & Computer Vision
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              When a factory uploads lot imagery, our computer vision pipeline processes the file (validating format and resolution up to 10 MB). It extracts color distribution ratios, reflectance metrics, and edge density characteristics to classify scrap type (Copper, Aluminium, Steel, Electronics, Machinery, Plastics) and calculate model confidence with an explainable diagnostic rationale.
            </p>
            <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs text-[#334155]">
              <strong className="text-[#20A486]">Human Confirmation:</strong> The platform always presents the AI classification to the supplier for manual confirmation or grade override before publishing.
            </div>
          </div>
          <div className="md:col-span-5 bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0] text-center space-y-3">
            <Camera className="w-12 h-12 text-[#20A486] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">Transfer Learning MobileNetV2</h4>
            <p className="text-xs text-[#64748B]">
              Lightweight, fast inference optimized for low-latency shopfloor execution on mobile devices and industrial tablets.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#20A486] text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h2 className="text-xl font-bold text-[#18324B]">
              Indicative Regional Valuation (RandomForest)
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Our valuation engine uses a trained RandomForestRegressor evaluated using rigorous regression metrics (MAE: ~₹13/kg, R²: 0.99). It ingests material category, lot quantity, physical condition (New Surplus, Reusable, Repairable, Recyclable), and regional cluster factors (Coimbatore, Chennai, Bangalore) to predict a fair indicative price range with explicit limitations disclosures.
            </p>
            <div className="p-3 bg-[#FFFBEB] rounded-lg border border-[#FDE68A] text-xs text-[#92400E]">
              <strong className="text-[#B45309]">Clear Boundaries:</strong> Indicative estimates never overwrite the seller's asking price and are clearly labelled as benchmarks.
            </div>
          </div>
          <div className="md:col-span-5 bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0] text-center space-y-3">
            <Cpu className="w-12 h-12 text-[#18324B] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">RandomForest Regressor</h4>
            <p className="text-xs text-[#64748B]">
              Trained on secondary metal spot trade distributions with volume tier scaling and regional transport parity.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18324B] text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h2 className="text-xl font-bold text-[#18324B]">
              Deterministic Buyer Matching Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Candidate listings and buyer procurement specifications are evaluated deterministically using an explainable multi-factor formula:
            </p>
            <ul className="text-xs text-[#334155] space-y-1.5 list-disc pl-5">
              <li><strong>Material Category Compatibility (40%):</strong> Strict filter requiring exact category match.</li>
              <li><strong>Quantity Fit (25%):</strong> Compares lot tonnage against buyer min/max acceptance range.</li>
              <li><strong>Geographic Proximity (20%):</strong> Great-circle Haversine distance within acceptable freight radius.</li>
              <li><strong>Condition Compatibility (15%):</strong> Grade hierarchy validation (New Surplus &gt; Reusable &gt; Recyclable).</li>
            </ul>
          </div>
          <div className="md:col-span-5 bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0] text-center space-y-3">
            <ArrowRightLeft className="w-12 h-12 text-[#20A486] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">Deterministic Formula</h4>
            <p className="text-xs text-[#64748B]">
              Fully explainable score breakdown showing exact contribution of each factor rather than opaque black-box recommendations.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#20A486] text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h2 className="text-xl font-bold text-[#18324B]">
              Traceable Circular Impact Accounting
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Platform impact reporting is generated strictly from verified 'Completed' transactions. Net diverted tonnage is tracked directly from weighbridge data, while avoided greenhouse gas emissions are calculated using published IPCC and Bureau of International Recycling (BIR) life-cycle assessments comparing secondary recovery to virgin extraction.
            </p>
          </div>
          <div className="md:col-span-5 bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0] text-center space-y-3">
            <Recycle className="w-12 h-12 text-[#18324B] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">BIR / IPCC Factor Model</h4>
            <p className="text-xs text-[#64748B]">
              Secondary Aluminium: 9.1 kg CO2e/kg | Copper: 3.4 kg CO2e/kg | Steel: 1.8 kg CO2e/kg.
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
