import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, ArrowLeft, ArrowRight, CheckSquare, Wrench } from 'lucide-react';
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
      <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <Cpu className="w-8 h-8 text-[#226597] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Engineering Service Specifications...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col justify-between font-sans">
        <Header />
        <div className="text-center py-32 space-y-4">
          <h2 className="text-2xl font-bold font-display text-[#113F67]">Service Not Found</h2>
          <RouterLink to="/services" className="inline-flex items-center space-x-2 text-xs font-bold text-[#226597] hover:text-[#113F67]">
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
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title={service.seo_title || `${service.service_name} | Omronics Engineering Services`}
        description={service.seo_description || service.short_description}
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
            <RouterLink to="/services" className="hover:text-[#226597]">Engineering Services</RouterLink>
            <span>/</span>
            <span className="text-[#226597] font-bold">{service.service_name}</span>
          </div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-xs font-bold uppercase tracking-wider shadow-sm">
                <Wrench className="w-3.5 h-3.5 text-[#226597]" />
                <span>Industrial Automation Service</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#113F67] leading-tight break-words">
                {service.service_name}
              </h1>

              {service.short_description && (
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed break-words whitespace-pre-line">
                  {service.short_description}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-8 py-3.5 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-2xl shadow-md transition transform hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Request Service Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner/Thumbnail Image Stage */}
            <div className="lg:col-span-5 relative">
              <div className="glass-panel p-4 rounded-3xl border border-[#87C0CD]/40 shadow-md relative overflow-hidden h-80 flex items-center justify-center bg-white">
                {service.banner_image || service.thumbnail_image ? (
                  <img
                    src={service.banner_image || service.thumbnail_image}
                    alt={service.service_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Wrench className="w-20 h-20 text-[#87C0CD]" />
                )}
              </div>
            </div>
          </div>

          {/* Full Description / Overview */}
          {service.description && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#87C0CD]/40 mb-12 shadow-sm">
              <h2 className="text-xl font-bold font-display text-[#113F67]">Service Overview</h2>
              <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed break-words">
                {service.description}
              </div>
            </div>
          )}

          {/* SOLUTIONS & KEY BENEFITS SECTION */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#87C0CD]/40 bg-white space-y-12 shadow-md mb-12">
            {/* 1. Solutions Provided Section */}
            {solutionsList.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#113F67]">
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
                      className="flex items-start space-x-3 text-sm font-semibold text-[#113F67]"
                    >
                      <div className="w-6 h-6 rounded bg-[#226597] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
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
              <div className="space-y-6 pt-6 border-t border-[#87C0CD]/30">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-[#113F67]">
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
                      className="flex items-start space-x-3 text-sm font-semibold text-[#113F67]"
                    >
                      <div className="w-6 h-6 rounded bg-[#226597] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
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
