import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HelpPage: React.FC = () => {
  const { t } = useLanguage();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#18324B]">{t('helpSupport')}</h2>
        <p className="text-xs text-[#64748B]">
          Direct operational support and guidance for industrial waste exchange
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-card p-5 border border-[#E2E8F0] shadow-card text-center space-y-2">
          <Phone className="w-8 h-8 text-[#20A486] mx-auto" />
          <h4 className="text-sm font-bold text-[#18324B]">Telephone Trade Desk</h4>
          <p className="text-xs text-[#64748B]">+91 422 298 0000</p>
          <span className="text-[10px] text-[#94A3B8] block">Mon–Sat: 8 AM – 7 PM</span>
        </div>

        <div className="bg-white rounded-card p-5 border border-[#E2E8F0] shadow-card text-center space-y-2">
          <Mail className="w-8 h-8 text-[#20A486] mx-auto" />
          <h4 className="text-sm font-bold text-[#18324B]">Email Support</h4>
          <p className="text-xs text-[#64748B]">support@valorize.demo</p>
          <span className="text-[10px] text-[#94A3B8] block">Response within 2 hours</span>
        </div>

        <div className="bg-white rounded-card p-5 border border-[#E2E8F0] shadow-card text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-[#20A486] mx-auto" />
          <h4 className="text-sm font-bold text-[#18324B]">Dispute & Assay Mediation</h4>
          <p className="text-xs text-[#64748B]">claims@valorize.demo</p>
          <span className="text-[10px] text-[#94A3B8] block">Metallurgical verification</span>
        </div>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-[#18324B]">Submit Support Ticket</h3>

        {sent ? (
          <div className="p-6 text-center space-y-2 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
            <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">Ticket Logged Successfully</h4>
            <p className="text-xs text-[#64748B]">
              Your support request has been dispatched to the platform operations desk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Issue Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Weighbridge slip reconciliation question"
                required
                className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#18324B] block mb-1">Details & Context</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Describe your inquiry or transaction ID..."
                className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs outline-none focus:border-[#20A486]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

