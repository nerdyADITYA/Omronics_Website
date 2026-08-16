import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#113F67] text-slate-100 pt-16 pb-12 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#87C0CD]/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#87C0CD]/20">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <RouterLink to="/" className="flex items-center space-x-3 group">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.company_name || 'Omronics'} className="h-9 max-w-[180px] object-contain rounded-lg bg-white p-1" />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-[#87C0CD] p-0.5 shadow-md">
                    <div className="w-full h-full bg-[#113F67] rounded-[10px] flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-[#87C0CD]" />
                    </div>
                  </div>
                  <span className="text-xl font-extrabold tracking-tight font-display text-white">
                    {settings?.company_name || 'OMRONICS'}
                  </span>
                </>
              )}
            </RouterLink>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Omronics Automation is an industrial automation and electrical engineering company established in 2018, delivering quality products, control panels, customized cable assemblies, and industrial automation solutions.
            </p>

            <div className="flex items-center space-x-2 text-xs text-[#87C0CD] bg-[#226597]/40 border border-[#87C0CD]/30 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>ISO 9001:2015 Certified Manufacturing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#87C0CD] font-display mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <RouterLink to="/products" className="hover:text-[#87C0CD] transition">All Products Catalog</RouterLink>
              </li>
              <li>
                <RouterLink to="/services" className="hover:text-[#87C0CD] transition">Engineering Services</RouterLink>
              </li>
              <li>
                <RouterLink to="/industries" className="hover:text-[#87C0CD] transition">Industries Served</RouterLink>
              </li>
              <li>
                <RouterLink to="/clients" className="hover:text-[#87C0CD] transition">Clients & Partners</RouterLink>
              </li>
              <li>
                <RouterLink to="/about" className="hover:text-[#87C0CD] transition">About Omronics</RouterLink>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#87C0CD] font-display mb-4">Core Solutions</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>Industrial Blowers</li>
              <li>Electrical Control Panels</li>
              <li>Power & APFC Panels</li>
              <li>Servo & Motion Control Cables</li>
              <li>Relay Interface Modules</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#87C0CD] font-display mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#87C0CD] shrink-0 mt-0.5" />
                <span>{settings?.address || 'Plot No. 12, Phase 3, GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat - 382330'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#87C0CD] shrink-0" />
                <span>{settings?.phone || '+91 9512953737'}</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#87C0CD] shrink-0" />
                <span>{settings?.company_email || 'pranav@omronics.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {settings?.company_name || 'Omronics Automation'}. All rights reserved.</p>
          {/* <div className="flex items-center space-x-6">
            <RouterLink to="/admin/login" className="hover:text-white transition flex items-center space-x-1">
              <span>Admin Portal Login</span>
              <ExternalLink className="w-3 h-3" />
            </RouterLink>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
