import React, { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Search, Cpu, FileText, ArrowRight, Filter, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        let selectedCatId = '';
        if (activeCategorySlug) {
          const matchedCat = categories.find((c) => c.slug === activeCategorySlug);
          if (matchedCat) selectedCatId = matchedCat.id;
        }

        const endpoint = `/products?status=ACTIVE&limit=100${selectedCatId ? `&category_id=${selectedCatId}` : ''}${
          searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
        }`;
        const res = await api.get(endpoint);
        if (res.success) setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCategorySlug, categories, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <SEOManager
        title="Industrial Products Catalog | Servo Cables & Relay Cards"
        description="Browse Omronics' catalog of servo drive power cables, optical encoder harnesses, relay interface modules, and PROFINET patch cables."
      />

      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-10 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Products Catalog</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display">Industrial Automation Solutions</h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
              High-flexibility cables, relay interface modules, and industrial fieldbus assemblies tested for high continuous motion and noise suppression.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                  !activeCategorySlug ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.slug })}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                    activeCategorySlug === cat.slug ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Loading products catalog...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">No products found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((prod) => (
                <div key={prod.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="h-52 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
                      {prod.thumbnail_image ? (
                        <img
                          src={prod.thumbnail_image}
                          alt={prod.product_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <Cpu className="w-16 h-16 text-slate-800" />
                      )}
                      {prod.datasheet_available ? (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700 text-indigo-300 text-[10px] font-bold flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF Datasheet</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="p-6 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{prod.category_name}</span>
                      <h3 className="text-base font-bold text-slate-100 font-display group-hover:text-cyan-400 transition break-words">
                        {prod.product_name}
                      </h3>
                      {prod.model_number && (
                        <span className="inline-block text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 break-all">
                          {prod.model_number}
                        </span>
                      )}
                      <p className="text-xs text-slate-400 line-clamp-3 pt-1 break-words">{prod.short_description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between gap-3">
                    <RouterLink
                      to={`/products/${prod.slug}`}
                      className="flex-1 text-center py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                    >
                      View Specs
                    </RouterLink>
                    <button
                      onClick={() => setSelectedProductForQuote(prod)}
                      className="flex-1 text-center py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
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
