import React from 'react';
import { ShieldAlert, Phone, Mail, Clock, Lock, Sparkles, Wrench } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';

export function Maintenance() {
  const { settings } = useSettings();

  const title = settings?.maintenance_title || 'Website Under Scheduled Maintenance';
  const message =
    settings?.maintenance_message ||
    'We are currently performing critical infrastructure and catalog upgrades to improve your experience. Our engineering and sales team remains available for direct inquiries.';
  const email = settings?.maintenance_contact_email || settings?.company_email || 'sales@omronics.com';
  const phone = settings?.maintenance_contact_phone || settings?.phone || '+91 9512953737';
  const companyName = settings?.company_name || 'Omronics Automation';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B36] via-[#113F67] to-[#0A162B] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#87C0CD]/30">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#226597]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#87C0CD]/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-500/5 blur-[160px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="flex items-center space-x-3">
          {settings?.logo ? (
            <img
              src={settings.logo}
              alt={companyName}
              className="h-10 sm:h-12 w-auto object-contain brightness-110 drop-shadow-md"
            />
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#226597] to-[#87C0CD] flex items-center justify-center font-black text-white text-xl shadow-lg">
                Ω
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-display">
                {companyName}
              </span>
            </div>
          )}
        </div>

        {/* Live Maintenance Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
          <span>System Maintenance In Progress</span>
        </div>
      </header>

      {/* Center Hero Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 sm:py-16 text-center space-y-8">
        {/* Animated Icon Avatar */}
        <div className="inline-flex relative mx-auto group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-amber-400/40 via-sky-400/30 to-[#87C0CD]/40 blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1b3b64] to-[#0d1d36] border border-white/20 shadow-2xl flex items-center justify-center">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 animate-bounce transition-transform duration-700" />
            <Sparkles className="w-5 h-5 text-sky-300 absolute top-3 right-3 animate-pulse" />
          </div>
        </div>

        {/* Heading & Notice */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight drop-shadow-sm">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {message}
          </p>
        </div>

        {/* Expected Status Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl mx-auto space-y-4 shadow-xl text-left">
          <div className="flex items-start space-x-3 text-sm text-slate-200">
            <Clock className="w-5 h-5 text-[#87C0CD] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">We'll be back online shortly</span>
              <p className="text-xs text-slate-300 mt-0.5">
                Our technicians are implementing updates. Thank you for your patience and understanding.
              </p>
            </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Direct Contact Buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Need Immediate Quotations or Assistance?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#226597] to-[#113F67] hover:from-[#113F67] hover:to-[#226597] text-white font-bold text-xs tracking-wide border border-sky-400/30 transition duration-300 shadow-md hover:shadow-sky-500/20 active:scale-98"
              >
                <Phone className="w-4 h-4 text-[#87C0CD]" />
                <span>Call {phone}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs tracking-wide border border-white/15 transition duration-300 shadow-md active:scale-98"
              >
                <Mail className="w-4 h-4 text-[#87C0CD]" />
                <span>Email {email}</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer with Admin Link */}
      <footer className="relative z-10 px-6 sm:px-12 py-5 border-t border-white/10 backdrop-blur-md bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          © {new Date().getFullYear()} {companyName}. All Rights Reserved.
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/login"
            className="inline-flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition text-[11px] font-medium"
          >
            <Lock className="w-3 h-3" />
            <span>Administrator Access</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
