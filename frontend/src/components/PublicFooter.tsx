import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Leaf, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PublicFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#18324B] text-white pt-16 pb-12 border-t border-[#243B53]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#243B53]">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#20A486] flex items-center justify-center">
                <span className="font-black text-white text-base">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Valorize</span>
            </div>
            <p className="text-xs text-[#BCCCDC] leading-relaxed">
              Industrial B2B exchange connecting manufacturing surplus with reuse, refurbishment, and secondary smelting loops. Built with verified AI computer vision assays and deterministic buyer matching.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#20A486] font-semibold">
              <Leaf className="w-4 h-4" />
              <span>Advancing Circular Manufacturing</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-[#BCCCDC]">
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  Material Marketplace
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  Computer Vision Assay Flow
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Supplier Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Buyer Procurement Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Governance & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#BCCCDC]">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Trade & Assay Validation
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Circular Architecture
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-[#829AB1] block pt-1">
                  Compliance: State Pollution Control Board Guidelines
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Regional Hubs */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Industrial Operating Hubs
            </h4>
            <div className="space-y-2 text-xs text-[#BCCCDC]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#20A486] flex-shrink-0 mt-0.5" />
                <span>SIDCO Kurichi & Peelamedu, Coimbatore, TN</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#20A486] flex-shrink-0" />
                <span>exchange@valorize.demo</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#20A486] flex-shrink-0" />
                <span>+91 422 298 0000 (Trade Desk)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#829AB1]">
          <div>
            © {new Date().getFullYear()} Valorize Industrial Systems. Final Year BCA AI/ML Project.
          </div>
          <div className="italic text-center md:text-right text-[#9FB3C8]">
            *Environmental savings estimates are strictly calculated using IPCC / BIR life cycle assessment benchmarks.
          </div>
        </div>
      </div>
    </footer>
  );
};

