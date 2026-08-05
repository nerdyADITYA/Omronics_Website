import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Cpu, FileText, Download, CheckCircle2, ArrowRight, ArrowLeft, Shield, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          setActiveImageIndex(0);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Cpu className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Product Specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Header />
        <div className="text-center py-32 space-y-4">
          <h2 className="text-2xl font-bold font-display">Product Not Found</h2>
          <RouterLink to="/products" className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </RouterLink>
        </div>
        <Footer />
      </div>
    );
  }

  // Unified Gallery Images List
  const allImages = [];
  if (product.thumbnail_image) {
    allImages.push({ image_url: product.thumbnail_image, alt_text: product.product_name });
  }
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img.image_url;
      if (url && !allImages.some((existing) => existing.image_url === url)) {
        allImages.push({ image_url: url, alt_text: img.alt_text || product.product_name });
      }
    });
  }

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const currentImageUrl = allImages[activeImageIndex]?.image_url || '';

  const schemaJson = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.product_name,
    image: currentImageUrl,
    description: product.short_description || '',
    sku: product.model_number || '',
    category: product.category_name || '',
    brand: {
      '@type': 'Brand',
      name: 'Omronics',
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title={product.seo_title || product.product_name}
        description={product.seo_description || product.short_description}
        schemaJson={schemaJson}
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-8">
            <RouterLink to="/products" className="hover:text-cyan-400">Products</RouterLink>
            <span>/</span>
            <span className="text-slate-200">{product.category_name}</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold">{product.product_name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Interactive Gallery Image View & Carousel */}
            <div className="space-y-4">
              {/* Main Image Stage */}
              <div className="h-96 sm:h-[420px] bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Cpu className="w-24 h-24 text-slate-800" />
                )}

                {/* Left/Right Carousel Controls */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white transition shadow-lg opacity-0 group-hover:opacity-100"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white transition shadow-lg opacity-0 group-hover:opacity-100"
                      title="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Lightbox Trigger Button */}
                {currentImageUrl && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700/80 transition shadow"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Thumbnails Selector Strip */}
              {allImages.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-20 h-20 rounded-2xl border p-1 bg-slate-900 shrink-0 transition ${
                        activeImageIndex === i ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-contain rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Overview */}
            <div className="space-y-6 min-w-0">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">{product.category_name}</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-100 mt-1 break-words leading-tight">{product.product_name}</h1>
                {product.model_number && (
                  <div className="mt-2 inline-block text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-lg break-all">
                    Model: {product.model_number}
                  </div>
                )}
              </div>

              {product.short_description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-pre-line">{product.short_description}</p>
              )}

              {product.description && (
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-pre-line pt-2 border-t border-slate-800/80">
                  {product.description}
                </div>
              )}

              {/* CTA Action */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Custom Lengths & Connectors Available</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-1 rounded border border-emerald-800">In Production</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2"
                  >
                    <span>Request Instant Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {product.documents && product.documents.length > 0 && (
                    <a
                      href={product.documents[0].document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>Download PDF Spec</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Key Features List */}
              {product.features && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Key Features</h3>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed break-words">{product.features}</div>
                </div>
              )}
            </div>
          </div>

          {/* Full Specifications Section */}
          {product.specifications && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800 mb-12">
              <h3 className="text-lg font-bold font-display text-slate-100">Technical Specifications</h3>
              <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed break-words">
                {product.specifications}
              </div>
            </div>
          )}

          {/* Applications */}
          {product.applications && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800">
              <h3 className="text-lg font-bold font-display text-slate-100">Industrial Applications</h3>
              <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed break-words">
                {product.applications}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] p-4 flex items-center justify-center">
            <img src={currentImageUrl} alt={product.product_name} className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      <Footer />
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        title={`Request Quote: ${product.product_name}`}
        referenceId={product.id}
        sourceType="PRODUCT"
      />
    </div>
  );
}
