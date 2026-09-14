import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Search,
  Cpu,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  ArrowLeft,
  Zap,
  Cable,
  Fan,
  Sliders,
  Boxes,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { SEOManager } from '../../components/common/SEOManager';
import { LeadModal } from '../../components/common/LeadModal';
import api from '../../services/api';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategorySlug = searchParams.get('category') || '';
  const activeProductSlug = searchParams.get('product') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubProducts, setLoadingSubProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);

  // Load Categories with live product counts
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await api.get('/categories?status=ACTIVE');
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Reset to page 1 whenever category filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategorySlug, searchQuery]);

  // Load Products when a specific category is selected OR when user is searching
  useEffect(() => {
    if (!activeCategorySlug && !searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

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

  // Load Product & its Sub-Products when a product is selected
  useEffect(() => {
    if (!activeProductSlug) {
      setSelectedProductData(null);
      return;
    }

    async function loadProductSubProducts() {
      setLoadingSubProducts(true);
      try {
        const res = await api.get(`/products/slug/${activeProductSlug}`);
        if (res.success && res.data) {
          setSelectedProductData(res.data);
        }
      } catch (err) {
        console.error('Failed to load sub-products for product', err);
      } finally {
        setLoadingSubProducts(false);
      }
    }
    loadProductSubProducts();
  }, [activeProductSlug]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  // Helper icon selector for category visuals
  const getCategoryIcon = (categoryName = '') => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('cable') || lower.includes('servo')) return Cable;
    if (lower.includes('blower') || lower.includes('fan')) return Fan;
    if (lower.includes('relay') || lower.includes('card')) return Zap;
    if (lower.includes('panel') || lower.includes('automation')) return Sliders;
    return Boxes;
  };

  return (
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex flex-col font-sans">
      <SEOManager
        title={
          activeProductSlug
            ? `${selectedProductData?.product_name || activeProductSlug} Sub Products | Omronics Automation`
            : activeCategory
            ? `${activeCategory.name} Catalog | Omronics Automation`
            : 'Industrial Product Categories & Solutions | Omronics Automation'
        }
        description={
          selectedProductData?.short_description ||
          activeCategory?.short_description ||
          "Explore Omronics' comprehensive industrial automation catalog across servo cables, relay interface modules, control panels, and blowers."
        }
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumbs & Header Banner */}
          <div className="mb-8 space-y-3 text-center sm:text-left">
            {activeProductSlug ? (
              /* Level 3 Breadcrumbs */
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#226597] bg-white hover:bg-[#E4F1F5] px-3 py-1.5 rounded-full border border-[#87C0CD]/40 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </button>
                <span className="text-slate-400 text-xs">/</span>
                {activeCategorySlug ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSearchParams({ category: activeCategorySlug })}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#226597] bg-white hover:bg-[#E4F1F5] px-3 py-1.5 rounded-full border border-[#87C0CD]/40 shadow-2xs transition cursor-pointer"
                    >
                      <span>{activeCategory?.name || activeCategorySlug}</span>
                    </button>
                    <span className="text-slate-400 text-xs">/</span>
                  </>
                ) : null}
                <span className="text-xs font-extrabold text-[#113F67] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
                  {selectedProductData?.product_name || activeProductSlug}
                </span>
              </div>
            ) : activeCategorySlug ? (
              /* Level 2 Breadcrumbs */
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#226597] bg-white hover:bg-[#E4F1F5] px-3 py-1.5 rounded-full border border-[#87C0CD]/40 shadow-2xs transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Categories</span>
                </button>
                <span className="text-slate-400 text-xs">/</span>
                <span className="text-xs font-extrabold text-[#113F67] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
                  {activeCategory?.name || activeCategorySlug}
                </span>
              </div>
            ) : (
              /* Level 1 Breadcrumb / Tag */
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40 inline-block">
                Product Categories
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#113F67]">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeProductSlug
                ? `${selectedProductData?.product_name || activeProductSlug} - Sub Products`
                : activeCategory
                ? activeCategory.name
                : 'Industrial Product Categories'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {searchQuery
                ? 'Displaying products matching your keyword inquiry across all configurations.'
                : activeProductSlug
                ? selectedProductData?.short_description ||
                  `Select a sub-product series below to configure wiring options, technical specifications, and custom lengths.`
                : activeCategory?.short_description ||
                  activeCategory?.description ||
                  'Select a product category below to explore dedicated models, technical specifications, and custom configurations.'}
            </p>
          </div>

          {/* Search Bar (Displayed on Level 1 and Level 2) */}
          {!activeProductSlug && (
            <div className="glass-panel p-4 rounded-2xl mb-10 border border-[#87C0CD]/40 shadow-sm max-w-3xl">
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#226597]" />
                <input
                  type="text"
                  placeholder="Search products by brand, part code, model number, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#87C0CD]/50 rounded-xl pl-11 pr-10 py-3 text-xs sm:text-sm text-[#113F67] placeholder:text-slate-400 focus:outline-none focus:border-[#226597] shadow-sm font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Active Category Filter Tag if inside category */}
              {activeCategorySlug && (
                <div className="mt-3 pt-2.5 border-t border-[#87C0CD]/30 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <span className="flex items-center space-x-1.5">
                    <span>Category:</span>
                    <span className="font-bold text-[#226597] bg-[#E4F1F5] px-2.5 py-0.5 rounded-md border border-[#87C0CD]/40">
                      {activeCategory?.name || activeCategorySlug}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="text-[#226597] hover:text-[#113F67] text-[11px] font-bold hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Categories</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: SUB-PRODUCTS GRID (When a specific product is clicked) */}
          {/* ========================================================================= */}
          {activeProductSlug ? (
            <div>
              {loadingSubProducts ? (
                <div className="py-20 text-center text-slate-500 text-sm font-semibold flex items-center justify-center space-x-2">
                  <Cpu className="w-5 h-5 text-[#226597] animate-spin" />
                  <span>Loading Sub-Products...</span>
                </div>
              ) : !selectedProductData?.sub_products || selectedProductData.sub_products.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm space-y-3">
                  <p>No sub-products configured for this product.</p>
                  <RouterLink
                    to={`/products/${selectedProductData?.slug || activeProductSlug}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-[#226597] hover:bg-[#113F67] px-4 py-2 rounded-xl shadow transition cursor-pointer"
                  >
                    <span>View Product Specifications</span>
                    <ArrowRight className="w-4 h-4" />
                  </RouterLink>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {selectedProductData.sub_products.map((sp) => {
                    const displayImage = sp.image_url || selectedProductData.thumbnail_image;

                    return (
                      <div
                        key={sp.id}
                        className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-[#87C0CD]/30 hover:border-[#226597] transition shadow-sm hover:shadow-md"
                      >
                        <div>
                          {/* Visual Showcase */}
                          <div className="h-52 bg-white relative overflow-hidden flex items-center justify-center p-4 border-b border-[#87C0CD]/20">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={sp.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-[#E4F1F5] flex items-center justify-center text-[#226597] group-hover:rotate-6 transition transform">
                                <Boxes className="w-10 h-10" />
                              </div>
                            )}

                            {/* Mapped Part Codes Badge */}
                            {sp.part_codes_count !== undefined && (
                              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#87C0CD]/50 text-[#113F67] text-[10px] font-extrabold flex items-center space-x-1.5 shadow-sm">
                                <Layers className="w-3.5 h-3.5 text-[#226597]" />
                                <span>{sp.part_codes_count} Part Codes</span>
                              </span>
                            )}
                          </div>

                          {/* Sub-Product Details */}
                          <div className="p-6 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#226597] bg-[#E4F1F5] px-2 py-0.5 rounded-full inline-block">
                              {selectedProductData.product_name} SERIES
                            </span>
                            <h2 className="text-base font-bold text-[#113F67] font-display group-hover:text-[#226597] transition break-words">
                              {sp.name}
                            </h2>

                            {sp.model_code && (
                              <span className="inline-block text-[11px] font-mono text-[#226597] bg-[#F3F9FB] px-2 py-0.5 rounded border border-[#87C0CD]/40 break-all font-semibold">
                                {sp.model_code}
                              </span>
                            )}

                            <p className="text-xs text-slate-600 line-clamp-3 pt-1 break-words leading-relaxed">
                              {sp.description ||
                                'Explore cable specifications, part codes, wiring configurations, and real-time custom pricing for this series.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom CTA: View Specs & Request Quote */}
                        <div className="p-6 pt-0 flex items-center justify-between gap-3">
                          <RouterLink
                            to={`/products/${selectedProductData.slug}?series=${sp.slug}`}
                            className="flex-1 text-center py-2.5 px-3 bg-[#E4F1F5] hover:bg-[#CBE2E8] text-[#113F67] font-bold text-xs rounded-xl transition"
                          >
                            View Specs
                          </RouterLink>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedProductForQuote({
                                ...selectedProductData,
                                product_name: `${selectedProductData.product_name} (${sp.name})`,
                                id: selectedProductData.id,
                              })
                            }
                            className="flex-1 text-center py-2.5 px-3 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition"
                          >
                            Request Quote
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !activeCategorySlug && !searchQuery ? (
            /* ========================================================================= */
            /* VIEW 1: CATEGORIES GRID (When no category, product, or search is active) */
            /* ========================================================================= */
            <div>
              {loadingCategories ? (
                <div className="py-20 text-center text-slate-500 text-sm font-semibold flex items-center justify-center space-x-2">
                  <Cpu className="w-5 h-5 text-[#226597] animate-spin" />
                  <span>Loading Product Categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">
                  No active categories found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((cat) => {
                    const CatIcon = getCategoryIcon(cat.name);
                    const displayImage = cat.thumbnail_image || cat.banner_image || cat.sample_image;

                    return (
                      <RouterLink
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-[#87C0CD]/30 hover:border-[#226597] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
                      >
                        <div>
                          {/* Visual Showcase Banner */}
                          <div className="h-56 bg-white relative overflow-hidden flex items-center justify-center p-6 border-b border-[#87C0CD]/20">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={cat.name}
                                className="w-full h-full object-contain group-hover:scale-108 transition duration-500"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-2xl bg-[#E4F1F5] flex items-center justify-center text-[#226597] group-hover:rotate-6 transition transform">
                                <CatIcon className="w-10 h-10" />
                              </div>
                            )}

                            {/* Product Count Floating Badge */}
                            <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#87C0CD]/50 text-[#113F67] text-[11px] font-extrabold flex items-center space-x-1.5 shadow-sm">
                              <Layers className="w-3.5 h-3.5 text-[#226597]" />
                              <span>{cat.product_count || 0} Products</span>
                            </span>
                          </div>

                          {/* Category Info */}
                          <div className="p-6 space-y-2.5">
                            <h2 className="text-lg font-bold text-[#113F67] font-display group-hover:text-[#226597] transition">
                              {cat.name}
                            </h2>

                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                              {cat.short_description ||
                                cat.description ||
                                'Explore high-performance industrial components, wiring harnesses, and control solutions.'}
                            </p>
                          </div>
                        </div>

                        {/* Card Bottom CTA */}
                        <div className="p-6 pt-0">
                          <div className="w-full py-3 px-4 rounded-xl bg-[#E4F1F5] group-hover:bg-[#226597] text-[#113F67] group-hover:text-white font-bold text-xs flex items-center justify-between transition-colors duration-300 shadow-2xs">
                            <span>View All Products</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </RouterLink>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: PRODUCTS GRID (When a category is clicked OR user searches) */
            /* ========================================================================= */
            <div>
              {loading ? (
                <div className="py-20 text-center text-slate-500 text-sm font-semibold flex items-center justify-center space-x-2">
                  <Cpu className="w-5 h-5 text-[#226597] animate-spin" />
                  <span>Loading Products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm space-y-3">
                  <p>No products found {activeCategory ? `in category "${activeCategory.name}"` : 'matching your query'}.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchParams({});
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-[#226597] hover:bg-[#113F67] px-4 py-2 rounded-xl shadow transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to All Categories</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((prod) => {
                      const hasSubProducts = prod.sub_products && prod.sub_products.length > 0;
                      const subProductsTargetLink = activeCategorySlug
                        ? `/products?category=${activeCategorySlug}&product=${prod.slug}`
                        : `/products?product=${prod.slug}`;

                      return (
                        <div
                          key={prod.id}
                          className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-[#87C0CD]/30 hover:border-[#226597] transition shadow-sm hover:shadow-md"
                        >
                          <div>
                            {/* Product Visual */}
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

                              {hasSubProducts ? (
                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#87C0CD]/50 text-[#113F67] text-[10px] font-extrabold flex items-center space-x-1.5 shadow-sm">
                                  <Layers className="w-3.5 h-3.5 text-[#226597]" />
                                  <span>{prod.sub_products.length} Series</span>
                                </span>
                              ) : prod.datasheet_available ? (
                                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#E4F1F5] border border-[#87C0CD]/50 text-[#113F67] text-[10px] font-bold flex items-center space-x-1 shadow-sm">
                                  <FileText className="w-3.5 h-3.5 text-[#226597]" />
                                  <span>PDF Datasheet</span>
                                </span>
                              ) : null}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#226597] bg-[#E4F1F5] px-2 py-0.5 rounded-full inline-block">
                                {prod.category_name}
                              </span>
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
                              <p className="text-xs text-slate-600 line-clamp-3 pt-1 break-words leading-relaxed">
                                {prod.short_description}
                              </p>
                            </div>
                          </div>

                          {/* CONDITIONAL ACTION BUTTONS */}
                          {hasSubProducts ? (
                            /* When product HAS sub-products: Single "View all products" button */
                            <div className="p-6 pt-0">
                              <RouterLink
                                to={subProductsTargetLink}
                                className="w-full py-3 px-4 rounded-xl bg-[#E4F1F5] group-hover:bg-[#226597] text-[#113F67] group-hover:text-white font-bold text-xs flex items-center justify-between transition-colors duration-300 shadow-2xs"
                              >
                                <span>View all products</span>
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                              </RouterLink>
                            </div>
                          ) : (
                            /* When product has NO sub-products: "View Specs" and "Request Quote" buttons */
                            <div className="p-6 pt-0 flex items-center justify-between gap-3">
                              <RouterLink
                                to={
                                  searchQuery
                                    ? `/products/${prod.slug}?search=${encodeURIComponent(searchQuery)}`
                                    : `/products/${prod.slug}`
                                }
                                className="flex-1 text-center py-2.5 px-3 bg-[#E4F1F5] hover:bg-[#CBE2E8] text-[#113F67] font-bold text-xs rounded-xl transition"
                              >
                                View Specs
                              </RouterLink>
                              <button
                                type="button"
                                onClick={() => setSelectedProductForQuote(prod)}
                                className="flex-1 text-center py-2.5 px-3 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition"
                              >
                                Request Quote
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
