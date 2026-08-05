import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

import { useSettings } from '../../context/SettingsContext';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <RouterLink to="/" className="flex items-center space-x-3 group">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.company_name || 'Omronics'} className="h-9 max-w-[180px] object-contain rounded-lg" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                  <span className="text-xl font-extrabold tracking-tight font-display text-gradient">
                    {settings?.company_name || 'OMRONICS'}
                  </span>
                </>
              )}
            </RouterLink>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Omronics is an ISO-certified leader in manufacturing high-flexibility servo cables, PLC relay interface cards, PROFINET fieldbus assemblies, and custom automation control panel integration.
            </p>

            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ISO 9001:2015 Certified Manufacturing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <RouterLink to="/products" className="hover:text-cyan-400 transition">All Products Catalog</RouterLink>
              </li>
              <li>
                <RouterLink to="/services" className="hover:text-cyan-400 transition">Engineering Services</RouterLink>
              </li>
              <li>
                <RouterLink to="/industries" className="hover:text-cyan-400 transition">Industries Served</RouterLink>
              </li>
              <li>
                <RouterLink to="/clients" className="hover:text-cyan-400 transition">Clients & Partners</RouterLink>
              </li>
              <li>
                <RouterLink to="/about" className="hover:text-cyan-400 transition">About Omronics</RouterLink>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display mb-4">Core Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Servo Drive Power Cables</li>
              <li>Encoder Feedback Harnesses</li>
              <li>DIN-Rail Relay Modules</li>
              <li>M12 PROFINET Patch Cables</li>
              <li>Custom Machine Retrofitting</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Industrial Automation Complex, Plot 42, Sector 18, Gurugram, HR - 122015'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings?.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{settings?.company_email || 'info@omronics.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings?.company_name || 'Omronics'}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <RouterLink to="/admin/login" className="hover:text-slate-300 transition flex items-center space-x-1">
              <span>Admin Portal Login</span>
              <ExternalLink className="w-3 h-3" />
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
