import React, { useState, useEffect } from 'react';
import { Building2, Globe } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import api from '../../services/api';

export function Clients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.get('/clients?status=ACTIVE');
        if (res.success) setClients(res.data);
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    }
    loadClients();
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="Clients & Partners | Omronics Automation"
        description="Omronics is a trusted partner to over 500 OEM machine builders, panel integrators, and industrial manufacturing plants worldwide."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
              OEM Partners
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              Trusted By Industry Leaders
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              We provide high-reliability products to top machine builders, OEMs, system integrators, and industrial manufacturing plants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {clients.map((c) => (
              <div key={c.id} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center space-y-4 group transition transform hover:-translate-y-1 border border-[#87C0CD]/40 shadow-sm hover:border-[#226597]">
                <div className="w-full h-28 rounded-xl bg-white p-4 flex items-center justify-center shadow-md border border-[#87C0CD]/30 group-hover:shadow-lg transition">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.client_name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#87C0CD]" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#113F67] font-display group-hover:text-[#226597] transition">{c.client_name}</h3>
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#226597] hover:underline inline-flex items-center space-x-1 font-semibold"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
