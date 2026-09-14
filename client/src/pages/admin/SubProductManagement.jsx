import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Square,
  Check,
  RefreshCw,
  Sliders,
  AlertCircle,
  FileCode,
  Info,
} from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { getBasePartCodeTemplate } from '../../utils/partCode';
import api from '../../services/api';

export function SubProductManagement() {
  const [subProducts, setSubProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('ALL');
  const [filterProductId, setFilterProductId] = useState('ALL');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubProduct, setEditingSubProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    model_code: '',
    slug: '',
    description: '',
    image_url: null,
    sort_order: 0,
    status: 'ACTIVE',
  });

  // Available Product Part Codes & Selection State for the modal
  const [loadingPartCodes, setLoadingPartCodes] = useState(false);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedPartCodes, setSelectedPartCodes] = useState([]); // Array of base templates / part codes
  const [partCodeSearch, setPartCodeSearch] = useState('');

  // Load Categories & Products for selectors
  useEffect(() => {
    async function loadSelectors() {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/categories?status=ACTIVE'),
          api.get('/products?limit=500'),
        ]);
        if (cRes.success) setCategories(cRes.data);
        if (pRes.success) setProducts(pRes.data);
      } catch (err) {
        console.error('Failed to load selector options', err);
      }
    }
    loadSelectors();
  }, []);

  const loadSubProducts = async (page = 1, searchQuery = '', categoryId = 'ALL', productId = 'ALL') => {
    setLoading(true);
    try {
      let url = `/sub-products?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`;
      if (categoryId && categoryId !== 'ALL') url += `&categoryId=${categoryId}`;
      if (productId && productId !== 'ALL') url += `&productId=${productId}`;

      const res = await api.get(url);
      if (res.success) {
        setSubProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load sub-products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubProducts(1, search, filterCategoryId, filterProductId);
  }, [search, filterCategoryId, filterProductId]);

  // Fetch Part Codes / Cable Variants when Parent Product in form changes
  const fetchProductPartCodes = async (productId, preSelected = []) => {
    if (!productId) {
      setProductVariants([]);
      setSelectedPartCodes([]);
      return;
    }
    setLoadingPartCodes(true);
    try {
      const res = await api.get(`/cable-costs/product/${productId}`);
      if (res.success && Array.isArray(res.data)) {
        setProductVariants(res.data);
        if (preSelected && preSelected.length > 0) {
          setSelectedPartCodes(preSelected);
        }
      } else {
        setProductVariants([]);
      }
    } catch (err) {
      console.error('Failed to fetch product cable variants', err);
      setProductVariants([]);
    } finally {
      setLoadingPartCodes(false);
    }
  };

  // Group fetched variants by canonical base model template
  const distinctModelGroups = useMemo(() => {
    if (!Array.isArray(productVariants) || productVariants.length === 0) return [];

    const groupMap = new Map();
    productVariants.forEach((v) => {
      const baseTemplate = getBasePartCodeTemplate(v.part_code);
      const key = `${baseTemplate}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          key,
          baseTemplate,
          motor_type: v.motor_type || '',
          frame_size: v.frame_size || '',
          sub_product_id: v.sub_product_id,
          sub_product_name: v.sub_product_name,
          variants: [v],
        });
      } else {
        const existing = groupMap.get(key);
        if (!existing.sub_product_id && v.sub_product_id) {
          existing.sub_product_id = v.sub_product_id;
          existing.sub_product_name = v.sub_product_name;
        }
        existing.variants.push(v);
      }
    });

    const allGroups = Array.from(groupMap.values());

    // Filter out models that are already mapped to OTHER sub-products
    return allGroups.filter((m) => {
      // 1. If not mapped to any sub-product, it's available to be mapped
      if (!m.sub_product_id) return true;

      // 2. If editing an existing sub-product, only keep models mapped to THIS sub-product
      if (editingSubProduct && String(m.sub_product_id) === String(editingSubProduct.id)) {
        return true;
      }

      // 3. Otherwise (mapped to another sub-product), hide it from the list completely
      return false;
    });
  }, [productVariants, editingSubProduct]);

  // Filtered model groups based on modal search box
  const filteredModelGroups = useMemo(() => {
    if (!partCodeSearch.trim()) return distinctModelGroups;
    const term = partCodeSearch.trim().toLowerCase();
    return distinctModelGroups.filter(
      (m) =>
        m.baseTemplate.toLowerCase().includes(term) ||
        m.motor_type.toLowerCase().includes(term) ||
        m.frame_size.toLowerCase().includes(term) ||
        m.variants.some((v) => (v.part_code || '').toLowerCase().includes(term))
    );
  }, [distinctModelGroups, partCodeSearch]);

  const handleOpenCreateModal = () => {
    const defaultPid = filterProductId !== 'ALL' ? filterProductId : products[0]?.id || '';
    setEditingSubProduct(null);
    setFormData({
      product_id: defaultPid,
      name: '',
      model_code: '',
      slug: '',
      description: '',
      image_url: null,
      sort_order: 0,
      status: 'ACTIVE',
    });
    setSelectedPartCodes([]);
    setPartCodeSearch('');
    setFeedback(null);
    setModalOpen(true);
    if (defaultPid) {
      fetchProductPartCodes(defaultPid, []);
    }
  };

  const handleEdit = async (row) => {
    setFeedback(null);
    setEditingSubProduct(row);
    setModalOpen(true);
    setPartCodeSearch('');

    try {
      const res = await api.get(`/sub-products/${row.id}`);
      const fullData = res.success ? res.data : row;
      setFormData({
        product_id: fullData.product_id || '',
        name: fullData.name || '',
        model_code: fullData.model_code || '',
        slug: fullData.slug || '',
        description: fullData.description || '',
        image_url: fullData.image_url || null,
        sort_order: fullData.sort_order || 0,
        status: fullData.status || 'ACTIVE',
      });

      const initialSelected = [
        ...(fullData.mapped_templates || []),
        ...(fullData.mapped_part_codes || []),
      ];
      fetchProductPartCodes(fullData.product_id, Array.from(new Set(initialSelected)));
    } catch (err) {
      console.error('Failed to load sub-product detail', err);
      setFormData({
        product_id: row.product_id || '',
        name: row.name || '',
        model_code: row.model_code || '',
        slug: row.slug || '',
        description: row.description || '',
        image_url: row.image_url || null,
        sort_order: row.sort_order || 0,
        status: row.status || 'ACTIVE',
      });
      fetchProductPartCodes(row.product_id, []);
    }
  };

  const handleToggleModelSelection = (model) => {
    const candidateKeys = [
      model.baseTemplate,
      model.key,
      ...model.variants.map((v) => v.part_code),
    ].filter(Boolean);

    const isCurrentlySelected = selectedPartCodes.some((code) =>
      candidateKeys.some((c) => String(c).toLowerCase() === String(code).toLowerCase())
    );

    if (isCurrentlySelected) {
      // Remove all associated keys
      setSelectedPartCodes((prev) =>
        prev.filter(
          (code) => !candidateKeys.some((c) => String(c).toLowerCase() === String(code).toLowerCase())
        )
      );
    } else {
      // Add base template to selection
      setSelectedPartCodes((prev) => [...prev, model.baseTemplate]);
    }
  };

  const handleSelectAllModels = () => {
    const allTemplates = filteredModelGroups.map((m) => m.baseTemplate);
    setSelectedPartCodes(Array.from(new Set([...selectedPartCodes, ...allTemplates])));
  };

  const handleDeselectAllModels = () => {
    const filteredTemplates = new Set(filteredModelGroups.map((m) => m.baseTemplate.toLowerCase()));
    setSelectedPartCodes((prev) =>
      prev.filter((code) => !filteredTemplates.has(String(code).toLowerCase()))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pid = Number(formData.product_id);
    if (!pid || isNaN(pid)) {
      alert('Please select a valid Parent Product.');
      return;
    }
    if (!formData.name || !String(formData.name).trim()) {
      alert('Please enter a Sub-Product / Series Name.');
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      ...formData,
      product_id: pid,
      name: String(formData.name).trim(),
      part_codes: selectedPartCodes,
      image_url:
        typeof formData.image_url === 'object' && formData.image_url !== null
          ? formData.image_url.url || formData.image_url.document_url || null
          : formData.image_url || null,
    };

    try {
      if (editingSubProduct) {
        await api.put(`/sub-products/${editingSubProduct.id}`, payload);
      } else {
        await api.post('/sub-products', payload);
      }
      setModalOpen(false);
      setEditingSubProduct(null);
      loadSubProducts(pagination.page, search, filterCategoryId, filterProductId);
    } catch (err) {
      const errMsg =
        Array.isArray(err.errors) && err.errors.length > 0
          ? err.errors.join('\n')
          : err.message || 'Operation failed';
      alert(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete sub-product "${row.name}"? All mapped part codes will be unlinked.`)) return;
    try {
      await api.delete(`/sub-products/${row.id}`);
      loadSubProducts(pagination.page, search, filterCategoryId, filterProductId);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  // Filter available products based on selected category in filter bar
  const filteredProductsForFilter =
    filterCategoryId === 'ALL'
      ? products
      : products.filter((p) => String(p.category_id) === String(filterCategoryId));

  const columns = [
    { header: 'ID', key: 'id' },
    {
      header: 'Image',
      key: 'image_url',
      render: (val) =>
        val ? (
          <img src={val} alt="" className="w-10 h-10 object-contain rounded bg-white border border-[#87C0CD]/30" />
        ) : (
          <div className="w-10 h-10 rounded bg-[#F3F9FB] border border-[#87C0CD]/30 flex items-center justify-center text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
        ),
    },
    { header: 'Sub-Product (Series Name)', key: 'name' },
    {
      header: 'Model Code',
      key: 'model_code',
      render: (val) =>
        val ? (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#113F67] dark:text-sky-300">
            {val}
          </span>
        ) : (
          '-'
        ),
    },
    { header: 'Parent Product', key: 'product_name' },
    { header: 'Category', key: 'category_name' },
    {
      header: 'Mapped Part Codes',
      key: 'part_codes_count',
      render: (val) => (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E4F1F5] dark:bg-[#0f1b36] text-[#226597] dark:text-[#38bdf8] border border-[#87C0CD]/40">
          <Tag className="w-3 h-3" />
          <span>{val || 0} Part Codes</span>
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Category & Product Quick Filter Bar */}
      <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#113F67] dark:text-[#f8fafc] flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#226597] dark:text-[#38bdf8]" />
            <span>Filter By:</span>
          </span>

          {/* Category Selector */}
          <select
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value);
              setFilterProductId('ALL');
            }}
            className="px-3 py-1.5 rounded-xl border border-[#87C0CD]/40 dark:border-[#233554] bg-[#F3F9FB] dark:bg-[#0b1329] text-xs font-bold text-[#113F67] dark:text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Product Selector */}
          <select
            value={filterProductId}
            onChange={(e) => setFilterProductId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#87C0CD]/40 dark:border-[#233554] bg-[#F3F9FB] dark:bg-[#0b1329] text-xs font-bold text-[#113F67] dark:text-slate-200 focus:outline-hidden max-w-[260px] truncate"
          >
            <option value="ALL">All Parent Products</option>
            {filteredProductsForFilter.map((p) => (
              <option key={p.id} value={p.id}>
                {p.product_name}
              </option>
            ))}
          </select>

          {(filterCategoryId !== 'ALL' || filterProductId !== 'ALL') && (
            <button
              onClick={() => {
                setFilterCategoryId('ALL');
                setFilterProductId('ALL');
              }}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-700 underline cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {subProducts.length} of {pagination.total} Sub-Products
        </span>
      </div>

      <DataTable
        title="Sub-Product Management (Tier 3 Series & Models)"
        columns={columns}
        data={subProducts}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadSubProducts(page, search, filterCategoryId, filterProductId)}
        onAddNew={handleOpenCreateModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit Sub-Product Custom Form Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubProduct ? `Edit Sub-Product: ${editingSubProduct.name}` : 'Create New Sub-Product Series'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Parent Product Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
              Parent Product (Brand) *
            </label>
            <select
              value={formData.product_id}
              required
              disabled={submitting}
              onChange={(e) => {
                const pid = e.target.value;
                setFormData((prev) => ({ ...prev, product_id: pid }));
                fetchProductPartCodes(pid, []);
              }}
              className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition font-bold"
            >
              <option value="">-- Select Parent Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} ({p.category_name || 'Product'})
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Product Name & Model Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
                Sub-Product / Series Name *
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. SV660P/N Series Absolute Encoder Cables"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
                Model / Series Identifier Code
              </label>
              <input
                type="text"
                disabled={submitting}
                placeholder="e.g. S6-L-P124"
                value={formData.model_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, model_code: e.target.value }))}
                className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition font-mono font-bold"
              />
            </div>
          </div>

          {/* URL Slug & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
                URL Slug
              </label>
              <input
                type="text"
                disabled={submitting}
                placeholder="Auto-generated from name if left empty"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
                Display Sort Order
              </label>
              <input
                type="number"
                disabled={submitting}
                placeholder="0"
                value={formData.sort_order}
                onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) || 0 }))}
                className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
              Description & Application Notes
            </label>
            <textarea
              rows={2}
              disabled={submitting}
              placeholder="Enter series highlights, motor series compatibility, specifications..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition"
            />
          </div>

          {/* Sub-Product Image */}
          <div className="space-y-1">
            <MediaUploader
              label="Sub-Product Series Image"
              value={formData.image_url}
              onChange={(val) => setFormData((prev) => ({ ...prev, image_url: val }))}
              folder="subproducts"
            />
          </div>

          {/* PART CODES & MODELS MULTI-SELECT PICKER */}
          <div className="space-y-2 pt-2 border-t border-[#87C0CD]/30 dark:border-[#233554]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-[#226597] dark:text-[#38bdf8]" />
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#113F67] dark:text-slate-100">
                  Map Part Codes / Cable Models ({distinctModelGroups.length} Models Available)
                </label>
              </div>

              {/* Selection Counter & Quick Select Actions */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E4F1F5] dark:bg-[#0f1b36] text-[#226597] dark:text-[#38bdf8] border border-[#87C0CD]/40">
                  {distinctModelGroups.filter((m) => {
                    const candidateKeys = [m.baseTemplate, m.key, ...m.variants.map((v) => v.part_code)].filter(Boolean);
                    return selectedPartCodes.some((code) =>
                      candidateKeys.some((c) => String(c).toLowerCase() === String(code).toLowerCase())
                    );
                  }).length}{' '}
                  Selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllModels}
                  className="text-[11px] font-bold text-[#226597] dark:text-[#38bdf8] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllModels}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-500 hover:underline cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Search Filter for Part Codes */}
            {distinctModelGroups.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search part code model, motor type, frame size..."
                  value={partCodeSearch}
                  onChange={(e) => setPartCodeSearch(e.target.value)}
                  className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597]"
                />
              </div>
            )}

            {/* Part Codes Multi-Select List Box */}
            <div className="max-h-60 overflow-y-auto border border-[#87C0CD]/40 dark:border-[#233554] rounded-xl p-2 bg-[#F8FCFD] dark:bg-[#0a1122] space-y-1.5">
              {loadingPartCodes ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#226597]" />
                  <span>Loading cable part codes for selected Parent Product...</span>
                </div>
              ) : distinctModelGroups.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <Info className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-500 dark:text-slate-400">
                    No cable variant setups found for this Parent Product yet.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    You can create variant part codes in the Cable Calculator page anytime.
                  </p>
                </div>
              ) : filteredModelGroups.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No part codes match search term "{partCodeSearch}".
                </div>
              ) : (
                filteredModelGroups.map((model) => {
                  const candidateKeys = [
                    model.baseTemplate,
                    model.key,
                    ...model.variants.map((v) => v.part_code),
                  ].filter(Boolean);

                  const isChecked = selectedPartCodes.some((code) =>
                    candidateKeys.some((c) => String(c).toLowerCase() === String(code).toLowerCase())
                  );

                  const isMappedToOther =
                    model.sub_product_id &&
                    editingSubProduct &&
                    String(model.sub_product_id) !== String(editingSubProduct.id);

                  return (
                    <div
                      key={model.key}
                      onClick={() => handleToggleModelSelection(model)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start space-x-3 select-none ${
                        isChecked
                          ? 'bg-[#E4F1F5] dark:bg-[#132a4a] border-[#226597] dark:border-[#38bdf8]'
                          : 'bg-white dark:bg-[#101c33] border-[#87C0CD]/30 dark:border-[#1e2f4d] hover:border-[#87C0CD]'
                      }`}
                    >
                      <div className="pt-0.5">
                        {isChecked ? (
                          <div className="w-4 h-4 rounded bg-[#226597] dark:bg-[#38bdf8] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border border-[#87C0CD] dark:border-slate-600 bg-white dark:bg-[#0b1329]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-mono text-xs font-bold text-[#113F67] dark:text-sky-300">
                              {model.baseTemplate}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {model.variants.length} length{model.variants.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Mapping Status Badge */}
                          {isChecked ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                              Selected for this Sub-Product
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                              Available (Unmapped)
                            </span>
                          )}
                        </div>

                        {/* Specs row */}
                        {(model.motor_type || model.frame_size) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                            {model.motor_type && <span>{model.motor_type}</span>}
                            {model.motor_type && model.frame_size && <span className="mx-1.5">•</span>}
                            {model.frame_size && <span>{model.frame_size}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
              Status
            </label>
            <select
              value={formData.status}
              disabled={submitting}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg px-3 py-2 text-xs text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] transition font-bold"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#87C0CD]/30 dark:border-[#233554]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-[#113F67] bg-[#E4F1F5] hover:bg-[#CBE2E8] dark:bg-[#152238] dark:hover:bg-[#1e2f4d] rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#226597] hover:bg-[#113F67] rounded-lg shadow transition flex items-center space-x-2 disabled:opacity-75 cursor-pointer"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>
                {submitting
                  ? 'Saving...'
                  : editingSubProduct
                  ? 'Update Sub-Product & Mappings'
                  : 'Create Sub-Product & Save Mappings'}
              </span>
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
