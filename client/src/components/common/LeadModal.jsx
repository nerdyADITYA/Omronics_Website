import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Tag, Cpu } from 'lucide-react';
import api from '../../services/api';

export function LeadModal({
  isOpen,
  onClose,
  sourceType = 'CONTACT',
  referenceId = null,
  title = 'Request a Quote',
  variantDetails = null,
}) {
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    city: '',
    requirement: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/enquiries', {
        ...formData,
        source_type: sourceType,
        reference_id: referenceId,
        variant_details: variantDetails || null,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#113F67]/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-[#87C0CD]/40 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#113F67] font-display">{title}</h3>
            <p className="text-xs text-slate-500">Fill in your specifications and our engineers will get back to you within 24 hours.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#113F67] rounded-xl hover:bg-[#F3F9FB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Variant Specification Preview Badge */}
        {variantDetails && (
          <div className="mt-3 p-3.5 bg-sky-50/90 border border-sky-200 rounded-2xl text-xs space-y-1.5 font-sans">
            <div className="flex justify-between items-center border-b border-sky-200/70 pb-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#226597] flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span>Selected Cable Spec Variant</span>
              </span>
              <span className="font-mono font-extrabold text-[#226597] bg-white px-2 py-0.5 rounded-md border border-sky-200">
                {variantDetails.part_code || 'Custom Variant'}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] pt-0.5">
              <span className="font-bold text-[#113F67]">
                {variantDetails.product_name} {variantDetails.motor_type ? `(${variantDetails.motor_type})` : ''}
              </span>
              {variantDetails.variant_price && (
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ₹{Number(variantDetails.variant_price).toLocaleString('en-IN')} / Piece
                </span>
              )}
            </div>
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#226597] mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-[#113F67]">Enquiry Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you. Our sales engineering team will reach out shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Siemens India"
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@company.com"
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
                Technical Requirements & Specs *
              </label>
              <textarea
                rows={3}
                required
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                placeholder="Mention cable length, core count, shielding, servo motor model, or panel specifications..."
                className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting...' : 'Submit Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
