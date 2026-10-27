import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-[#18324B]">Reset Password</h2>
            <p className="text-xs text-[#64748B]">
              Enter your work email address to receive password reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
              <h4 className="text-sm font-bold text-[#18324B]">Instructions Dispatched</h4>
              <p className="text-xs text-[#64748B]">
                If an account exists for <strong className="text-[#18324B]">{email}</strong>, password reset steps have been generated.
              </p>
              <Link
                to="/login"
                className="inline-block mt-2 text-xs font-bold text-[#20A486] hover:underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Corporate Email</label>
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

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-xs transition-all shadow-md"
              >
                Send Reset Link
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-[#18324B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
