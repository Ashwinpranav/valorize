import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-[#18324B]">404</h1>
          <h2 className="text-xl font-bold text-[#18324B]">Industrial Resource Not Found</h2>
          <p className="text-xs text-[#64748B] leading-relaxed">
            The page or material lot manifest you requested does not exist or has been archived.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Platform Home</span>
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

