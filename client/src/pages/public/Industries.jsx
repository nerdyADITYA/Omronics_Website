import React, { useState, useEffect } from 'react';
import { Factory, ShieldCheck, ArrowRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function Industries() {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  useEffect(() => {
    async function loadIndustries() {
      try {
        const res = await api.get('/industries?status=ACTIVE');
        if (res.success) setIndustries(res.data);
      } catch (err) {
        console.error('Failed to load industries', err);
      }
    }
    loadIndustries();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Industries Served | Heavy Manufacturing, Automotive, CNC & Robotics"
        description="Omronics powers automation systems across automotive manufacturing, continuous process plants, renewable energy, pharmaceutical machinery, and packaging lines."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Industries & Applications</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Specialized Industrial Solutions</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Tailored cabling, relay interfaces, and SCADA architectures designed for sector-specific operational environments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industries.map((ind) => (
              <div key={ind.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <Factory className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-100 group-hover:text-cyan-400 transition">{ind.industry_name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{ind.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedIndustry(ind)}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
                  >
                    <span>Industry Solutions Enquiry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {selectedIndustry && (
        <LeadModal
          isOpen={true}
          onClose={() => setSelectedIndustry(null)}
          sourceType="INDUSTRY"
          referenceId={selectedIndustry.id}
          title={`Industry Enquiry: ${selectedIndustry.industry_name}`}
        />
      )}
    </div>
  );
}
