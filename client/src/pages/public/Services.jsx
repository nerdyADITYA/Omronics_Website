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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Industrial Engineering Services | SCADA & Panel Manufacturing"
        description="Omronics provides electrical control panel manufacturing, SCADA software integration, machine retrofitting, and Industry 4.0 IoT automation services."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Engineering Services</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Turnkey Industrial Automation</h1>
            <p className="text-slate-400 text-xs sm:text-sm">From custom control panel assembly to machine retrofitting and real-time SCADA telemetry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div key={svc.id} className="glass-panel p-8 rounded-3xl space-y-4 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <RouterLink to={`/services/${svc.slug}`}>
                    <h3 className="text-xl font-bold font-display text-slate-100 group-hover:text-cyan-400 transition">{svc.service_name}</h3>
                  </RouterLink>
                  <p className="text-xs text-slate-400 leading-relaxed">{svc.short_description}</p>
                  {svc.description && <div className="text-xs text-slate-300 pt-2 line-clamp-4">{svc.description}</div>}
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-3">
                  <RouterLink
                    to={`/services/${svc.slug}`}
                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition text-center"
                  >
                    View Details
                  </RouterLink>
                  <button
                    onClick={() => setSelectedService(svc)}
                    className="flex-1 py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-1"
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
