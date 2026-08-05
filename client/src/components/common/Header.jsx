import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, ArrowRight, PhoneCall } from 'lucide-react';
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
          scrolled ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-xl' : 'bg-transparent py-5'
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition transform">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight font-display text-gradient">
                    {settings?.company_name || 'OMRONICS'}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                    Industrial Automation
                  </span>
                </div>
              </>
            )}
          </RouterLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/60 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <RouterLink
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
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
              className="group relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-full font-semibold text-xs transition group hover:scale-105"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 group-hover:from-cyan-300 group-hover:to-indigo-400"></span>
              <span className="relative px-4 py-2 bg-slate-950 text-cyan-300 group-hover:bg-transparent group-hover:text-slate-950 rounded-full transition duration-300 flex items-center space-x-2">
                <span>Request Quote</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => (
              <RouterLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  location.pathname === link.path ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
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
                className="w-full py-3 text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
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
