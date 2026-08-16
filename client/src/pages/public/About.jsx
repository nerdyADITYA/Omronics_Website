import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Cpu,
  Award,
  Zap,
  CheckCircle2,
  Star,
  Target,
  Lightbulb,
  Users,
  Wrench,
  Cable,
  ArrowRight,
  Handshake,
  Sparkles,
  Wind,
  Sliders,
  Layers,
  Activity,
  Compass,
  Rocket,
  Check,
  Building2,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';

export function About() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  // 8 Core Business Segments Data
  const businessSegments = [
    {
      num: '01',
      title: 'Industrial Blowers',
      description:
        'We provide industrial blower solutions for applications requiring efficient air movement, ventilation, cooling, drying, exhaust, and process air circulation. Our blower range is suitable for various industrial machinery and process applications.',
      icon: Wind,
      accent: 'from-cyan-500 to-blue-500',
    },
    {
      num: '02',
      title: 'Control Panels',
      description:
        'We design and manufacture customized control panels for industrial machines and automation systems. These panels can integrate PLCs, HMIs, VFDs, servo drives, relays, contactors, protection devices, and other automation components.',
      icon: Sliders,
      accent: 'from-blue-500 to-indigo-500',
    },
    {
      num: '03',
      title: 'Power Panels',
      description:
        'Our power panels are designed for reliable distribution, switching, protection, and control of electrical power within industrial facilities and machinery.',
      icon: Zap,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      num: '04',
      title: 'PD Panels',
      description:
        'We provide customized Power Distribution (PD) Panels designed for organized and safe distribution of electrical power to multiple machines, production lines, and industrial loads.',
      icon: Layers,
      accent: 'from-indigo-500 to-purple-500',
    },
    {
      num: '05',
      title: 'APFC Panels',
      description:
        'Our Automatic Power Factor Correction (APFC) Panels are designed to improve power factor and optimize electrical power utilization by automatically controlling capacitor banks according to the connected load.',
      icon: Activity,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      num: '06',
      title: 'Servo Cables',
      description:
        'Omronics Automation supplies servo motor cables and related motion-control cabling solutions for industrial automation applications. We support cables for various servo systems, including power, encoder, feedback, brake, and communication connections, depending on application requirements.',
      icon: Cable,
      accent: 'from-cyan-400 to-sky-500',
    },
    {
      num: '07',
      title: 'Relay Modules',
      description:
        'We offer relay modules for industrial control applications, providing reliable electrical isolation and interface between PLCs, controllers, sensors, actuators, and field devices.',
      icon: Cpu,
      accent: 'from-purple-500 to-pink-500',
    },
    {
      num: '08',
      title: 'Customized Cables',
      description:
        'Our customized cable solutions are developed according to specific machine and automation requirements. Cable assemblies can be supplied with selected lengths, connectors, pin configurations, shielding, wire specifications, labels, and termination arrangements.',
      icon: Wrench,
      accent: 'from-orange-500 to-red-500',
    },
  ];

  // Expertise List
  const expertiseItems = [
    'Industrial Automation Solutions',
    'Electrical Control Panels',
    'Power Distribution Systems',
    'APFC Solutions',
    'Industrial Blowers',
    'Servo & Motion Control Cabling',
    'Encoder & Feedback Cables',
    'Customized Cable Harnesses',
    'Relay Interface Modules',
    'Machine Electrical Solutions',
    'OEM & Machine Builder Solutions',
    'Customized Industrial Solutions',
  ];

  // Approach Pillars
  const approachPillars = ['Reliability', 'Quality', 'Performance', 'Safety', 'Customization'];

  // Mission Goals
  const missionGoals = [
    'Improved machine performance',
    'Higher operational reliability',
    'Better electrical safety',
    'Reduced downtime',
    'Efficient power utilization',
    'Simplified machine integration',
    'Reliable motion-control connectivity',
    'Customized solutions for unique applications',
  ];

  // Why Choose Us Bullet Points
  const whyChoosePoints = [
    'Established in 2018',
    'Industrial automation expertise',
    'Customized engineering solutions',
    'Wide range of automation and electrical products',
    'Application-focused technical support',
    'Quality-oriented manufacturing',
    'Customized cable assembly capability',
    'Solutions for OEMs and machine builders',
    'Responsive customer service',
    'Focus on reliability and long-term performance',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="About Us | Omronics Automation"
        description="Omronics Automation is an industrial automation and electrical engineering company established in 2018, providing reliable automation products, electrical control solutions, and customized industrial systems."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        {/* HERO BANNER & COMPANY OVERVIEW */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-tr from-cyan-500/10 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Us</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight max-w-5xl mx-auto">
              Engineering Excellence in <span className="text-gradient">Industrial Automation</span>
            </h1>

            <div className="max-w-4xl mx-auto space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed text-left sm:text-center glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800">
              <p>
                <strong className="text-cyan-400 font-semibold">Omronics Automation</strong> is an industrial automation and electrical engineering company established in <strong>2018</strong>, providing reliable automation products, electrical control solutions, and customized industrial systems for a wide range of manufacturing and industrial applications.
              </p>
              <p>
                Since our inception, we have focused on delivering quality products, engineered solutions, customized cable assemblies, control panels, and industrial automation solutions that help industries improve productivity, operational reliability, safety, and machine performance.
              </p>
              <p>
                With practical industry knowledge and a customer-focused approach, Omronics Automation works closely with machine manufacturers, OEMs, system integrators, electrical contractors, and industrial end users to understand their requirements and provide application-oriented solutions.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 1: OUR CORE BUSINESS SEGMENTS */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                Product & Solution Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Our Core Business Segments
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Comprehensive range of engineered products and customized industrial solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessSegments.map((seg, idx) => {
                const IconComponent = seg.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${seg.accent} p-0.5 shadow-lg`}>
                          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                            <IconComponent className="w-6 h-6 text-cyan-400" />
                          </div>
                        </div>
                        <span className="text-xs font-extrabold font-display text-slate-500 group-hover:text-cyan-400 transition">
                          {seg.num}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-white group-hover:text-cyan-400 transition">
                        {seg.title}
                      </h3>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {seg.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2: OUR EXPERTISE & OUR APPROACH */}
        <section className="py-16 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* OUR EXPERTISE */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                  Specialized Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  Our Expertise
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Omronics Automation combines industrial automation, electrical control, motion control, panel engineering, and cable assembly expertise to provide integrated solutions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {expertiseItems.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-xs font-medium text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* OUR APPROACH */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-widest">
                  Application-Specific Strategy
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  Our Approach
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  We believe that every machine and industrial application has different requirements. Therefore, our approach is focused on providing application-specific solutions rather than one-size-fits-all products.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2">
                  From understanding the customer's requirement to product selection, customization, manufacturing, testing, and support, we aim to provide solutions that deliver:
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {approachPillars.map((pillar, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-700/50 text-cyan-300 font-bold text-xs shadow-md tracking-wide flex items-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{pillar}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: VISION & MISSION */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* OUR VISION */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 space-y-6 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Compass className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-extrabold font-display text-white">Our Vision</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  To become a trusted and recognized name in industrial automation and electrical engineering, delivering innovative, reliable, and cost-effective solutions to industries across India and global markets.
                </p>
              </div>
            </motion.div>

            {/* OUR MISSION */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Rocket className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-extrabold font-display text-white">Our Mission</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Our mission is to provide high-quality automation products and engineered electrical solutions that help our customers achieve:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {missionGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                    <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4: WHY CHOOSE OMRONICS AUTOMATION? */}
        <section className="py-16 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-bold uppercase tracking-widest">
                Proven Track Record
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Why Choose Omronics Automation?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
                Discover the key strengths and advantages that make us the preferred partner for machine builders and industrial operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {whyChoosePoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition group flex flex-col justify-between space-y-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition leading-snug">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: OUR COMMITMENT & CTA */}
        <section className="py-20 bg-slate-900/50 border-t border-slate-900 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="glass-panel max-w-4xl mx-auto p-10 rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 space-y-6 shadow-2xl relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
                <HeartHandshake className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">Our Commitment</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                At Omronics Automation, we are committed to building long-term relationships with our customers through quality products, dependable solutions, technical expertise, and continuous improvement.
              </p>
              <p className="text-xs sm:text-sm font-semibold text-cyan-300 max-w-2xl mx-auto italic">
                "Our goal is not simply to supply products, but to become a reliable automation partner for our customers throughout their machine development, production, and industrial operations."
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Request Industrial Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="Request Industrial Quote" />
    </div>
  );
}
