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
  const [selectedVariantId, setSelectedVariantId] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/slug/${slug}`);
        if (res.success && res.data) {
          setProduct(res.data);
          if (Array.isArray(res.data.part_code_variants) && res.data.part_code_variants.length > 0) {
            setSelectedVariantId(String(res.data.part_code_variants[0].id));
          }
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

  const variants = Array.isArray(product.part_code_variants) ? product.part_code_variants : [];
  const selectedVariant = variants.find((v) => String(v.id) === String(selectedVariantId)) || null;

  const activeVariantDetails = selectedVariant
    ? {
        product_name: product.product_name,
        part_code: selectedVariant.part_code,
        frame_size: selectedVariant.frame_size,
        motor_type: selectedVariant.motor_type,
        cable_dimension: selectedVariant.cable_dimension,
        connectors: [selectedVariant.connector1_name, selectedVariant.connector2_name].filter(Boolean).join(' + '),
        default_length: selectedVariant.default_length,
        variant_price: selectedVariant.calculated_price,
      }
    : null;

  // Extract all custom variant images (supports image_urls array or image_url string)
  const variantImages = [];
  if (selectedVariant) {
    if (Array.isArray(selectedVariant.image_urls) && selectedVariant.image_urls.length > 0) {
      variantImages.push(...selectedVariant.image_urls);
    } else if (typeof selectedVariant.image_url === 'string' && selectedVariant.image_url.trim().length > 0) {
      const trimmed = selectedVariant.image_url.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) variantImages.push(...parsed);
          else variantImages.push(trimmed);
        } catch (e) {
          variantImages.push(trimmed);
        }
      } else {
        variantImages.push(trimmed);
      }
    }
  }

  // Build Dynamic Gallery Images:
  // 1. If a specific variant is selected AND it has custom images, show ONLY that variant's images.
  // 2. In default mode (selectedVariantId is empty) OR if selected variant has no custom images, show ONLY default product images.
  const galleryImages = [];
  if (selectedVariantId && variantImages.length > 0) {
    variantImages.forEach((img) => {
      if (img && !galleryImages.includes(img)) {
        galleryImages.push(img);
      }
    });
  } else {
    if (product.thumbnail_image && !galleryImages.includes(product.thumbnail_image)) {
      galleryImages.push(product.thumbnail_image);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img.image_url && !galleryImages.includes(img.image_url)) {
          galleryImages.push(img.image_url);
        }
      });
    }
  }

  const currentImageUrl = galleryImages[selectedImageIndex] || galleryImages[0] || null;
  const embedUrl = getYouTubeEmbedUrl(product.video_url);

  const displayPrice = selectedVariant
    ? selectedVariant.calculated_price
    : product.price !== null && product.price !== undefined && product.price !== ''
    ? Number(product.price)
    : null;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId);
    setSelectedImageIndex(0); // Reset image index to show first image of selected view
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

            {/* Product Meta & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40 inline-block font-sans">
                  {product.category_name || 'Industrial Product'}
                </span>
                <h1 className="text-3xl font-extrabold text-[#113F67] font-display tracking-tight leading-tight">
                  {product.product_name}
                </h1>
                {product.model_number && (
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-sans">
                    Model: <span className="text-[#226597] font-mono">{product.model_number}</span>
                  </p>
                )}
              </div>

              {/* Variant Pricing & Selector Box */}
              <div className="p-4 bg-[#E4F1F5]/60 border border-[#87C0CD]/40 rounded-2xl space-y-3 font-sans">
                {variants.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-extrabold text-[#113F67] uppercase tracking-wider">
                        Select Part Code & Spec Variant
                      </label>
                      <span className="text-[10px] font-bold text-[#226597]">
                        {variants.length} Part Codes Available
                      </span>
                    </div>
                    <select
                      value={selectedVariantId}
                      onChange={(e) => handleVariantSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#87C0CD]/50 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597] shadow-xs cursor-pointer"
                    >
                      <option value="">-- Default Price (₹{Number(product.price || 0).toLocaleString('en-IN')}) --</option>
                      {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.part_code || 'Part Code'} {v.motor_type ? `(${v.motor_type})` : ''} - ₹{v.calculated_price.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>

                    {/* Active Variant Technical Specs Summary */}
                    {selectedVariant && (
                      <div className="p-3 bg-white border border-[#87C0CD]/30 rounded-xl text-xs space-y-1.5 font-sans mt-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                          <span className="text-slate-500 text-[11px]">Selected Part Code:</span>
                          <span className="font-mono font-bold text-[#226597]">{selectedVariant.part_code || '-'}</span>
                        </div>
                        {selectedVariant.frame_size && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Frame Size:</span>
                            <span className="font-semibold text-[#113F67]">{selectedVariant.frame_size}</span>
                          </div>
                        )}
                        {selectedVariant.motor_type && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Motor / Power Spec:</span>
                            <span className="font-semibold text-[#113F67]">{selectedVariant.motor_type}</span>
                          </div>
                        )}
                        {selectedVariant.cable_dimension && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Cable Dimensions:</span>
                            <span className="font-semibold text-[#113F67]">{selectedVariant.cable_dimension}</span>
                          </div>
                        )}
                        {(selectedVariant.connector1_name || selectedVariant.connector2_name) && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">Connectors:</span>
                            <span className="font-semibold text-[#113F67]">
                              {[selectedVariant.connector1_name, selectedVariant.connector2_name].filter(Boolean).join(' + ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Price Display */}
                {displayPrice !== null && (
                  <div className="mt-3 flex items-baseline space-x-2.5">
                    <span className="text-3xl font-extrabold text-[#113F67] font-display">
                      ₹{displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">/ Piece</span>
                    {selectedVariant && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        Variant Price
                      </span>
                    )}
                  </div>
                )}
              </div>

              {product.short_description && (
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line font-sans">
                  {product.short_description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-sans">
                <button
                  onClick={() => setLeadModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#226597] text-white hover:bg-[#113F67] font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 group cursor-pointer"
                >
                  <span>Request Official Quote</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                {embedUrl && (
                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Watch Demo Video</span>
                  </button>
                )}
              </div>

              {/* Document Downloads Section */}
              {Array.isArray(product.documents) && product.documents.length > 0 && (
                <div className="pt-4 border-t border-[#87C0CD]/30 space-y-3 font-sans">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#113F67]">
                    Technical Documentation & Catalogues
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.documents.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownloadPdf(doc, product.product_name)}
                        className="p-3 rounded-xl bg-white border border-[#87C0CD]/30 hover:border-[#226597] text-[#113F67] text-left transition flex items-center justify-between group shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-[#226597] shrink-0" />
                          <span className="text-xs font-semibold truncate">
                            {doc.document_name}
                          </span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#226597] shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabbed Specifications & Features Detail Grid */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#87C0CD]/40 shadow-sm space-y-8 font-sans">
            {product.specifications && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#113F67] font-display border-b border-[#87C0CD]/30 pb-2">
                  Technical Specifications Table
                </h3>
                {renderSpecificationsTable(product.specifications)}
              </div>
            )}

            {product.description && (
              <div className="space-y-3 pt-4 border-t border-[#87C0CD]/30">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#113F67] font-display">
                  Product Overview & Description
                </h3>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {renderFormattedText(product.description)}
                </div>
              </div>
            )}

            {product.features && renderKeyFeatures(product.features)}
            {product.applications && (
              <div className="space-y-4 pt-4 border-t border-[#87C0CD]/30">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#113F67] font-display">
                  Industrial Applications & Integration
                </h3>
                {renderApplications(product.applications)}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && currentImageUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <img src={currentImageUrl} alt={product.product_name} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* YouTube Video Modal */}
      {videoModalOpen && embedUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title="Product Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-white bg-slate-900/80 rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        sourceType="PRODUCT"
        referenceId={product.id}
        variantDetails={activeVariantDetails}
      />

      <Footer />
    </div>
  );
}
