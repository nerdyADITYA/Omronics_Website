import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Cpu, ArrowRight, Settings, Wrench, ShieldCheck, Zap } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function Services() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await api.get('/services?status=ACTIVE');
        if (res.success) setServices(res.data);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    }
    loadServices();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="Industrial Engineering Services | Omronics Automation"
        description="Omronics provides electrical control panel manufacturing, SCADA software integration, machine retrofitting, and Industry 4.0 IoT automation services."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
              Engineering Services
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              Turnkey Industrial Automation
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              From custom control panel assembly and power panels to machine retrofitting and real-time SCADA telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div key={svc.id} className="glass-panel p-8 rounded-3xl space-y-4 flex flex-col justify-between group border border-[#87C0CD]/40 shadow-sm hover:border-[#226597] transition">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597] shadow-sm">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <RouterLink to={`/services/${svc.slug}`}>
                    <h3 className="text-xl font-bold font-display text-[#113F67] group-hover:text-[#226597] transition">{svc.service_name}</h3>
                  </RouterLink>
                  <p className="text-xs text-slate-600 leading-relaxed">{svc.short_description}</p>
                  {svc.description && <div className="text-xs text-slate-600 pt-2 line-clamp-4 leading-relaxed">{svc.description}</div>}
                </div>

                <div className="pt-6 border-t border-[#87C0CD]/30 flex items-center justify-between gap-3">
                  <RouterLink
                    to={`/services/${svc.slug}`}
                    className="flex-1 py-2.5 px-3 bg-[#E4F1F5] hover:bg-[#CBE2E8] text-[#113F67] font-bold text-xs rounded-xl transition text-center"
                  >
                    View Details
                  </RouterLink>
                  <button
                    onClick={() => setSelectedService(svc)}
                    className="flex-1 py-2.5 px-3 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1"
                  >
                    <span>Enquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {selectedService && (
        <LeadModal
          isOpen={true}
          onClose={() => setSelectedService(null)}
          sourceType="SERVICE"
          referenceId={selectedService.id}
          title={`Service Enquiry: ${selectedService.service_name}`}
        />
      )}
    </div>
  );
}
