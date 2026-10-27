import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, Building, UserCheck } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      // Role-aware redirection
      switch (user.role) {
        case 'buyer':
          navigate('/app/buyer/dashboard');
          break;
        case 'partner':
          navigate('/app/partner/dashboard');
          break;
        case 'admin':
          navigate('/app/admin/dashboard');
          break;
        case 'supplier':
        default:
          navigate('/app/supplier/dashboard');
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Auto-Fill helper
  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Valorize2026!');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#18324B] text-white flex items-center justify-center font-black text-xl mx-auto shadow-sm">
              <span className="text-[#20A486]">V</span>
            </div>
            <h2 className="text-2xl font-black text-[#18324B] tracking-tight">
              Sign In to Valorize
            </h2>
            <p className="text-xs text-[#64748B]">
              Access your corporate waste exchange desk and trade telemetry
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-2 text-xs text-[#991B1B]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#18324B]">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#20A486] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo account selector pill buttons for convenient evaluator testing */}
          <div className="pt-4 border-t border-[#F1F5F9]">
            <span className="text-[11px] font-bold text-[#64748B] block mb-2 uppercase tracking-wider text-center">
              Quick Demo Evaluator Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoFill('supplier@valorize.demo')}
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#18324B] font-semibold text-left transition-colors"
              >
                🏭 Supplier Desk
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('buyer@valorize.demo')}
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#18324B] font-semibold text-left transition-colors"
              >
                🛒 Buyer Desk
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('partner@valorize.demo')}
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#18324B] font-semibold text-left transition-colors"
              >
                ♻️ Recycler Partner
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@valorize.demo')}
                className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#18324B] font-semibold text-left transition-colors"
              >
                🛡️ Admin Portal
              </button>
            </div>
            <span className="text-[10px] text-[#94A3B8] block text-center mt-2 italic">
              Password for all demo accounts: Valorize2026!
            </span>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-[#64748B]">New industrial business? </span>
            <Link to="/register" className="text-xs font-bold text-[#20A486] hover:underline">
              Register Company
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
