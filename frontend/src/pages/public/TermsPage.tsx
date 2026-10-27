import React from 'react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#20A486] uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Commercial Terms</span>
          </div>
          <h1 className="text-3xl font-black text-[#18324B]">Terms of Service & Trade Policy</h1>
          <p className="text-xs text-[#64748B] mt-1">Effective Date: Academic Year 2026</p>
        </div>

        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card space-y-6 text-xs sm:text-sm text-[#486581] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">1. Indicative Valuations & AI Limitations</h2>
            <p>
              AI valuations provided by the RandomForest regression engine are purely indicative benchmark ranges based on historical secondary metal spot indices. Final settlements are governed solely by agreed commercial purchase orders, physical weighbridge slips, and laboratory metallurgical assays.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">2. Buyer & Supplier Obligations</h2>
            <p>
              Suppliers warrant that declared waste lots do not contain prohibited hazardous contaminants or radioactive scrap. Buyers warrant prompt dispatch execution upon offer acceptance and milestone agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">3. Life Cycle Carbon Accounting</h2>
            <p>
              Environmental impact certificates issued by Valorize use established Bureau of International Recycling (BIR) LCA methodologies. They are designed for Scope 3 emissions reporting and ESG corporate disclosures.
            </p>
          </section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

