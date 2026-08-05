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
  ThumbsUp,
  Wrench,
  Clock,
  DollarSign,
  Headphones,
  RefreshCw,
  Cable,
  ArrowRight,
  Handshake,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';

export function About() {
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  // Core Values Data (From Screenshot 1)
  const coreValues = [
    {
      title: 'Integrity',
      description: 'We uphold honesty, transparency, and ethical conduct in all our dealings.',
      icon: Handshake,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Quality Commitment',
      description: 'We ensure superior quality in every product and service delivered to our customers.',
      icon: Star,
      gradient: 'from-yellow-400 to-amber-500',
    },
    {
      title: 'Customer Focus',
      description: 'We prioritise customer needs and build lasting relationships through responsive support.',
      icon: Target,
      gradient: 'from-indigo-400 to-purple-500',
    },
    {
      title: 'Innovation',
      description: 'We embrace continuous improvement and technological advancements to provide efficient solutions.',
      icon: Lightbulb,
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      title: 'Teamwork',
      description: "We believe in the strength of collaboration, respecting every team member's contribution.",
      icon: Users,
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      title: 'Reliability',
      description: 'We stand by our commitments, delivering consistent performance and timely solutions.',
      icon: ThumbsUp,
      gradient: 'from-cyan-400 to-blue-600',
    },
  ];

  // Technical Strengths / Expertise Data (From Screenshot 2)
  const technicalExpertise = [
    { title: 'Servo & Communication Cables', icon: Cable },
    { title: 'Relay Cards & Breakout Boards', icon: Cpu },
    { title: 'Converters & Patch Cords', icon: RefreshCw },
    { title: 'Customised Cable Solutions', icon: Wrench },
    { title: 'End-to-End Technical Support', icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="About Omronics | Industrial Automation & Smart Connectivity Solutions"
        description="Omronics Motions and Control Pvt Ltd is a trusted partner in industrial automation solutions specializing in servo cables, relay cards, breakout boards, and custom cables."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        {/* HERO BANNER SECTION */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-tr from-cyan-500/10 to-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Us</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight">
              Empowering Automation with <span className="text-gradient">Smart Connectivity Solutions</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
              <strong className="text-cyan-400 font-semibold">Omronics Motions and Control Pvt Ltd</strong> is a trusted partner in industrial automation solutions. We specialise in servo cables, relay cards, breakout boards, converters, communication cables, patch codes, and customised cables, serving diverse industrial sectors with reliable and innovative products.
            </p>
          </div>
        </section>

        {/* SECTION 1: CORE VALUES (SCREENSHOT 1) */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                Core Values
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                What We Stand For
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Guiding principles that define our commitment to excellence, integrity, and customer success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((val, idx) => {
                const IconComponent = val.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="glass-panel p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${val.gradient} p-0.5 shadow-lg`}>
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                          <IconComponent className="w-7 h-7 text-cyan-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold font-display text-white group-hover:text-cyan-400 transition">
                        {val.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2: OUR EXPERTISE (SCREENSHOT 2) */}
        <section className="py-16 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                Our Expertise
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
                Our Technical Strengths
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {technicalExpertise.map((exp, idx) => {
                const IconComp = exp.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="glass-card rounded-2xl p-6 flex flex-col items-center text-center space-y-4 border border-slate-800 hover:border-cyan-500/50 transition group"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shadow-inner">
                      <IconComp className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 font-display group-hover:text-cyan-400 transition leading-snug">
                      {exp.title}
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 3: OUR STRENGTHS (SCREENSHOT 3) */}
        <section className="py-20 bg-slate-900/40 relative border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-widest">
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
                <h3 className="text-lg font-bold text-white font-display">Fast Turnaround & Reliable Delivery</h3>
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

        {/* SECTION 4: EVOLUTION OF OMRONICS & CTA */}
        <section className="py-20 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="glass-panel max-w-4xl mx-auto p-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 space-y-6 shadow-2xl relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold font-display text-white">The Evolution of Omronics</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                From startup spark to industry specialist, Omronics has come a long way. With a strong foundation in design and manufacturing, we've built a reputation for delivering smart, scalable, and reliable automation products.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-xs rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Request Product Quote</span>
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
