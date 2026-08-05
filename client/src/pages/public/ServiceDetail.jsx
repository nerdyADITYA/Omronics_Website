import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, ArrowLeft, ArrowRight, CheckSquare, Wrench, Sparkles, Shield, Clock } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      try {
        const res = await api.get(`/services/slug/${slug}`);
        if (res.success && res.data) {
          setService(res.data);
        }
      } catch (err) {
        console.error('Failed to load service details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Cpu className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Engineering Service Specifications...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Header />
        <div className="text-center py-32 space-y-4">
          <h2 className="text-2xl font-bold font-display">Service Not Found</h2>
          <RouterLink to="/services" className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Engineering Services</span>
          </RouterLink>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse line-separated items for solutions and key features
  const solutionsList = (service.solutions_provided || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const featuresList = (service.key_features || '')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title={service.seo_title || `${service.service_name} | Omronics Engineering Services`}
        description={service.seo_description || service.short_description}
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-8">
            <RouterLink to="/services" className="hover:text-cyan-400">Engineering Services</RouterLink>
            <span>/</span>
            <span className="text-cyan-400 font-bold">{service.service_name}</span>
          </div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950 border border-cyan-800/60 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>Industrial Automation Service</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-white leading-tight break-words">
                {service.service_name}
              </h1>

              {service.short_description && (
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed break-words whitespace-pre-line">
                  {service.short_description}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-500/20 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Request Service Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner/Thumbnail Image Stage */}
            <div className="lg:col-span-5 relative">
              <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden h-80 flex items-center justify-center bg-slate-900">
                {service.banner_image || service.thumbnail_image ? (
                  <img
                    src={service.banner_image || service.thumbnail_image}
                    alt={service.service_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Wrench className="w-20 h-20 text-slate-800" />
                )}
              </div>
            </div>
          </div>

          {/* Full Description / Overview */}
          {service.description && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 mb-12">
              <h2 className="text-xl font-bold font-display text-slate-100">Service Overview</h2>
              <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed break-words">
                {service.description}
              </div>
            </div>
          )}

          {/* SOLUTIONS & KEY BENEFITS SECTION (ORANGE CHECKMARK LISTS - MATCHING USER SCREENSHOT) */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 space-y-12 shadow-2xl mb-12">
            {/* 1. Solutions Provided Section */}
            {solutionsList.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
                  Smart Industry Solutions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solutionsList.map((sol, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start space-x-3 text-sm font-semibold text-slate-200"
                    >
                      <div className="w-6 h-6 rounded bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/30">
                        <CheckSquare className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug pt-0.5">{sol}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Key Benefits / Key Features Section */}
            {featuresList.length > 0 && (
              <div className="space-y-6 pt-6 border-t border-slate-800/80">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
                  Key Benefits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuresList.map((feat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start space-x-3 text-sm font-semibold text-slate-200"
                    >
                      <div className="w-6 h-6 rounded bg-orange-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/30">
                        <CheckSquare className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="leading-snug pt-0.5">{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        title={`Consultation: ${service.service_name}`}
        referenceId={service.id}
        sourceType="SERVICE"
      />
    </div>
  );
}
