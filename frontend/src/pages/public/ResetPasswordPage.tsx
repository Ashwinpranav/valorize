import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setDone(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-[#18324B]">Set New Password</h2>
            <p className="text-xs text-[#64748B]">Please enter your new secure password</p>
          </div>

          {done ? (
            <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
              <h4 className="text-sm font-bold text-[#18324B]">Password Updated Successfully</h4>
              <p className="text-xs text-[#64748B]">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium outline-none focus:border-[#20A486]"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white font-bold text-xs transition-all shadow-md"
              >
                Update Password
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
