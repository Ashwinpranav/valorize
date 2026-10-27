import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'supplier' | 'buyer' | 'partner'>('supplier');
  const [industry, setIndustry] = useState('Metal Casting & Foundry');
  const [city, setCity] = useState('Coimbatore');
  const [state, setState] = useState('Tamil Nadu');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await register({
        full_name: fullName,
        company_name: companyName,
        email,
        password,
        phone,
        role,
        industry,
        city,
        state,
      });

      switch (user.role) {
        case 'buyer':
          navigate('/app/buyer/dashboard');
          break;
        case 'partner':
          navigate('/app/partner/dashboard');
          break;
        case 'supplier':
        default:
          navigate('/app/supplier/dashboard');
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register account. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#20A486] uppercase tracking-wider">
              Corporate Onboarding
            </span>
            <h2 className="text-2xl font-black text-[#18324B] tracking-tight">
              Register Your Industrial Company
            </h2>
            <p className="text-xs text-[#64748B]">
              Connect with buyers, recyclers, and suppliers across Tamil Nadu and South India
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-2">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    role === 'supplier'
                      ? 'bg-[#18324B] text-white border-[#18324B] shadow-sm'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                  }`}
                >
                  🏭 Supplier (Factory)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    role === 'buyer'
                      ? 'bg-[#18324B] text-white border-[#18324B] shadow-sm'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                  }`}
                >
                  🛒 Buyer / Trader
                </button>
                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    role === 'partner'
                      ? 'bg-[#18324B] text-white border-[#18324B] shadow-sm'
                      : 'bg-[#F8FAFC] text-[#475569] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                  }`}
                >
                  ♻️ Recycler / Partner
                </button>
              </div>
            </div>

            {/* Two column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sundaram"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Foundry & Metals Ltd"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="procurement@company.com"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98430 00000"
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Industry Sector</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486] bg-white"
                >
                  <option value="Metal Casting & Foundry">Metal Casting & Foundry</option>
                  <option value="Automotive Engineering">Automotive Engineering</option>
                  <option value="Electronics & Electrical">Electronics & Electrical</option>
                  <option value="Textiles & Machinery">Textiles & Machinery</option>
                  <option value="Plastics & Polymers">Plastics & Polymers</option>
                  <option value="Secondary Smelting">Secondary Smelting & Refining</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">City & State</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    required
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{isLoading ? 'Registering Corporate Account...' : 'Complete Corporate Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-[#64748B]">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-[#20A486] hover:underline">
              Sign In to Desk
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
