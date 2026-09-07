import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, ArrowRight, ChevronDown, ChevronRight, Layers, Tag } from 'lucide-react';
import { LeadModal } from './LeadModal';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';

export function Header() {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const location = useLocation();

  // Mega-menu navigation tree state
  const [navigationTree, setNavigationTree] = useState([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [isProductsHovered, setIsProductsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch lightweight categories and subproducts navigation tree
  useEffect(() => {
    async function loadNavigationTree() {
      try {
        const res = await api.get('/categories/navigation-menu');
        if (res.success && Array.isArray(res.data)) {
          setNavigationTree(res.data);
          if (res.data.length > 0) {
            setHoveredCategoryId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load navigation menu', err);
      }
    }
    loadNavigationTree();
  }, []);

  const handleMouseEnterProducts = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsProductsHovered(true);
  };

  const handleMouseLeaveProducts = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProductsHovered(false);
    }, 200);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasDropdown: true },
    { name: 'Services', path: '/services' },
    { name: 'Industries', path: '/industries' },
    { name: 'Clients', path: '/clients' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const activeCategory =
    navigationTree.find((c) => String(c.id) === String(hoveredCategoryId)) || navigationTree[0];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-[#87C0CD]/30 dark:border-[#233554] py-3 shadow-md'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
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
                  <div className="w-full h-full bg-white dark:bg-[#111c33] rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-[#226597] dark:text-[#38bdf8] group-hover:rotate-12 transition" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight font-display text-[#113F67] dark:text-slate-100">
                    {settings?.company_name || 'OMRONICS'}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#226597] dark:text-[#38bdf8] font-semibold">
                    Industrial Automation
                  </span>
                </div>
              </>
            )}
          </RouterLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 bg-white/85 dark:bg-[#152238]/85 p-1.5 rounded-full border border-[#87C0CD]/40 dark:border-[#233554] shadow-sm backdrop-blur-md relative">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;

              if (link.hasDropdown) {
                return (
                  <div
                    key={link.path}
                    className="relative"
                    onMouseEnter={handleMouseEnterProducts}
                    onMouseLeave={handleMouseLeaveProducts}
                  >
                    <RouterLink
                      to={link.path}
                      className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center space-x-1 ${
                        isActive || isProductsHovered
                          ? 'bg-[#226597] text-white shadow-sm'
                          : 'text-[#113F67] dark:text-slate-200 hover:text-[#226597] hover:bg-[#F3F9FB] dark:hover:bg-[#1e2e4a]'
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                          isProductsHovered ? 'rotate-180' : ''
                        }`}
                      />
                    </RouterLink>

                    {/* Hover Mega-Menu Dropdown */}
                    {isProductsHovered && navigationTree.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="w-[880px] max-w-[96vw] bg-white dark:bg-[#152238] rounded-2xl shadow-2xl border border-[#87C0CD]/40 dark:border-[#233554] overflow-hidden flex flex-row font-sans">
                          {/* Left Column: Categories List */}
                          <div className="w-72 bg-[#F8FCFD] dark:bg-[#0f1b36] border-r border-[#87C0CD]/30 dark:border-[#233554] p-3 space-y-1 shrink-0">
                            <div className="px-2 py-1 flex items-center justify-between border-b border-[#87C0CD]/20 dark:border-[#233554] mb-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#226597] dark:text-[#38bdf8]">
                                Product Categories
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {navigationTree.length}
                              </span>
                            </div>

                            <div className="max-h-[380px] overflow-y-auto space-y-1 pr-1">
                              {navigationTree.map((cat) => {
                                const isCurrent =
                                  activeCategory && String(activeCategory.id) === String(cat.id);
                                return (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onMouseEnter={() => setHoveredCategoryId(cat.id)}
                                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer text-left ${
                                      isCurrent
                                        ? 'bg-[#226597] text-white shadow-xs'
                                        : 'text-[#113F67] dark:text-slate-200 hover:bg-[#E4F1F5] dark:hover:bg-[#1e2e4a]'
                                    }`}
                                  >
                                    <span className="pr-1.5 leading-snug break-words">{cat.name}</span>
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 shrink-0 ${
                                        isCurrent ? 'text-white' : 'text-slate-400'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Panel: Subproducts Grid */}
                          <div className="flex-1 p-5 bg-white dark:bg-[#152238] flex flex-col justify-between min-h-[360px] max-h-[440px]">
                            <div>
                              {/* Active Category Header */}
                              <div className="flex items-center justify-between border-b border-[#87C0CD]/30 dark:border-[#233554] pb-3 mb-3">
                                <div>
                                  <h3 className="text-sm font-extrabold text-[#113F67] dark:text-slate-100 font-display">
                                    {activeCategory?.name}
                                  </h3>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {activeCategory?.subproducts?.length || 0} subproduct(s) available
                                  </span>
                                </div>

                                <RouterLink
                                  to={`/products?category=${activeCategory?.slug}`}
                                  onClick={() => setIsProductsHovered(false)}
                                  className="text-xs font-bold text-[#226597] dark:text-[#38bdf8] hover:underline flex items-center space-x-1"
                                >
                                  <span>View Category Catalog</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </RouterLink>
                              </div>

                              {/* Subproducts Grid */}
                              {activeCategory?.subproducts && activeCategory.subproducts.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                  {activeCategory.subproducts.map((prod) => (
                                    <RouterLink
                                      key={prod.id}
                                      to={`/products/${prod.slug}`}
                                      onClick={() => setIsProductsHovered(false)}
                                      className="p-2.5 rounded-xl bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/60 hover:bg-[#E4F1F5] dark:hover:bg-[#1e2e4a] border border-[#87C0CD]/30 dark:border-[#233554] hover:border-[#226597] transition flex items-center justify-between group cursor-pointer"
                                    >
                                      <div className="flex flex-col min-w-0 pr-2 flex-1">
                                        <span className="text-xs font-bold text-[#113F67] dark:text-slate-100 group-hover:text-[#226597] dark:group-hover:text-[#38bdf8] leading-snug break-words">
                                          {prod.product_name}
                                        </span>
                                        {prod.model_number && (
                                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                            {prod.model_number}
                                          </span>
                                        )}
                                      </div>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#226597] dark:group-hover:text-[#38bdf8] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    </RouterLink>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                                  <Tag className="w-6 h-6 mx-auto mb-2 text-slate-400 opacity-60" />
                                  <p>No subproducts listed yet under this category.</p>
                                  <RouterLink
                                    to={`/products?category=${activeCategory?.slug}`}
                                    onClick={() => setIsProductsHovered(false)}
                                    className="mt-2 inline-block text-xs font-bold text-[#226597] dark:text-[#38bdf8] hover:underline"
                                  >
                                    Browse all products in catalog →
                                  </RouterLink>
                                </div>
                              )}
                            </div>

                            {/* Bottom bar inside dropdown */}
                            <div className="pt-3 border-t border-[#87C0CD]/20 dark:border-[#233554] flex items-center justify-between text-[11px] text-slate-500">
                              <span>Select a product above to view specifications & pricing</span>
                              <RouterLink
                                to="/products"
                                onClick={() => setIsProductsHovered(false)}
                                className="font-bold text-[#113F67] dark:text-slate-200 hover:text-[#226597]"
                              >
                                View Complete Catalog →
                              </RouterLink>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <RouterLink
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[#226597] text-white shadow-sm'
                      : 'text-[#113F67] dark:text-slate-200 hover:text-[#226597] hover:bg-[#F3F9FB] dark:hover:bg-[#1e2e4a]'
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
              className="px-5 py-2 rounded-full bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs shadow-md hover:shadow-lg transition duration-300 flex items-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Request Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] text-[#113F67] dark:text-slate-200 hover:text-[#226597] shadow-sm"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0b1329]/95 border-b border-[#87C0CD]/30 dark:border-[#233554] px-4 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top duration-200 shadow-xl max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div key={link.path} className="space-y-1">
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold bg-[#F3F9FB] dark:bg-[#152238] text-[#113F67] dark:text-slate-100">
                      <RouterLink
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1"
                      >
                        {link.name}
                      </RouterLink>
                      <button
                        type="button"
                        onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                        className="p-1 text-[#226597] dark:text-[#38bdf8]"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transform transition-transform ${
                            mobileProductsOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mobile Category & Subproducts Accordion */}
                    {mobileProductsOpen && (
                      <div className="pl-3 pr-1 py-2 space-y-3">
                        {navigationTree.map((cat) => (
                          <div key={cat.id} className="space-y-1.5">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#226597] dark:text-[#38bdf8] block px-2">
                              {cat.name}
                            </span>
                            {cat.subproducts && cat.subproducts.length > 0 ? (
                              <div className="space-y-1 pl-2">
                                {cat.subproducts.map((p) => (
                                  <RouterLink
                                    key={p.id}
                                    to={`/products/${p.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#E4F1F5] dark:hover:bg-[#1e2e4a] hover:text-[#226597]"
                                  >
                                    {p.product_name}
                                  </RouterLink>
                                ))}
                              </div>
                            ) : (
                              <RouterLink
                                to={`/products?category=${cat.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block px-3 py-1 rounded-lg text-xs text-slate-400 italic"
                              >
                                View {cat.name} products →
                              </RouterLink>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <RouterLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                    location.pathname === link.path
                      ? 'bg-[#F3F9FB] dark:bg-[#152238] text-[#226597] dark:text-[#38bdf8] border border-[#87C0CD]/40 dark:border-[#233554]'
                      : 'text-[#113F67] dark:text-slate-200 hover:bg-[#F3F9FB] dark:hover:bg-[#152238]'
                  }`}
                >
                  {link.name}
                </RouterLink>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setLeadModalOpen(true);
                }}
                className="w-full py-3 text-center bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
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

