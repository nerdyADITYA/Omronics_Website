import React, { useState, useEffect } from 'react';
import { Factory, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="Industries Served | Omronics Automation"
        description="Omronics powers automation systems across automotive manufacturing, continuous process plants, renewable energy, pharmaceutical machinery, and packaging lines."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
              Industries & Applications
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              Specialized Industrial Solutions
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Tailored cabling, relay interfaces, control panels, and automation architectures designed for sector-specific operational environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {industries.map((ind) => (
              <div key={ind.id} className="glass-card rounded-3xl p-6 flex flex-col justify-between group border border-[#87C0CD]/40 shadow-sm hover:border-[#226597] transition">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597] shadow-sm">
                    <Factory className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-[#113F67] group-hover:text-[#226597] transition">{ind.industry_name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{ind.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#87C0CD]/30">
                  <button
                    onClick={() => setSelectedIndustry(ind)}
                    className="w-full py-2.5 px-4 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
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
