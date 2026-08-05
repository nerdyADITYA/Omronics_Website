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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Clients & Partners | Omronics Industrial Automation"
        description="Omronics is a trusted partner to over 500 OEM machine builders, panel integrators, and industrial manufacturing plants worldwide."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">OEM Partners</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Trusted By Industry Leaders</h1>
            <p className="text-slate-400 text-xs sm:text-sm">We provide high-reliability components to top machine builders, automotive manufacturers, and process control leaders.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {clients.map((c) => (
              <div key={c.id} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-between text-center space-y-4 group transition transform hover:-translate-y-1">
                <div className="w-full h-28 rounded-xl bg-white p-4 flex items-center justify-center shadow-lg border border-slate-200/20 group-hover:bg-white transition">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.client_name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-700" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 font-display group-hover:text-cyan-400 transition">{c.client_name}</h3>
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline inline-flex items-center space-x-1"
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
