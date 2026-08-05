import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Zap,
  Shield,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Clock,
  Wrench,
  DollarSign,
  Users,
  Factory,
  Layers,
  Sparkles,
  CircuitBoard,
  Shirt,
  Pill,
  Milk,
  Boxes,
  ZapOff,
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
  Building,
} from 'lucide-react';
import { Hero3D } from '../../components/3d/Hero3D';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

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

  // 18 Sectors We Support (From User Screenshot)
  const sectors = [
    { name: 'Textile', icon: Shirt, color: 'from-pink-500 to-rose-500' },
    { name: 'Pharma', icon: Pill, color: 'from-emerald-500 to-teal-500' },
    { name: 'Dairy', icon: Milk, color: 'from-sky-400 to-blue-500' },
    { name: 'Plastic', icon: Boxes, color: 'from-amber-400 to-orange-500' },
    { name: 'Steel & Power', icon: Flame, color: 'from-orange-500 to-red-600' },
    { name: 'Paper', icon: Scroll, color: 'from-yellow-400 to-amber-500' },
    { name: 'Solar', icon: Sun, color: 'from-yellow-300 to-amber-500' },
    { name: 'Water', icon: Droplets, color: 'from-cyan-400 to-blue-600' },
    { name: 'Cement', icon: HardHat, color: 'from-slate-400 to-zinc-600' },
    { name: 'Automobile', icon: Car, color: 'from-blue-500 to-indigo-600' },
    { name: 'Machine Tool', icon: SettingsIcon, color: 'from-purple-500 to-indigo-600' },
    { name: 'Rubber & Tyre', icon: Disc, color: 'from-zinc-500 to-slate-700' },
    { name: 'Robotix', icon: Bot, color: 'from-cyan-400 to-indigo-500' },
    { name: 'Food & Beverage', icon: Utensils, color: 'from-red-400 to-rose-600' },
    { name: 'Warehouse', icon: Warehouse, color: 'from-amber-500 to-orange-600' },
    { name: 'Energy & Utility', icon: Zap, color: 'from-yellow-400 to-orange-500' },
    { name: 'Printing Packaging', icon: Printer, color: 'from-indigo-400 to-violet-600' },
    { name: 'Manufacturing', icon: Factory, color: 'from-cyan-500 to-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Omronics - Next Generation Industrial Automation & Servo Solutions"
        description="ISO-certified manufacturer of high-flexibility servo cables, PLC relay interface cards, PROFINET patch cables, and machine retrofitting solutions."
      />

      <Header />

      <main className="flex-1 pt-24">
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12">
          {/* Background Ambient Lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column: Hero Text & CTA */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 text-center lg:text-left"
              >
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Precision Engineering for Heavy Automation</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-tight">
                  High-Performance <span className="text-gradient">Servo Cables & Automation</span> Systems
                </h1>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Omronics Motions and Control Pvt Ltd is a trusted partner in industrial automation. We engineer high-flexibility drag chain cables, opto-isolated relay interface modules, and custom connectivity solutions.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <span>Request Custom Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <RouterLink
                    to="/products"
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-2xl transition flex items-center justify-center space-x-2"
                  >
                    <span>Explore Products</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </RouterLink>
                </div>

                {/* Badges / Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80">
                  <div>
                    <span className="text-2xl font-extrabold text-white font-display">10M+</span>
                    <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Flex Cycles Tested</span>
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-white font-display">500+</span>
                    <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Industrial Clients</span>
                  </div>
                  <div>
                    <span className="text-2xl font-extrabold text-white font-display">ISO 9001</span>
                    <span className="block text-[11px] text-slate-400 uppercase tracking-wider">Certified Standard</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive 3D Canvas */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="hidden lg:block relative"
              >
                <div className="glass-panel rounded-3xl p-4 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <Hero3D />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Interactive Servo Cable Mesh</span>
                      <span className="block text-[10px] text-slate-400">Shielded against high EMI industrial noise</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-bold uppercase">
                      Active Realtime
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* OVERVIEW SECTION (IMAGE 1: Empowering Automation with Smart Connectivity Solutions) */}
        <section className="py-20 bg-slate-900/60 relative border-t border-slate-800/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>About Omronics</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-white">
                  Empowering Automation with <span className="text-gradient">Smart Connectivity Solutions</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  <strong className="text-cyan-300 font-semibold">Omronics Motions and Control Pvt Ltd</strong> is a trusted partner in industrial automation solutions. We specialise in servo cables, relay cards, breakout boards, converters, communication cables, patch codes, and customised cables, serving diverse industrial sectors with reliable and innovative products.
                </p>

                {/* 5-Item Checklist */}
                <div className="space-y-3 pt-2">
                  {[
                    'Uncompromised Quality',
                    'Industry-Specific Customization',
                    'Timely Delivery',
                    'Technical Support & Guidance',
                    'Trusted by OEMs & System Integrators',
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center space-x-3 text-sm font-semibold text-slate-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Decorative Graphic Panel */}
              <div className="lg:col-span-5 relative">
                <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 space-y-6 shadow-2xl relative">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <CircuitBoard className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">Engineered For Zero Downtime</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our assemblies undergo 100% automated continuity, insulation resistance, and high-voltage breakdown testing to deliver flawless field operation.
                  </p>
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
                  >
                    <span>Connect With Technical Expert</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EVOLUTION & WHY CHOOSE US (IMAGE 2: Every connection we create drives progress) */}
        <section className="py-20 bg-slate-950 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 font-mono">Our Core Purpose</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-gradient">
                Every connection we create drives progress.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Card 1: The Evolution of Omronics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-100">The Evolution of Omronics</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    From startup spark to industry specialist, Omronics has come a long way. With a strong foundation in design and manufacturing, we've built a reputation for delivering smart, scalable, and reliable automation products.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center text-xs font-semibold text-cyan-400 space-x-2">
                  <span>Continuous Innovation Since Inception</span>
                </div>
              </motion.div>

              {/* Card 2: Visual Assembly Highlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-panel rounded-3xl p-8 border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-slate-950 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-1 shadow-xl shadow-cyan-500/30 my-4">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-cyan-400">
                    <Cpu className="w-10 h-10 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white font-display">Heavy Industrial Grade Harnesses</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Custom molded M12, M23, and D-Sub connectors engineered for continuous motion & severe ambient temperatures.
                  </p>
                </div>
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold transition"
                >
                  Request Sample Assembly
                </button>
              </motion.div>

              {/* Card 3: Why Choose Us */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                      <Shield className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-100">Why Choose Us</h3>

                  <ul className="space-y-2.5 pt-1">
                    {[
                      'Quality Assurance',
                      'Technical Expertise',
                      'Wide Product Range',
                      'Customer-Centric Approach',
                      'Innovative Solutions',
                      'Trust & Reliability',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2.5 text-xs text-slate-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CORE STRENGTHS (IMAGE 3: Delivering Value Through Excellence) */}
        <section className="py-20 bg-slate-900/40 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                Our Strengths
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Delivering Value Through Excellence
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto">
                At Omronics, our success is built on a foundation of quality, innovation, and customer satisfaction. Here's what sets us apart:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Strength 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Quality-First Manufacturing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We follow stringent quality control processes at every stage — from sourcing raw materials to final testing — ensuring each product meets industrial-grade standards for performance and durability.
                </p>
              </motion.div>

              {/* Strength 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Customization Capabilities</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We understand that every application is different. That's why we offer fully customized solutions, including tailor-made cables, connectors, and interface modules to suit your exact technical needs.
                </p>
              </motion.div>

              {/* Strength 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Experienced Technical Team</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our engineers and technicians bring years of hands-on industry experience. Whether it's product selection, system integration, or troubleshooting, we provide expert support at every step.
                </p>
              </motion.div>

              {/* Strength 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Fast Turnaround & Delivery</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Time is critical in automation. With streamlined production processes and efficient logistics, we ensure your orders are fulfilled accurately and delivered on schedule.
                </p>
              </motion.div>

              {/* Strength 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-cyan-500/40 transition group md:col-span-2 lg:col-span-1"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Competitive Pricing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We offer the best value without compromising on quality. Our cost-effective manufacturing practices allow us to provide reliable products at industry-competitive prices.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTORS WE SUPPORT (IMAGE 4: 18 Industry Sector Grid) */}
        <section className="py-20 bg-slate-950 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                Industries We Serve
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Sectors We Support
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Engineered connectivity and control assemblies specialized for high-demand industrial sectors.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {sectors.map((sec, idx) => {
                const IconComponent = sec.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 transition group"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shadow-inner`}>
                      <IconComponent className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition font-display">
                      {sec.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CORE PRODUCT CATEGORIES */}
        <section className="py-20 bg-slate-900/40 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Our Technical Scope</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Engineered Product Categories</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Explore our comprehensive lineup of industrial automation components manufactured to exact original equipment standards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between transition group"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 font-display group-hover:text-cyan-400 transition">{cat.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{cat.short_description}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/60">
                    <RouterLink
                      to={`/products?category=${cat.slug}`}
                      className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>Browse Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </RouterLink>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS SHOWCASE */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-slate-950 relative border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Featured Assemblies</span>
                  <h2 className="text-3xl font-extrabold font-display text-white">Top Industry Products</h2>
                </div>
                <RouterLink
                  to="/products"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <span>View Entire Catalog ({featuredProducts.length}+)</span>
                  <ArrowRight className="w-4 h-4" />
                </RouterLink>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((prod) => (
                  <div key={prod.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
                        {prod.thumbnail_image ? (
                          <img
                            src={prod.thumbnail_image}
                            alt={prod.product_name}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <Cpu className="w-16 h-16 text-slate-800" />
                        )}
                        {prod.datasheet_available ? (
                          <span className="absolute top-3 right-3 px-2 py-1 rounded bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-[10px] font-bold flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>PDF Spec</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="p-6 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{prod.category_name}</span>
                        <h3 className="text-base font-bold text-slate-100 font-display group-hover:text-cyan-400 transition">{prod.product_name}</h3>
                        {prod.model_number && <span className="inline-block text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{prod.model_number}</span>}
                        <p className="text-xs text-slate-400 line-clamp-2 pt-1">{prod.short_description}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center justify-between gap-3">
                      <RouterLink
                        to={`/products/${prod.slug}`}
                        className="flex-1 text-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                      >
                        Details
                      </RouterLink>
                      <button
                        onClick={() => setLeadModalOpen(true)}
                        className="flex-1 text-center py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TESTIMONIALS SECTION */}
        {testimonials.length > 0 && (
          <section className="py-20 bg-slate-900/60 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Client Feedback</span>
              <h2 className="text-3xl font-extrabold font-display mt-2 mb-12 text-white">Trusted by Plant Engineers</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {testimonials.map((t) => (
                  <div key={t.id} className="glass-panel p-6 rounded-2xl space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">"{t.review}"</p>
                    <div className="flex items-center space-x-3 pt-2 border-t border-slate-800">
                      <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold text-sm border border-cyan-800">
                        {t.customer_name[0]}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-100">{t.customer_name}</span>
                        <span className="block text-[11px] text-slate-400">{t.designation || 'Engineer'}, {t.company_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="Request Industrial Quote" />
    </div>
  );
}
