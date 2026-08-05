import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import api from '../../services/api';

export function Contact() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Contact Sales Engineering | Omronics Gurugram"
        description="Get in touch with Omronics sales and technical support team for custom cable harness designs, panel manufacturing quotes, or product inquiries."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Get In Touch</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Contact Engineering Sales</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Have a technical requirement or need custom cable specs? Connect with our application engineers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Direct Contact Info */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-200">Headquarters & Manufacturing Plant</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Industrial Automation Complex, Plot 42, Sector 18, Gurugram, Haryana - 122015, India
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-200">Phone Support</h4>
                  <p className="text-xs text-slate-400 mt-1">+91 98765 43210 / +91 124 4567890</p>
                  <p className="text-[10px] text-slate-500">Mon - Sat: 9:00 AM - 6:30 PM IST</p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-200">Email Inquiries</h4>
                  <p className="text-xs text-slate-400 mt-1">info@omronics.com</p>
                  <p className="text-[10px] text-slate-500">Sales: sales@omronics.com</p>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl">
              <h3 className="text-xl font-bold font-display text-slate-100 mb-6">Send Us a Message</h3>

              {success ? (
                <div className="py-16 text-center space-y-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-lg font-bold text-slate-100">Message Received!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you for reaching out. An application engineer will review your specs and respond within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center space-x-2 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="e.g. Vikram Mehta"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="e.g. Precision Automation Ltd"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="vikram@company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Servo Motor Harness Quote"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Technical Requirement Details *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.requirement}
                      onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                      placeholder="Specify cable types, lengths, quantity, panel specs, or delivery timelines..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
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
