import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, ArrowRight } from 'lucide-react';
import { LeadModal } from './LeadModal';
import { useSettings } from '../../context/SettingsContext';

export function Header() {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'Industries', path: '/industries' },
    { name: 'Clients', path: '/clients' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#87C0CD]/30 py-3 shadow-md' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <RouterLink to="/" className="flex items-center space-x-3 group">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.company_name || 'Omronics'}
                className="h-10 max-w-[180px] object-contain rounded-lg"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#113F67] via-[#226597] to-[#87C0CD] p-0.5 shadow-md group-hover:scale-105 transition transform">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-[#226597] group-hover:rotate-12 transition" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight font-display text-[#113F67]">
                    {settings?.company_name || 'OMRONICS'}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#226597] font-semibold">
                    Industrial Automation
                  </span>
                </div>
              </>
            )}
          </RouterLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-white/80 p-1.5 rounded-full border border-[#87C0CD]/40 shadow-sm backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <RouterLink
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[#226597] text-white shadow-sm'
                      : 'text-[#113F67] hover:text-[#226597] hover:bg-[#F3F9FB]'
                  }`}
                >
                  {link.name}
                </RouterLink>
              );
            })}
          </nav>

          {/* Action CTA Button */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => setLeadModalOpen(true)}
              className="px-5 py-2 rounded-full bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs shadow-md hover:shadow-lg transition duration-300 flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <span>Request Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#87C0CD]/40 text-[#113F67] hover:text-[#226597] shadow-sm"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 border-b border-[#87C0CD]/30 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top duration-200 shadow-xl">
            {navLinks.map((link) => (
              <RouterLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                  location.pathname === link.path
                    ? 'bg-[#F3F9FB] text-[#226597] border border-[#87C0CD]/40'
                    : 'text-[#113F67] hover:bg-[#F3F9FB]'
                }`}
              >
                {link.name}
              </RouterLink>
            ))}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLeadModalOpen(true);
                }}
                className="w-full py-3 text-center bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Request a Quote
              </button>
            </div>
          </div>
        )}
      </header>

      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="General Quote Request" />
    </>
  );
}
