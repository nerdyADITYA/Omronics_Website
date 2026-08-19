import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, Package } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="404 - Page Not Found | Omronics Automation"
        description="The requested page could not be found. Return to Omronics Automation home page or browse industrial automation products."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#E4F1F5] border border-[#87C0CD]/50 flex items-center justify-center text-[#226597] mx-auto shadow-md relative group">
              <FileQuestion className="w-14 h-14 sm:w-20 sm:h-20 text-[#226597] group-hover:scale-110 transition duration-300" />
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#113F67] text-white text-[11px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
              Error 404
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#113F67] tracking-tight">
              Page Not Found
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <RouterLink
              to="/"
              className="w-full sm:w-auto px-7 py-3 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-2xl shadow-md transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home Page</span>
            </RouterLink>

            <RouterLink
              to="/products"
              className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-[#E4F1F5] border border-[#87C0CD]/60 text-[#113F67] font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <Package className="w-4 h-4 text-[#226597]" />
              <span>Browse Products Catalog</span>
            </RouterLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
