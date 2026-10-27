import React from 'react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#20A486] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl font-black text-[#18324B]">Privacy Policy & Data Security</h1>
          <p className="text-xs text-[#64748B] mt-1">Effective Date: Academic Year 2026</p>
        </div>

        <div className="bg-white rounded-card p-8 border border-[#E2E8F0] shadow-card space-y-6 text-xs sm:text-sm text-[#486581] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">1. Overview & Data Ownership</h2>
            <p>
              Valorize is a B2B platform designed for industrial enterprise exchange. We collect corporate account information, manufacturing plant coordinates, and material lot assay photographs strictly for the purpose of facilitating transparent secondary resource trade and regulatory compliance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">2. Geolocation & Facility Privacy</h2>
            <p>
              Exact facility GPS coordinates and dispatch bay locations are never exposed on public marketplace search views. Only approximate industrial cluster regions (e.g., Kurichi SIDCO, Coimbatore) are displayed publicly until mutual trade terms are agreed upon.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">3. Computer Vision & Upload Security</h2>
            <p>
              Uploaded lot imagery is pre-processed in isolated, secure local development storage. Image files undergo strict MIME type inspection and size limits (10 MB maximum) to prevent malicious payloads or path traversal attacks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#18324B]">4. Regulatory Compliance</h2>
            <p>
              All transaction records comply with Tamil Nadu Pollution Control Board (TNPCB) and Central Pollution Control Board (CPCB) industrial recycling manifest frameworks.
            </p>
          </section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
