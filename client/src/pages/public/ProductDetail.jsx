import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Cpu, FileText, Download, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Maximize2, X, Video } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

// Helper to extract YouTube Embed URL
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

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

// Helper to parse markdown-style pipe tables into structured block tables
function renderSpecificationsTable(specsText) {
  if (!specsText) return null;

  const lines = specsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.match(/^\|?\s*:?-+:?\s*\|/));

  const tableRows = [];
  for (const line of lines) {
    if (line.includes('|')) {
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.length >= 2) {
        tableRows.push({ param: cells[0], detail: cells.slice(1).join(' | ') });
      }
    } else if (line.includes(':')) {
      const parts = line.split(':');
      tableRows.push({ param: parts[0].trim(), detail: parts.slice(1).join(':').trim() });
    }
  }

  if (tableRows.length === 0) {
    return <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{renderFormattedText(specsText)}</div>;
  }

  const headerRow = tableRows[0];
  const isHeader = headerRow.param.toLowerCase().includes('spec') || headerRow.param.toLowerCase().includes('parameter');
  const dataRows = isHeader ? tableRows.slice(1) : tableRows;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#87C0CD]/40 shadow-xs font-sans">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-[#E4F1F5] text-[#113F67] font-bold uppercase tracking-wider text-[11px] border-b border-[#87C0CD]/40">
          <tr>
            <th className="px-5 py-3.5 w-1/3 border-r border-[#87C0CD]/30">{isHeader ? headerRow.param : 'Specification Parameter'}</th>
            <th className="px-5 py-3.5">{isHeader ? headerRow.detail : 'Technical Details'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#87C0CD]/20 bg-white">
          {dataRows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-[#F3F9FB]/60 transition' : 'bg-[#F3F9FB]/40 hover:bg-[#F3F9FB]/80 transition'}>
              <td className="px-5 py-3.5 font-bold text-[#113F67] border-r border-[#87C0CD]/20 align-top">{renderFormattedText(row.param)}</td>
              <td className="px-5 py-3.5 text-slate-600 font-medium leading-relaxed align-top">{renderFormattedText(row.detail)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to render applications
function renderApplications(appsText) {
  if (!appsText) return null;
  const items = appsText
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
      {items.map((item, idx) => (
        <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#87C0CD]/30 flex items-center space-x-3 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#226597] shrink-0" />
          <span className="text-xs font-semibold text-[#113F67]">{renderFormattedText(item)}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
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
          <p className="text-xs text-slate-500 font-semibold">Loading Technical Datasheet...</p>
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

  const galleryImages = [];
  if (product.thumbnail_image) {
    galleryImages.push(product.thumbnail_image);
  }
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img.image_url && !galleryImages.includes(img.image_url)) {
        galleryImages.push(img.image_url);
      }
    });
  }

  const currentImageUrl = galleryImages[selectedImageIndex] || null;
  const embedUrl = getYouTubeEmbedUrl(product.video_url);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleDownloadPdf = (doc, fallbackName) => {
    if (!doc || !doc.document_url) return;

    if (doc.id) {
      const downloadApiUrl = `/api/v1/products/documents/${doc.id}/download`;
      const link = document.createElement('a');
      link.href = downloadApiUrl;
      link.download = doc.document_name || `${fallbackName}_Catalog.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (doc.document_url.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = doc.document_url.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = doc.document_name || `${fallbackName}_Catalog.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (err) {
        console.error('Blob PDF conversion error', err);
        window.open(doc.document_url, '_blank');
      }
    } else {
      window.open(doc.document_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title={product.seo_title || `${product.product_name} | Omronics Industrial Automation`}
        description={product.seo_description || product.short_description}
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
            <RouterLink to="/products" className="hover:text-[#226597]">Products</RouterLink>
            <span>/</span>
            {product.category_slug ? (
              <>
                <RouterLink to={`/products?category=${product.category_slug}`} className="hover:text-[#226597]">
                  {product.category_name}
                </RouterLink>
                <span>/</span>
              </>
            ) : null}
            <span className="text-[#226597] font-bold">{product.product_name}</span>
          </div>

          {/* Product Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
            {/* Gallery Image Slider */}
            <div className="lg:col-span-6 space-y-4">
              <div className="glass-panel p-4 rounded-3xl border border-[#87C0CD]/40 shadow-md relative overflow-hidden h-96 flex items-center justify-center bg-white group">
                {currentImageUrl ? (
                  <>
                    <img
                      src={currentImageUrl}
                      alt={product.product_name}
                      className="w-full h-full object-contain cursor-zoom-in"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-[#F3F9FB]/90 border border-[#87C0CD]/40 text-[#113F67] opacity-0 group-hover:opacity-100 transition shadow-sm"
                      title="Enlarge Image"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Cpu className="w-24 h-24 text-[#87C0CD]" />
                )}

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-[#87C0CD]/40 text-[#113F67] hover:bg-white transition shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 border border-[#87C0CD]/40 text-[#113F67] hover:bg-white transition shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition shrink-0 ${
                        selectedImageIndex === idx ? 'border-[#226597] shadow-sm scale-105' : 'border-[#87C0CD]/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Specifications Summary */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40 mb-3">
                  {product.category_name || 'Industrial Product'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67] leading-tight break-words">
                  {product.product_name}
                </h1>
                {product.model_number && (
                  <p className="text-xs font-mono text-[#226597] font-semibold mt-2 bg-[#E4F1F5] inline-block px-2.5 py-1 rounded-lg border border-[#87C0CD]/40">
                    Model: {product.model_number}
                  </p>
                )}
                {product.price !== null && product.price !== undefined && product.price !== '' && (
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-[#113F67] font-display">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">/ Piece</span>
                  </div>
                )}
              </div>

              {product.short_description && (
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line">
                  {product.short_description}
                </p>
              )}

              {product.description && (
                <p className="text-slate-600 text-xs leading-relaxed break-words whitespace-pre-line pt-2 border-t border-[#87C0CD]/30">
                  {product.description}
                </p>
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

                  {embedUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoModalOpen(true)}
                      className="w-full sm:w-auto py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center space-x-2 shadow-sm transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4 text-rose-600" />
                      <span>Watch Demo Video</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Key Features Bullet List */}
              {renderKeyFeatures(product.features)}
            </div>
          </div>

          {/* Embedded YouTube Video Section */}
          {embedUrl && (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#87C0CD]/40 mb-12 shadow-sm">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold font-display text-[#113F67]">Product Demo Video</h3>
              </div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md bg-black border border-[#87C0CD]/30">
                <iframe
                  src={embedUrl}
                  title={`${product.product_name} Demo Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

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

      {/* Video Modal */}
      {videoModalOpen && embedUrl && (
        <div className="fixed inset-0 z-50 bg-[#113F67]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="flex items-center justify-between p-4 bg-[#113F67] text-white">
              <h4 className="text-xs font-bold uppercase tracking-wider font-display flex items-center space-x-2">
                <Video className="w-4 h-4 text-rose-400" />
                <span>{product.product_name} - Product Demonstration</span>
              </h4>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full aspect-video">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={`${product.product_name} Demo Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
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
