import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';

export function Contact() {
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    phone: '',
    city: '',
    subject: '',
    requirement: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/enquiries', {
        ...formData,
        source_type: 'CONTACT',
      });

      if (res.success) {
        setSuccess(true);
        setFormData({
          customer_name: '',
          company_name: '',
          email: '',
          phone: '',
          city: '',
          subject: '',
          requirement: '',
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  const primaryPhone = settings?.phone || '+91 9512953737';
  const alternatePhone = settings?.alternate_phone || settings?.alt_phone || '+91 9512983737';
  const primaryEmail = settings?.company_email || 'pranav@omronics.com';
  const supportEmail = settings?.support_email || 'sales@omronics.com';
  const addressDisplay = settings?.address || 'Plot No. 12, Phase 3, GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat - 382330';
  const workingHoursDisplay = settings?.working_hours || 'Mon - Sat: 9:00 AM - 6:30 PM IST';

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title={`Contact Engineering Sales | ${settings?.company_name || 'Omronics Automation'}`}
        description="Get in touch with Omronics sales and technical support team for custom cable harness designs, panel manufacturing quotes, or product inquiries."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
              Get In Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              Contact Engineering Sales
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Have a technical requirement or need custom cable specs? Connect with our application engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Direct Contact Info (Includes Primary & Alternate Phone / Support Email) */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-[#87C0CD]/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#113F67]">Headquarters & Manufacturing Plant</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{addressDisplay}</p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-[#87C0CD]/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#113F67]">Phone Support</h4>
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    <p className="font-semibold">{primaryPhone}</p>
                    {alternatePhone && (
                      <p className="font-semibold text-slate-600">{alternatePhone}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-2">{workingHoursDisplay}</p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4 border border-[#87C0CD]/40 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-[#113F67]">Email Inquiries</h4>
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5 font-semibold">
                    <p>{primaryEmail}</p>
                    {supportEmail && (
                      <p className="text-slate-600">{supportEmail}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-[#87C0CD]/40 shadow-sm">
              <h3 className="text-xl font-bold font-display text-[#113F67] mb-6">Send Us a Message</h3>

              {success ? (
                <div className="py-16 text-center space-y-4 bg-[#E4F1F5] rounded-2xl border border-[#87C0CD]/50">
                  <CheckCircle2 className="w-16 h-16 text-[#226597] mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-[#113F67]">Message Received!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. An application engineer will review your specs and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-[#226597] hover:bg-[#113F67] text-xs font-bold text-white rounded-xl transition shadow-sm"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="e.g. Precision Automation Pvt Ltd"
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@company.com"
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={primaryPhone}
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        City / Location
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Ahmedabad, Pune, Chennai"
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Servo Motor Harness Quote"
                        className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] mb-1">
                      Technical Requirement Details *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.requirement}
                      onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                      placeholder="Specify cable types, lengths, quantity, panel specs, or delivery timelines..."
                      className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl px-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
