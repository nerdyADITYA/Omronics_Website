import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Zap,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Wrench,
  DollarSign,
  Users,
  Factory,
  Layers,
  Sparkles,
  Shirt,
  Pill,
  Milk,
  Boxes,
  Scroll,
  Sun,
  Droplets,
  HardHat,
  Car,
  Settings as SettingsIcon,
  Disc,
  Bot,
  Utensils,
  Warehouse,
  Flame,
  Printer,
  Building2,
  Wind,
  Sliders,
  Activity,
  Cable,
} from 'lucide-react';
import { Hero3D } from '../../components/3d/Hero3D';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';
import homeBg from '../../assets/home-bg.jpeg';

export function Home() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes, testRes] = await Promise.all([
          api.get('/categories?status=ACTIVE&limit=6'),
          api.get('/products?featured=true&status=ACTIVE&limit=6'),
          api.get('/testimonials?status=ACTIVE&limit=4'),
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (prodRes.success) setFeaturedProducts(prodRes.data);
        if (testRes.success) setTestimonials(testRes.data);
      } catch (err) {
        console.error('Failed to fetch home page data', err);
      }
    }
    fetchData();
  }, []);

  // 18 Sectors We Support
  const sectors = [
    { name: 'Textile', icon: Shirt },
    { name: 'Pharma', icon: Pill },
    { name: 'Dairy', icon: Milk },
    { name: 'Plastic', icon: Boxes },
    { name: 'Steel & Power', icon: Flame },
    { name: 'Paper', icon: Scroll },
    { name: 'Solar', icon: Sun },
    { name: 'Water', icon: Droplets },
    { name: 'Cement', icon: HardHat },
    { name: 'Automobile', icon: Car },
    { name: 'Machine Tool', icon: SettingsIcon },
    { name: 'Rubber & Tyre', icon: Disc },
    { name: 'Robotix', icon: Bot },
    { name: 'Food & Beverage', icon: Utensils },
    { name: 'Warehouse', icon: Warehouse },
    { name: 'Energy & Utility', icon: Zap },
    { name: 'Printing Packaging', icon: Printer },
    { name: 'Manufacturing', icon: Factory },
  ];

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="Omronics Automation | Industrial Automation & Electrical Engineering"
        description="Omronics Automation is an industrial automation and electrical engineering company established in 2018, providing reliable automation products, electrical control solutions, and customized industrial systems."
      />

      <Header />

      <main className="flex-1 pt-24">
        {/* HERO SECTION WITH BACKGROUND IMAGE */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12">
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-multiply"
            style={{ backgroundImage: `url(${homeBg})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3F9FB]/40 via-[#F3F9FB]/10 to-[#F3F9FB] pointer-events-none"></div>

          {/* Background Ambient Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-tr from-[#87C0CD]/20 via-[#226597]/10 to-[#113F67]/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Hero Text & CTA */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 text-center lg:text-left"
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-[#226597]" />
                  <span>Established in 2018 • Industrial Automation</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-tight text-[#113F67]">
                  Precision Engineering for <span className="text-gradient">Industrial Automation</span>
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Omronics Automation provides reliable automation products, electrical control solutions, customized cable assemblies, control panels, industrial blowers, and motion control connectivity for machine builders and manufacturing facilities.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-2xl shadow-md transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <span>Request Custom Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <RouterLink
                    to="/products"
                    className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#E4F1F5] border border-[#87C0CD]/60 text-[#113F67] font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>Explore Products</span>
                    <ChevronRight className="w-4 h-4 text-[#226597]" />
                  </RouterLink>
                </div>

                {/* Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-[#113F67]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#226597]" />
                    <span>ISO 9001:2015 Certified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#226597]" />
                    <span>Application-Specific Solutions</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: 3D Interactive Canvas */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="w-full h-[400px] sm:h-[480px] rounded-3xl bg-white/70 border border-[#87C0CD]/40 p-4 shadow-xl backdrop-blur-md overflow-hidden relative group">
                  <Hero3D />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-10 bg-white border-y border-[#87C0CD]/30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">2018</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#226597]">Year Established</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">8+</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#226597]">Core Business Segments</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">18+</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#226597]">Sectors Supported</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">100%</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-[#226597]">Quality & Customization</p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE SEGMENTS PREVIEW */}
        <section className="py-20 bg-[#F3F9FB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-xs font-bold uppercase tracking-widest">
                Our Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
                Engineered for Industrial Applications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                From control panels and APFC systems to servo motor cabling and industrial blowers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Industrial Blowers', desc: 'Air movement, ventilation, cooling, drying, exhaust, and process circulation.', icon: Wind },
                { title: 'Control Panels', desc: 'Customized panels integrating PLCs, HMIs, VFDs, servo drives, and contactors.', icon: Sliders },
                { title: 'Power & APFC Panels', desc: 'Distribution, switching, and automatic power factor correction capacitor control.', icon: Zap },
                { title: 'Servo & Custom Cables', desc: 'Motion-control power, encoder feedback, brake, and customized cable harnesses.', icon: Cable },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="glass-card p-6 rounded-3xl border border-[#87C0CD]/30 space-y-4 hover:border-[#226597] transition group">
                    <div className="w-12 h-12 rounded-2xl bg-[#E4F1F5] border border-[#87C0CD]/40 flex items-center justify-center text-[#226597] group-hover:scale-110 transition shadow-sm">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold font-display text-[#113F67] group-hover:text-[#226597] transition">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-white border-t border-[#87C0CD]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-xs font-bold uppercase tracking-widest">
                    Featured Catalog
                  </span>
                  <h2 className="text-3xl font-extrabold font-display text-[#113F67] mt-2">
                    Popular Products
                  </h2>
                </div>
                <RouterLink to="/products" className="text-xs font-bold text-[#226597] hover:text-[#113F67] flex items-center space-x-1">
                  <span>View Full Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </RouterLink>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((prod) => (
                  <div key={prod.id} className="glass-card rounded-3xl p-6 border border-[#87C0CD]/30 flex flex-col justify-between hover:border-[#226597] transition group">
                    <div className="space-y-4">
                      {prod.thumbnail_image && (
                        <div className="w-full h-44 rounded-2xl bg-[#F3F9FB] p-4 flex items-center justify-center border border-[#87C0CD]/20 overflow-hidden">
                          <img src={prod.thumbnail_image} alt={prod.product_name} className="max-h-full object-contain group-hover:scale-105 transition duration-300" />
                        </div>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-2.5 py-1 rounded-full">
                        {prod.category_name || 'Industrial Product'}
                      </span>
                      <h3 className="text-base font-bold font-display text-[#113F67] group-hover:text-[#226597] transition leading-snug">
                        {prod.product_name}
                      </h3>
                      {prod.model_number && (
                        <p className="text-xs font-mono text-[#226597] font-semibold">Model: {prod.model_number}</p>
                      )}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{prod.short_description}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-4">
                      <RouterLink to={`/products/${prod.slug}`} className="text-xs font-bold text-[#226597] hover:text-[#113F67]">
                        View Details →
                      </RouterLink>
                      <button onClick={() => setLeadModalOpen(true)} className="px-4 py-2 bg-[#226597] hover:bg-[#113F67] text-white text-xs font-bold rounded-xl shadow-sm">
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 18 SECTORS SUPPORTED */}
        <section className="py-20 bg-[#F3F9FB] border-t border-[#87C0CD]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-xs font-bold uppercase tracking-widest">
                Application Reach
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
                Industries & Sectors Supported
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Providing specialized automation, control panels, and custom cabling across diverse industrial fields.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {sectors.map((sec, idx) => {
                const IconComp = sec.icon;
                return (
                  <div
                    key={idx}
                    className="glass-card p-4 rounded-2xl border border-[#87C0CD]/30 flex flex-col items-center text-center space-y-3 hover:border-[#226597] transition group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#E4F1F5] border border-[#87C0CD]/40 flex items-center justify-center text-[#226597] group-hover:scale-110 transition shadow-sm">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#113F67] group-hover:text-[#226597] transition">{sec.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 bg-white border-t border-[#87C0CD]/30 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-panel max-w-4xl mx-auto p-10 rounded-3xl border border-[#87C0CD]/40 bg-gradient-to-b from-[#F3F9FB] via-white to-white space-y-6 shadow-xl relative">
              <div className="w-16 h-16 rounded-2xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597] mx-auto shadow-inner">
                <Award className="w-8 h-8 text-[#226597]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">Need Customized Machine Cabling or Control Panels?</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Connect with Omronics Automation engineering team for custom panel integration, APFC solutions, or specialized cable assemblies.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-8 py-3.5 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-2xl shadow-md transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Request Custom Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="General Quote Request" />
    </div>
  );
}
