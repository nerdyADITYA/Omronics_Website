import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Search, Cpu, FileText, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategorySlug = searchParams.get('category') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories?status=ACTIVE');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Reset to page 1 whenever category filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategorySlug, searchQuery]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let selectedCatId = '';
        if (activeCategorySlug) {
          const matchedCat = categories.find((c) => c.slug === activeCategorySlug);
          if (matchedCat) selectedCatId = matchedCat.id;
        }

        const endpoint = `/products?status=ACTIVE&limit=12&page=${currentPage}${
          selectedCatId ? `&category_id=${selectedCatId}` : ''
        }${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;

        const res = await api.get(endpoint);
        if (res.success) {
          setProducts(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCategorySlug, categories, searchQuery, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title="Industrial Products Catalog | Omronics Automation"
        description="Browse Omronics' catalog of servo drive power cables, optical encoder harnesses, relay interface modules, industrial blowers, and control panels."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-10 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
              Products Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              Industrial Automation Solutions
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              High-flexibility cables, relay interface modules, control panels, industrial blowers, and fieldbus assemblies engineered for heavy motion and operational reliability.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#87C0CD]/40 shadow-sm">
            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                  !activeCategorySlug
                    ? 'bg-[#226597] text-white shadow-sm'
                    : 'bg-white text-[#113F67] hover:bg-[#E4F1F5] border border-[#87C0CD]/40'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                    activeCategorySlug === cat.slug
                      ? 'bg-[#226597] text-white shadow-sm'
                      : 'bg-white text-[#113F67] hover:bg-[#E4F1F5] border border-[#87C0CD]/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#226597]" />
              <input
                type="text"
                placeholder="Search products or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#87C0CD]/50 rounded-xl pl-9 pr-4 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm font-semibold flex items-center justify-center space-x-2">
              <Cpu className="w-5 h-5 text-[#226597] animate-spin" />
              <span>Loading Products Catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">No products found matching your search.</div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((prod) => (
                  <div key={prod.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-[#87C0CD]/30 hover:border-[#226597] transition shadow-sm hover:shadow-md">
                    <div>
                      <div className="h-52 bg-white relative overflow-hidden flex items-center justify-center p-4 border-b border-[#87C0CD]/20">
                        {prod.thumbnail_image ? (
                          <img
                            src={prod.thumbnail_image}
                            alt={prod.product_name}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <Cpu className="w-16 h-16 text-[#87C0CD]" />
                        )}
                        {prod.datasheet_available ? (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                            <FileText className="w-3.5 h-3.5 text-[#226597]" />
                            <span>PDF Datasheet</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="p-6 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#226597] bg-[#E4F1F5] px-2 py-0.5 rounded-full">{prod.category_name}</span>
                        <h3 className="text-base font-bold text-[#113F67] font-display group-hover:text-[#226597] transition break-words">
                          {prod.product_name}
                        </h3>
                        {prod.model_number && (
                          <span className="inline-block text-[11px] font-mono text-[#226597] bg-[#F3F9FB] px-2 py-0.5 rounded border border-[#87C0CD]/40 break-all font-semibold">
                            {prod.model_number}
                          </span>
                        )}
                        {prod.price !== null && prod.price !== undefined && prod.price !== '' && (
                          <div className="pt-1.5 text-base font-extrabold text-[#113F67]">
                            ₹{Number(prod.price).toLocaleString('en-IN')}
                          </div>
                        )}
                        <p className="text-xs text-slate-600 line-clamp-3 pt-1 break-words leading-relaxed">{prod.short_description}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center justify-between gap-3">
                      <RouterLink
                        to={searchQuery ? `/products/${prod.slug}?search=${encodeURIComponent(searchQuery)}` : `/products/${prod.slug}`}
                        className="flex-1 text-center py-2.5 px-3 bg-[#E4F1F5] hover:bg-[#CBE2E8] text-[#113F67] font-bold text-xs rounded-xl transition"
                      >
                        View Specs
                      </RouterLink>
                      <button
                        onClick={() => setSelectedProductForQuote(prod)}
                        className="flex-1 text-center py-2.5 px-3 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Batched Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="glass-panel p-4 rounded-2xl border border-[#87C0CD]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="text-xs text-slate-600 font-medium">
                    Showing <span className="font-bold text-[#113F67]">{(currentPage - 1) * 12 + 1}</span> to{' '}
                    <span className="font-bold text-[#113F67]">{Math.min(currentPage * 12, pagination.total)}</span> of{' '}
                    <span className="font-bold text-[#113F67]">{pagination.total}</span> Products
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl bg-white border border-[#87C0CD]/40 text-[#113F67] hover:bg-[#E4F1F5] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                          currentPage === pg
                            ? 'bg-[#226597] text-white shadow-sm'
                            : 'bg-white text-[#113F67] hover:bg-[#E4F1F5] border border-[#87C0CD]/40'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-2 rounded-xl bg-white border border-[#87C0CD]/40 text-[#113F67] hover:bg-[#E4F1F5] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedProductForQuote && (
        <LeadModal
          isOpen={true}
          onClose={() => setSelectedProductForQuote(null)}
          sourceType="PRODUCT"
          referenceId={selectedProductForQuote.id}
          title={`Quote Request: ${selectedProductForQuote.product_name}`}
        />
      )}
    </div>
  );
}
