import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Cpu, FileText, Download, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

// Helper to render bold markdown syntax like **text**
function renderFormattedText(text) {
  if (typeof text !== 'string') return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-[#113F67]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Helper to render bullet point list for key features
function renderKeyFeatures(featuresText) {
  if (!featuresText) return null;
  const items = featuresText
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-[#87C0CD]/30 font-sans">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#113F67]">Key Features</h3>
      <ul className="space-y-2 text-xs text-slate-600">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#226597] shrink-0 mt-1.5 shadow-xs" />
            <span className="leading-relaxed font-medium">{renderFormattedText(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper to render specifications as clean HTML block table
function renderSpecificationsTable(specText) {
  if (!specText) return null;

  const lines = specText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Check for Markdown table format (lines containing '|')
  const tableLines = lines.filter((l) => l.includes('|'));
  if (tableLines.length >= 2) {
    const rawRows = [];
    tableLines.forEach((line) => {
      if (/^[|:\s-]+$/.test(line.replace(/\|/g, ''))) return;

      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => !(idx === 0 && c === '') && !(idx === arr.length - 1 && c === ''));

      if (cells.length > 0) {
        rawRows.push(cells);
      }
    });

    if (rawRows.length > 0) {
      const hasHeader = tableLines[1] && /^[|:\s-]+$/.test(tableLines[1].replace(/\|/g, ''));
      const headerRow = hasHeader ? rawRows[0] : null;
      const bodyRows = hasHeader ? rawRows.slice(1) : rawRows;

      return (
        <div className="overflow-x-auto rounded-2xl border border-[#87C0CD]/40 bg-white shadow-sm font-sans mt-2">
          <table className="w-full border-collapse text-left text-xs sm:text-sm text-[#113F67]">
            {headerRow && (
              <thead>
                <tr className="bg-[#E4F1F5] text-[#113F67] border-b border-[#87C0CD]/40">
                  {headerRow.map((col, idx) => (
                    <th key={idx} className="px-5 py-3.5 border border-[#87C0CD]/30 font-extrabold uppercase text-[11px] tracking-wider">
                      {renderFormattedText(col)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-[#87C0CD]/20">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#F3F9FB]/70 transition">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className={`px-5 py-3.5 border border-[#87C0CD]/30 font-medium ${cIdx === 0 ? 'bg-[#F3F9FB]/40' : ''}`}>
                      {renderFormattedText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  // Fallback text display
  return (
    <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed break-words">
      {renderFormattedText(specText)}
    </div>
  );
}

// Helper to render Applications
function renderApplications(appText) {
  if (!appText) return null;
  const items = appText
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);

  if (items.length > 1) {
    return (
      <ul className="space-y-2 text-xs sm:text-sm text-slate-600 pt-1 font-sans">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#226597] shrink-0 mt-2 shadow-xs" />
            <span className="leading-relaxed font-medium">{renderFormattedText(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed break-words">
      {renderFormattedText(appText)}
    </div>
  );
}

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
      <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <Cpu className="w-8 h-8 text-[#226597] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Product Specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col justify-between font-sans">
        <Header />
        <div className="text-center py-32 space-y-4">
          <h2 className="text-2xl font-bold font-display text-[#113F67]">Product Not Found</h2>
          <RouterLink to="/products" className="inline-flex items-center space-x-2 text-xs font-bold text-[#226597] hover:text-[#113F67]">
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

  const handleDownloadPdf = (doc, fallbackName) => {
    const fileName = `${fallbackName.replace(/[^a-zA-Z0-9]/g, '_')}_Catalog.pdf`;
    const docUrl = doc.document_url;

    if (docUrl && docUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = docUrl.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      } catch (err) {
        console.error('Blob download conversion failed, trying REST API:', err);
      }
    }

    if (doc.id) {
      window.open(`/api/v1/products/documents/${doc.id}/download`, '_blank');
      return;
    }

    if (docUrl) {
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title={product.seo_title || product.product_name}
        description={product.seo_description || product.short_description}
        schemaJson={schemaJson}
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
            <RouterLink to="/products" className="hover:text-[#226597]">Products</RouterLink>
            <span>/</span>
            <span className="text-[#113F67]">{product.category_name}</span>
            <span>/</span>
            <span className="text-[#226597] font-bold">{product.product_name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Gallery Image View & Carousel */}
            <div className="space-y-4">
              <div className="h-96 sm:h-[420px] bg-white border border-[#87C0CD]/40 rounded-3xl p-6 flex items-center justify-center relative overflow-hidden group shadow-md">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <Cpu className="w-24 h-24 text-[#87C0CD]" />
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] transition shadow-md opacity-0 group-hover:opacity-100"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] transition shadow-md opacity-0 group-hover:opacity-100"
                      title="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {currentImageUrl && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-[#226597] hover:text-white text-[#113F67] border border-[#87C0CD]/50 transition shadow"
                    title="Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-20 h-20 rounded-2xl border p-1 bg-white shrink-0 transition ${
                        activeImageIndex === i ? 'border-[#226597] ring-2 ring-[#226597]/30 scale-105' : 'border-[#87C0CD]/40 opacity-70 hover:opacity-100'
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
                <span className="text-xs font-bold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
                  {product.category_name}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67] mt-3 break-words leading-tight">
                  {product.product_name}
                </h1>
                {product.model_number && (
                  <div className="mt-2 inline-block text-xs font-mono text-[#226597] bg-[#E4F1F5] border border-[#87C0CD]/50 px-3 py-1 rounded-lg break-all font-semibold">
                    Model: {product.model_number}
                  </div>
                )}
              </div>

              {product.short_description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words whitespace-pre-line">{product.short_description}</p>
              )}

              {product.description && (
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words whitespace-pre-line pt-2 border-t border-[#87C0CD]/30">
                  {product.description}
                </div>
              )}

              {/* CTA Action Box */}
              <div className="p-6 rounded-2xl bg-white border border-[#87C0CD]/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#113F67]">Custom Lengths & Specs Available</span>
                  <span className="text-[10px] font-bold text-[#226597] bg-[#E4F1F5] px-2.5 py-1 rounded-full border border-[#87C0CD]/40">In Production</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setLeadModalOpen(true)}
                    className="w-full sm:flex-1 py-3 px-6 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <span>Request Instant Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {product.documents && product.documents.length > 0 && (() => {
                    const doc = product.documents[0];

                    return (
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(doc, product.product_name)}
                        className="w-full sm:w-auto py-3 px-4 bg-[#E4F1F5] hover:bg-[#CBE2E8] text-[#113F67] font-bold text-xs rounded-xl border border-[#87C0CD]/50 transition flex items-center justify-center space-x-2 shadow-sm transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#226597]" />
                        <span>Download PDF Catalog</span>
                      </button>
                    );
                  })()}
                </div>
              </div>

              {/* Key Features Bullet List */}
              {renderKeyFeatures(product.features)}
            </div>
          </div>

          {/* Full Specifications Table Section */}
          {product.specifications && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#87C0CD]/40 mb-12 shadow-sm">
              <h3 className="text-lg font-bold font-display text-[#113F67]">Technical Specifications</h3>
              {renderSpecificationsTable(product.specifications)}
            </div>
          )}

          {/* Applications */}
          {product.applications && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#87C0CD]/40 shadow-sm">
              <h3 className="text-lg font-bold font-display text-[#113F67]">Industrial Applications</h3>
              {renderApplications(product.applications)}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#113F67]/80 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-[#F3F9FB] text-[#113F67] shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] p-4 flex items-center justify-center bg-white rounded-3xl shadow-2xl">
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
