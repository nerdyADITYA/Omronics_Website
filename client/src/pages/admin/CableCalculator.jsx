import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  Settings2,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Layers,
  Sliders,
  Plus,
  Trash2,
  FileCode,
  Tag,
  Edit3,
  Filter,
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertTriangle,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

export function CableCalculator() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'setup'
  const [servoProducts, setServoProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [configurations, setConfigurations] = useState([]);

  // Active Variant Selection State
  const [activeVariantId, setActiveVariantId] = useState(null); // null means creating a NEW variant

  // Setup Overview Filter Dropdowns State
  const [filterProductName, setFilterProductName] = useState('ALL');
  const [filterPartCode, setFilterPartCode] = useState('ALL');

  // Datatable Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Excel Import & Safety Confirmation Modal State
  const [importingFile, setImportingFile] = useState(false);
  const [executingImport, setExecutingImport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null); // { totalRows, toInsert, toUpdate, unchanged, errors }
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportGuide, setShowImportGuide] = useState(false);
  const fileInputRef = useRef(null);

  // Reset to Page 1 when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProductName, filterPartCode, itemsPerPage]);

  // Derive unique product names for filter dropdown
  const uniqueProductNames = Array.from(
    new Set(configurations.map((c) => c.product_name).filter(Boolean))
  ).sort();

  // Derive unique part codes for filter dropdown (filtered by selected product if set)
  const uniquePartCodes = Array.from(
    new Set(
      configurations
        .filter((c) => filterProductName === 'ALL' || c.product_name === filterProductName)
        .map((c) => c.part_code)
        .filter(Boolean)
    )
  ).sort();

  // Filter configurations list based on dropdown selections
  const filteredConfigurations = configurations.filter((c) => {
    const matchProduct = filterProductName === 'ALL' || c.product_name === filterProductName;
    const matchPartCode = filterPartCode === 'ALL' || c.part_code === filterPartCode;
    return matchProduct && matchPartCode;
  });

  // Calculate Paginated Dataset
  const totalItems = filteredConfigurations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedConfigurations = filteredConfigurations.slice(startIndex, endIndex);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Live Adjustable Form State
  const [params, setParams] = useState({
    id: null,
    product_id: '',
    frame_size: '',
    motor_type: '',
    part_code: '',
    default_length: 5,
    cable_dimension: '',
    cable_cost_per_meter: '',
    connector1_name: '',
    connector1_cost: '',
    connector2_name: '',
    connector2_cost: '',
    labour_cost: '',
    battery_name: '',
    battery_cost: '',
    margin_percentage: 35,
    additional_components: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, configRes] = await Promise.all([
        api.get('/cable-costs/servo-products'),
        api.get('/cable-costs'),
      ]);

      if (prodRes.success && prodRes.data) {
        setServoProducts(prodRes.data);
        if (prodRes.data.length > 0 && !selectedProductId) {
          setSelectedProductId(String(prodRes.data[0].id));
        }
      }

      if (configRes.success && configRes.data) {
        setConfigurations(configRes.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load cable calculator data.' });
    } finally {
      setLoading(false);
    }
  };

  // Filter part code variants available for currently selected product
  const productVariants = configurations.filter(
    (c) => String(c.product_id) === String(selectedProductId)
  );

  const resetToNewVariant = (productId = selectedProductId) => {
    setActiveVariantId(null);
    setParams({
      id: null,
      product_id: productId,
      frame_size: '',
      motor_type: '',
      part_code: '',
      default_length: 5,
      cable_dimension: '',
      cable_cost_per_meter: '',
      connector1_name: '',
      connector1_cost: '',
      connector2_name: '',
      connector2_cost: '',
      labour_cost: 150,
      battery_name: '',
      battery_cost: '',
      margin_percentage: 35,
      additional_components: [],
    });
  };

  const loadVariantIntoForm = (variant) => {
    setActiveVariantId(variant.id);
    setParams({
      id: variant.id,
      product_id: variant.product_id,
      frame_size: variant.frame_size || '',
      motor_type: variant.motor_type || '',
      part_code: variant.part_code || '',
      default_length: Number(variant.default_length) || 5,
      cable_dimension: variant.cable_dimension || '',
      cable_cost_per_meter: variant.cable_cost_per_meter || '',
      connector1_name: variant.connector1_name || '',
      connector1_cost: variant.connector1_cost || '',
      connector2_name: variant.connector2_name || '',
      connector2_cost: variant.connector2_cost || '',
      labour_cost: variant.labour_cost !== undefined ? variant.labour_cost : 150,
      battery_name: variant.battery_name || '',
      battery_cost: variant.battery_cost || '',
      margin_percentage: Number(variant.margin_percentage) || 35,
      additional_components: Array.isArray(variant.additional_components) ? variant.additional_components : [],
    });
  };

  // Calculations
  const lengthVal = Number(params.default_length) || 0;
  const cablePerMeter = Number(params.cable_cost_per_meter) || 0;
  const rawCableCost = lengthVal * cablePerMeter;

  const c1Cost = Number(params.connector1_cost) || 0;
  const c2Cost = Number(params.connector2_cost) || 0;
  const labourCost = Number(params.labour_cost) || 0;
  const batteryCost = Number(params.battery_cost) || 0;

  const extraComponentsCost = (params.additional_components || []).reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );

  const landingCost = rawCableCost + c1Cost + c2Cost + labourCost + batteryCost + extraComponentsCost;
  const marginPct = Number(params.margin_percentage) || 0;
  const profitMarginCost = (marginPct / 100) * landingCost;
  const sellingPrice = landingCost + profitMarginCost;

  const handleAddExtraComponent = () => {
    setParams({
      ...params,
      additional_components: [...(params.additional_components || []), { name: '', cost: '' }],
    });
  };

  const handleUpdateExtraComponent = (index, field, value) => {
    const updated = [...(params.additional_components || [])];
    updated[index] = { ...updated[index], [field]: value };
    setParams({ ...params, additional_components: updated });
  };

  const handleRemoveExtraComponent = (index) => {
    const updated = (params.additional_components || []).filter((_, i) => i !== index);
    setParams({ ...params, additional_components: updated });
  };

  // Single-Click Atomic Save & Sync
  const handleSaveVariantAndSync = async () => {
    if (!selectedProductId) {
      setFeedback({ type: 'error', message: 'Please select a Servo Cable product.' });
      return;
    }
    if (!params.part_code || !params.part_code.trim()) {
      setFeedback({ type: 'error', message: 'Part Code is required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      ...params,
      id: activeVariantId, // if set, updates existing variant row
      product_id: Number(selectedProductId),
      landing_cost: Math.round(landingCost),
      selling_price: Math.round(sellingPrice),
    };

    try {
      const saveRes = await api.post('/cable-costs', payload);
      if (saveRes.success) {
        const savedPrice = Math.round(sellingPrice);
        await api.post('/cable-costs/sync-price', {
          productId: selectedProductId,
          sellingPrice: savedPrice,
        });

        setFeedback({
          type: 'success',
          message: `Saved Part Code setup "${params.part_code}" & synced Selling Price ₹${savedPrice.toLocaleString('en-IN')} to product catalog!`,
        });

        await loadData();
        if (saveRes.data && saveRes.data.id) {
          setActiveVariantId(saveRes.data.id);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save cable cost setup and sync price.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    const targetId = variantId || activeVariantId;
    if (!targetId) return;
    if (!window.confirm('Are you sure you want to delete this Part Code variant setup?')) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await api.delete(`/cable-costs/${targetId}`);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Variant setup deleted successfully.' });
        await loadData();
        resetToNewVariant(selectedProductId);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete variant setup.' });
    } finally {
      setDeleting(false);
    }
  };

  // Excel Sample Download Handler
  const handleDownloadSampleTemplate = async () => {
    try {
      const response = await api.get('/cable-costs/download-template', {
        responseType: 'blob',
      });
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'servo_cable_import_sample.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to download sample Excel template.' });
    }
  };

  // Filter-Aware Excel Export Handler
  const handleExportToExcel = () => {
    if (!filteredConfigurations || filteredConfigurations.length === 0) {
      setFeedback({ type: 'error', message: 'No cable records available to export.' });
      return;
    }

    const exportRows = filteredConfigurations.map((c) => {
      const len = Number(c.default_length) || 0;
      const cCost = Number(c.cable_cost_per_meter) || 0;
      const c1 = Number(c.connector1_cost) || 0;
      const c2 = Number(c.connector2_cost) || 0;
      const labour = Number(c.labour_cost) || 0;
      const battery = Number(c.battery_cost) || 0;
      const extra = Array.isArray(c.additional_components)
        ? c.additional_components.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
        : 0;
      const computedLanding = Math.round(len * cCost + c1 + c2 + labour + battery + extra);
      const landingVal = c.landing_cost ? Math.round(Number(c.landing_cost)) : computedLanding;
      const sellingVal = c.selling_price ? Math.round(Number(c.selling_price)) : Math.round(landingVal * (1 + (Number(c.margin_percentage) || 0) / 100));

      return {
        product_name: c.product_name || '',
        part_code: c.part_code || '',
        frame_size: c.frame_size || '',
        motor_type: c.motor_type || '',
        default_length: len,
        cable_dimension: c.cable_dimension || '',
        cable_cost_per_meter: cCost,
        connector1_name: c.connector1_name || '',
        connector1_cost: c1,
        connector2_name: c.connector2_name || '',
        connector2_cost: c2,
        labour_cost: labour,
        battery_name: c.battery_name || '',
        battery_cost: battery,
        margin_percentage: Number(c.margin_percentage) || 0,
        additional_components: Array.isArray(c.additional_components) ? JSON.stringify(c.additional_components) : '',
        landing_cost: landingVal,
        selling_price: sellingVal,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Servo Cable Setups');

    worksheet['!cols'] = [
      { wch: 24 }, // product_name
      { wch: 22 }, // part_code
      { wch: 24 }, // frame_size
      { wch: 30 }, // motor_type
      { wch: 15 }, // default_length
      { wch: 22 }, // cable_dimension
      { wch: 22 }, // cable_cost_per_meter
      { wch: 22 }, // connector1_name
      { wch: 16 }, // connector1_cost
      { wch: 22 }, // connector2_name
      { wch: 16 }, // connector2_cost
      { wch: 14 }, // labour_cost
      { wch: 16 }, // battery_name
      { wch: 14 }, // battery_cost
      { wch: 18 }, // margin_percentage
      { wch: 24 }, // additional_components
      { wch: 16 }, // landing_cost
      { wch: 16 }, // selling_price
    ];

    let filename = 'servo_cables_export.xlsx';
    if (filterProductName !== 'ALL' && filterPartCode !== 'ALL') {
      filename = `servo_cables_${filterProductName.replace(/\s+/g, '_')}_${filterPartCode.replace(/\s+/g, '_')}.xlsx`;
    } else if (filterProductName !== 'ALL') {
      filename = `servo_cables_${filterProductName.replace(/\s+/g, '_')}.xlsx`;
    } else if (filterPartCode !== 'ALL') {
      filename = `servo_cables_${filterPartCode.replace(/\s+/g, '_')}.xlsx`;
    }

    XLSX.writeFile(workbook, filename);

    setFeedback({
      type: 'success',
      message: `Successfully exported ${exportRows.length} cable variant setup(s) to "${filename}".`,
    });
  };

  // Excel File Select & Analysis Handler
  const handleFileSelectForImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportingFile(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/cable-costs/analyze-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data) {
        setAnalysisResult(res.data);
        setShowImportModal(true);
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to analyze Excel import file.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error parsing Excel import file.' });
    } finally {
      setImportingFile(false);
      e.target.value = '';
    }
  };

  // Batch Execution Confirm Handler
  const handleConfirmExecuteImport = async () => {
    if (!analysisResult) return;

    setExecutingImport(true);

    const recordsToProcess = [
      ...analysisResult.toInsert,
      ...analysisResult.toUpdate.map((u) => u.payload),
    ];

    try {
      const res = await api.post('/cable-costs/execute-import', { records: recordsToProcess });
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Successfully imported ${res.data.totalProcessed || recordsToProcess.length} cable variant setups (${res.data.insertedCount} inserted, ${res.data.updatedCount} modified).`,
        });
        setShowImportModal(false);
        setAnalysisResult(null);
        await loadData();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to execute batch import.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to execute batch import.' });
    } finally {
      setExecutingImport(false);
    }
  };

  const currentProduct = servoProducts.find((p) => String(p.id) === String(selectedProductId));

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        <RefreshCw className="w-8 h-8 text-[#226597] animate-spin mx-auto mb-2" />
        Loading Servo Cable Calculator...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans w-full max-w-[1600px] mx-auto px-2 sm:px-4">
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileSelectForImport}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#E4F1F5] text-[#226597]">
              <Calculator className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-[#113F67] font-display">Servo Cable Cost & Price Calculator</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multiple Part Code variants per Servo product. Adjust component specs, connectors, extra hardware, length, and profit margins live.
          </p>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex items-center space-x-2 bg-[#F3F9FB] dark:bg-[#0f1b36] p-1.5 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'calculator' ? 'bg-[#226597] text-white shadow-sm' : 'text-slate-600 hover:text-[#113F67]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'setup' ? 'bg-[#226597] text-white shadow-sm' : 'text-slate-600 hover:text-[#113F67]'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Setup Overview ({configurations.length})</span>
          </button>
        </div>
      </div>

      {/* Global Alert Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Viewport */}
      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selector, Variant Bar & Live Parameters */}
          <div className="lg:col-span-6 space-y-6">
            {/* Product & Variant Selector Box */}
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-[#87C0CD]/20 pb-3">
                <Layers className="w-4 h-4 text-[#226597]" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#113F67]">1. Target Servo Product & Part Code Variant</h2>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-1.5">Select Servo Cable Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] font-bold focus:outline-none focus:border-[#226597]"
                >
                  {servoProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} {p.model_number ? `(${p.model_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part Code Variant Selector Bar */}
              <div className="pt-2 border-t border-[#87C0CD]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#113F67] flex items-center space-x-1">
                    <FileCode className="w-3.5 h-3.5 text-[#226597]" />
                    <span>Saved Part Code Variants ({productVariants.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => resetToNewVariant(selectedProductId)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Part Code Variant</span>
                  </button>
                </div>

                {productVariants.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {productVariants.map((v) => {
                      const isSelected = String(v.id) === String(activeVariantId);
                      return (
                        <div key={v.id} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => loadVariantIntoForm(v)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-l-xl border border-r-0 transition flex items-center space-x-1.5 ${
                              isSelected
                                ? 'bg-[#226597] text-white border-[#226597] shadow-sm'
                                : 'bg-[#F3F9FB] dark:bg-[#152238] text-[#113F67] dark:text-slate-200 border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                            }`}
                          >
                            <Tag className="w-3 h-3 opacity-75" />
                            <span>{v.part_code || 'Unnamed Part Code'}</span>
                            {v.motor_type && <span className="opacity-75 text-[10px]">({v.motor_type})</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVariant(v.id)}
                            className={`px-2 py-1.5 text-xs font-bold rounded-r-xl border border-l-0 transition ${
                              isSelected
                                ? 'bg-[#113F67] text-rose-300 hover:text-white border-[#226597]'
                                : 'bg-[#F3F9FB] dark:bg-[#152238] text-slate-400 hover:text-rose-600 border-[#87C0CD]/40 dark:border-[#233554] hover:bg-rose-50'
                            }`}
                            title="Delete this variant"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 font-medium">
                    No saved variants yet for this product. Enter your specs below and click <strong>Save Variant Setup</strong> to create one!
                  </div>
                )}
              </div>

              {currentProduct && (
                <div className="p-3 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/30 dark:border-[#233554] rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Saved Product Catalog Price:</span>
                  <span className="font-extrabold text-[#113F67]">
                    {currentProduct.current_price ? `₹${Number(currentProduct.current_price).toLocaleString('en-IN')}` : 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Live Component Parameters Panel */}
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#87C0CD]/20 pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#226597]" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#113F67]">
                    2. Live Adjustable Parameters
                  </h2>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 dark:text-sky-300 text-sky-800">
                  {activeVariantId ? `Editing Variant #${activeVariantId}` : 'Creating New Variant'}
                </span>
              </div>

              {/* Header Specifications */}
              <div className="space-y-3 bg-[#F3F9FB]/60 dark:bg-[#0f1b36] p-4 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#226597] block">Header Specifications</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Frame Size Header</label>
                    <input
                      type="text"
                      placeholder="e.g. 40/60/80 FRAME SIZE"
                      value={params.frame_size}
                      onChange={(e) => setParams({ ...params, frame_size: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Power / Motor Type Header</label>
                    <input
                      type="text"
                      placeholder="e.g. 100W TO 750W - INCREMENTAL"
                      value={params.motor_type}
                      onChange={(e) => setParams({ ...params, motor_type: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Part Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. S6-L-P014-xx.x or S6-L-P020-xx.x"
                      value={params.part_code}
                      onChange={(e) => setParams({ ...params, part_code: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cable Dimension & Length */}
              <div className="space-y-3 bg-[#F3F9FB]/60 dark:bg-[#0f1b36] p-4 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#226597] block">Raw Cable & Length</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Cable Dimension Spec</label>
                    <input
                      type="text"
                      placeholder="e.g. 2X2X0.20SQMM SHD"
                      value={params.cable_dimension}
                      onChange={(e) => setParams({ ...params, cable_dimension: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Cable Cost per Meter (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 90"
                      value={params.cable_cost_per_meter}
                      onChange={(e) => setParams({ ...params, cable_cost_per_meter: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-[#113F67]">Cable Length (meters)</label>
                      <span className="text-xs font-extrabold text-[#226597]">{params.default_length}m</span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="e.g. 5"
                      value={params.default_length}
                      onChange={(e) => setParams({ ...params, default_length: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[3, 5, 10, 15, 20, 25, 30].map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setParams({ ...params, default_length: len })}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition ${
                            Number(params.default_length) === len
                              ? 'bg-[#226597] text-white border-[#226597]'
                              : 'bg-white dark:bg-[#152238] text-[#113F67] dark:text-slate-200 border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                          }`}
                        >
                          {len}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connectors, Labour & Battery */}
              <div className="space-y-3 bg-[#F3F9FB]/60 dark:bg-[#0f1b36] p-4 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#226597] block">Connectors & Assembly Costs</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Connector 1 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DB9-MALE"
                      value={params.connector1_name}
                      onChange={(e) => setParams({ ...params, connector1_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Connector 1 Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50"
                      value={params.connector1_cost}
                      onChange={(e) => setParams({ ...params, connector1_cost: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Connector 2 Name</label>
                    <input
                      type="text"
                      placeholder="e.g. MICRO MOTOR 7 PIN"
                      value={params.connector2_name}
                      onChange={(e) => setParams({ ...params, connector2_name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Connector 2 Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 250"
                      value={params.connector2_cost}
                      onChange={(e) => setParams({ ...params, connector2_cost: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Labour Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 150"
                      value={params.labour_cost}
                      onChange={(e) => setParams({ ...params, labour_cost: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#113F67] mb-1">Battery Cost (₹ Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 0"
                      value={params.battery_cost}
                      onChange={(e) => setParams({ ...params, battery_cost: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Dynamic Extra Components List */}
                <div className="pt-3 border-t border-[#87C0CD]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#113F67]">
                      Additional Components & Connectors
                    </span>
                    <button
                      type="button"
                      onClick={handleAddExtraComponent}
                      className="px-3 py-1 bg-[#226597] hover:bg-[#113F67] text-white text-[11px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Extra Component</span>
                    </button>
                  </div>

                  {Array.isArray(params.additional_components) && params.additional_components.length > 0 ? (
                    <div className="space-y-2">
                      {params.additional_components.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#87C0CD]/40">
                          <input
                            type="text"
                            placeholder={`e.g. Connector ${idx + 3} / Terminal`}
                            value={item.name}
                            onChange={(e) => handleUpdateExtraComponent(idx, 'name', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-[#F3F9FB] border border-[#87C0CD]/30 rounded text-xs font-semibold text-[#113F67] placeholder:text-slate-400"
                          />
                          <div className="w-28 flex items-center">
                            <span className="text-xs font-bold text-slate-500 mr-1">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 75"
                              value={item.cost}
                              onChange={(e) => handleUpdateExtraComponent(idx, 'cost', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#F3F9FB] border border-[#87C0CD]/30 rounded text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraComponent(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Remove component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No extra hardware components added yet.</p>
                  )}
                </div>
              </div>

              {/* Profit Margin % */}
              <div className="space-y-2 bg-[#F3F9FB]/60 dark:bg-[#0f1b36] p-4 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[#113F67]">Profit Margin (%)</label>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">{params.margin_percentage}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  placeholder="e.g. 35"
                  value={params.margin_percentage}
                  onChange={(e) => setParams({ ...params, margin_percentage: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-bold text-[#113F67] placeholder:text-slate-400"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[20, 25, 30, 35, 40, 45, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setParams({ ...params, margin_percentage: m })}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition ${
                        Number(params.margin_percentage) === m
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white dark:bg-[#152238] text-[#113F67] dark:text-slate-200 border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                      }`}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Excel Sheet Breakdown Card */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-6 shadow-md sticky top-6">
              <div className="flex items-center justify-between border-b border-[#87C0CD]/30 pb-4">
                <h2 className="text-base font-extrabold text-[#113F67] font-display flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Cost Calculation Breakdown</span>
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#226597] dark:text-[#38bdf8] bg-[#E4F1F5] dark:bg-[#0f1b36] px-3 py-1 rounded-full border border-[#87C0CD]/40 dark:border-[#233554]">
                  Formula Engine
                </span>
              </div>

              {/* Banner Header Table */}
              <div className="bg-[#FFF8E7] dark:bg-[#2a1e0c] border border-amber-300 dark:border-amber-700/60 rounded-xl p-4 text-center space-y-1">
                <div className="text-xs font-black tracking-wide text-amber-950 dark:text-amber-200 uppercase">
                  {params.frame_size || 'FRAME SIZE (SPECIFY)'}
                </div>
                <div className="text-xs font-black tracking-wide text-amber-950 dark:text-amber-200 uppercase">
                  {params.motor_type || 'POWER / MOTOR TYPE (SPECIFY)'}
                </div>
                <div className="text-sm font-black text-amber-900 dark:text-amber-300 font-mono pt-1">
                  {params.part_code || 'PART CODE (SPECIFY)'}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#87C0CD]/30 dark:border-[#233554] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F3F9FB] dark:bg-[#111c33] uppercase text-[10px] font-extrabold text-[#113F67] dark:text-[#38bdf8] border-b border-[#87C0CD]/30 dark:border-[#233554]">
                    <tr>
                      <th className="px-4 py-3">Component / Specification</th>
                      <th className="px-4 py-3 text-right">Details</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#87C0CD]/20 dark:divide-[#233554] text-[#113F67]">
                    <tr>
                      <td className="px-4 py-3 font-extrabold bg-[#E4F1F5] dark:bg-[#111c33] text-[#226597] dark:text-[#38bdf8]">LENGTH</td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#226597]">{lengthVal} meters</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{cablePerMeter}/m</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        Dimensions
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {params.cable_dimension || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{lengthVal}m × ₹{cablePerMeter}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{rawCableCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        Connector 1
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {params.connector1_name || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">Unit Price</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{c1Cost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        Connector 2
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {params.connector2_name || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">Unit Price</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{c2Cost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Labour Cost</td>
                      <td className="px-4 py-3 text-right text-slate-500">Assembly</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{labourCost.toLocaleString('en-IN')}</td>
                    </tr>
                    {batteryCost > 0 && (
                      <tr>
                        <td className="px-4 py-3 font-semibold">
                          Battery
                          <span className="block text-[10px] text-slate-500 font-normal">
                            {params.battery_name || 'Battery'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">Unit Price</td>
                        <td className="px-4 py-3 text-right font-mono font-bold">₹{batteryCost.toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    {/* Landing Cost Row (C10) */}
                    <tr className="bg-sky-50 font-extrabold border-t-2 border-[#87C0CD]/50">
                      <td className="px-4 py-3.5 text-[#113F67] uppercase tracking-wider text-xs">LANDING COST (C10)</td>
                      <td className="px-4 py-3.5 text-right text-[10px] text-slate-500 font-normal">
                        Sum of All Components
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm text-[#113F67]">
                        ₹{landingCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {/* Profit Margin % Row (C11 & C12) */}
                    <tr>
                      <td className="px-4 py-3 font-semibold">PROFIT MARGIN % (C11)</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{marginPct}%</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        + ₹{profitMarginCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {/* Final Selling Price Row (C13) */}
                    <tr className="bg-[#113F67] text-white font-extrabold">
                      <td className="px-4 py-4 uppercase tracking-wider text-xs">CALCULATED SELLING PRICE (C13)</td>
                      <td className="px-4 py-4 text-right text-[10px] text-slate-300 font-normal">
                        Landing + Profit Margin
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-lg text-emerald-400">
                        ₹{Math.round(sellingPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Single-Click Atomic Save & Sync Button */}
              <button
                onClick={handleSaveVariantAndSync}
                disabled={saving || !selectedProductId}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Variant Setup & Sync Selling Price (₹{Math.round(sellingPrice).toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Setup Overview Data Table & Controls Header Bar */
        <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-[#87C0CD]/30 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#113F67] font-display">
                Part Code Variant Configurations
              </h2>
            </div>

            {/* Data Table Filters & Excel Data Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Product Name Filter Dropdown */}
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#226597]" />
                <select
                  value={filterProductName}
                  onChange={(e) => {
                    setFilterProductName(e.target.value);
                    setFilterPartCode('ALL'); // Reset part code filter when product changes
                  }}
                  className="px-3 py-1.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                >
                  <option value="ALL">All Products ({uniqueProductNames.length})</option>
                  {uniqueProductNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part Code Filter Dropdown */}
              <div className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-[#226597]" />
                <select
                  value={filterPartCode}
                  onChange={(e) => setFilterPartCode(e.target.value)}
                  className="px-3 py-1.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                >
                  <option value="ALL">All Part Codes ({uniquePartCodes.length})</option>
                  {uniquePartCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Pill */}
              {(filterProductName !== 'ALL' || filterPartCode !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterProductName('ALL');
                    setFilterPartCode('ALL');
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Reset all filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              {/* Vertical Separator */}
              <div className="h-6 w-px bg-[#87C0CD]/40 mx-1 hidden sm:block"></div>

              {/* 1. Download Sample Excel Template */}
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="px-3.5 py-1.5 bg-[#E4F1F5] dark:bg-[#0f1b36] hover:bg-[#87C0CD]/30 text-[#113F67] dark:text-[#38bdf8] border border-[#87C0CD]/40 dark:border-[#233554] text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Download pre-formatted sample Excel import template"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sample Excel</span>
              </button>

              {/* 2. Import Excel File */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importingFile}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Upload Excel file to batch import cable prices"
              >
                {importingFile ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{importingFile ? 'Analyzing...' : 'Import Excel'}</span>
              </button>

              {/* 3. Export Excel File */}
              <button
                type="button"
                onClick={handleExportToExcel}
                className="px-3.5 py-1.5 bg-[#226597] hover:bg-[#113F67] text-white text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title={`Export ${filteredConfigurations.length} ${filterProductName !== 'ALL' || filterPartCode !== 'ALL' ? 'filtered' : 'all'} record(s) to Excel`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  Export Excel ({filteredConfigurations.length})
                </span>
              </button>

              {/* 4. Toggle Excel Field Requirements Guide */}
              <button
                type="button"
                onClick={() => setShowImportGuide(!showImportGuide)}
                className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  showImportGuide
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-[#F3F9FB] dark:bg-[#0b1329] text-[#226597] dark:text-[#38bdf8] border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                }`}
                title="Toggle Excel import field requirements guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Excel Import Field Requirements Guide */}
          {showImportGuide && (
            <div className="p-4 bg-sky-50/80 dark:bg-[#0f1b36] border border-[#87C0CD]/40 dark:border-[#233554] rounded-xl text-xs space-y-3 shadow-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#87C0CD]/30 dark:border-[#233554] pb-2">
                <div className="flex items-center space-x-2 font-extrabold text-[#113F67] dark:text-[#f8fafc]">
                  <Info className="w-4 h-4 text-[#226597] dark:text-[#38bdf8]" />
                  <span>Excel File Import Field Guidelines & Requirements</span>
                </div>
                <button
                  onClick={() => setShowImportGuide(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                {/* Required Columns */}
                <div className="p-3.5 bg-white dark:bg-[#152238] border border-emerald-200 dark:border-emerald-900/50 rounded-lg space-y-2">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MANDATORY / REQUIRED FIELDS</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <li>
                      <code className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">product_name</code>: Must match catalog product name (e.g., <span className="italic font-semibold">INNOVANCE</span>, <span className="italic font-semibold">DELTA</span>).
                    </li>
                    <li>
                      <code className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">part_code</code>: Unique Part Code identifier (e.g., <span className="italic font-semibold">S6-L-P014-xx.x</span>).
                    </li>
                    <li>
                      <code className="font-mono text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">cable_cost_per_meter</code>: Raw cable cost per meter in ₹ (e.g., <span className="italic font-semibold">90</span>).
                    </li>
                  </ul>
                </div>

                {/* Optional Columns */}
                <div className="p-3.5 bg-white dark:bg-[#152238] border border-sky-200 dark:border-sky-900/50 rounded-lg space-y-2">
                  <span className="font-extrabold text-[#226597] dark:text-[#38bdf8] flex items-center space-x-1.5 text-xs">
                    <Info className="w-4 h-4" />
                    <span>OPTIONAL FIELDS (AUTOMATIC DEFAULTS IF BLANK)</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <li>
                      <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">default_length</code>: Cable length in meters (Default: <span className="font-bold">5m</span>).
                    </li>
                    <li>
                      <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">connector1_name</code> / <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">connector1_cost</code>: Primary connector.
                    </li>
                    <li>
                      <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">connector2_name</code> / <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">connector2_cost</code>: Secondary connector.
                    </li>
                    <li>
                      <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">labour_cost</code>: Assembly labour fee (Default: <span className="font-bold">₹150</span>).
                    </li>
                    <li>
                      <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">margin_percentage</code>: Profit margin % (Default: <span className="font-bold">35%</span>).
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#113F67]">
              <thead className="bg-[#F3F9FB] uppercase text-[10px] font-extrabold text-[#113F67] border-b border-[#87C0CD]/30">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">Product Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Part Code</th>
                  <th className="px-4 py-3 whitespace-nowrap">Header / Motor Spec</th>
                  <th className="px-4 py-3 whitespace-nowrap">Cable Spec & Cost</th>
                  <th className="px-4 py-3 whitespace-nowrap">Connectors & Extra Items</th>
                  <th className="px-4 py-3 whitespace-nowrap">Landing Price</th>
                  <th className="px-4 py-3 whitespace-nowrap">Margin %</th>
                  <th className="px-4 py-3 whitespace-nowrap">Final Selling Price</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87C0CD]/20">
                {paginatedConfigurations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                      {configurations.length === 0
                        ? 'No Part Code variant configurations saved yet. Select a product on the calculator tab to configure!'
                        : 'No variant configurations match the selected Product Name / Part Code dropdown filters.'}
                    </td>
                  </tr>
                ) : (
                  paginatedConfigurations.map((c) => {
                    const len = Number(c.default_length) || 0;
                    const cCost = Number(c.cable_cost_per_meter) || 0;
                    const c1 = Number(c.connector1_cost) || 0;
                    const c2 = Number(c.connector2_cost) || 0;
                    const labour = Number(c.labour_cost) || 0;
                    const battery = Number(c.battery_cost) || 0;
                    const extra = Array.isArray(c.additional_components)
                      ? c.additional_components.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
                      : 0;
                    const computedLanding = Math.round(len * cCost + c1 + c2 + labour + battery + extra);
                    const landingVal = c.landing_cost ? Math.round(Number(c.landing_cost)) : computedLanding;

                    return (
                      <tr key={c.id} className="hover:bg-[#F3F9FB]/60 transition">
                        <td className="px-4 py-3.5 font-bold text-[#113F67] whitespace-nowrap">{c.product_name}</td>
                        <td className="px-4 py-3.5 font-mono text-[#226597] font-bold whitespace-nowrap">
                          <span className="px-2.5 py-1 bg-[#E4F1F5] rounded-lg border border-[#87C0CD]/40">
                            {c.part_code || 'Unnamed Part Code'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 space-y-0.5 min-w-[180px]">
                          {c.frame_size && <span className="block text-[10px] text-slate-500 font-semibold">{c.frame_size}</span>}
                          {c.motor_type && <span className="block text-[11px] font-bold text-[#113F67]">{c.motor_type}</span>}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-semibold">{c.cable_dimension || '-'}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {c.cable_cost_per_meter ? `₹${c.cable_cost_per_meter}/m` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 space-y-0.5 min-w-[200px]">
                          {c.connector1_name && <span className="block text-[11px]">{c.connector1_name}: ₹{c.connector1_cost}</span>}
                          {c.connector2_name && <span className="block text-[11px]">{c.connector2_name}: ₹{c.connector2_cost}</span>}
                          {Array.isArray(c.additional_components) &&
                            c.additional_components.map((item, idx) => (
                              <span key={idx} className="block text-[10px] text-amber-800 font-semibold">
                                + {item.name}: ₹{item.cost}
                              </span>
                            ))}
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono text-[#113F67] whitespace-nowrap">
                          {landingVal > 0 ? `₹${landingVal.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-emerald-700 whitespace-nowrap">{c.margin_percentage}%</td>
                        <td className="px-4 py-3.5 font-bold font-mono text-emerald-700 whitespace-nowrap">
                          {c.selling_price ? `₹${Number(c.selling_price).toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProductId(String(c.product_id));
                                loadVariantIntoForm(c);
                                setActiveTab('calculator');
                              }}
                              className="p-2 bg-[#226597] hover:bg-[#113F67] text-white rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                              title="Edit in Calculator"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(c.id)}
                              className="p-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center"
                              title="Delete variant setup"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Datatable Pagination Footer */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#87C0CD]/30 dark:border-[#233554] text-xs">
              {/* Entry Counter Summary */}
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{startIndex + 1}</span> to{' '}
                <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{endIndex}</span> of{' '}
                <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{totalItems}</span> entries
                {totalItems < configurations.length && (
                  <span className="text-slate-400 dark:text-slate-500 ml-1">
                    (Filtered from {configurations.length} total)
                  </span>
                )}
              </div>

              {/* Page Controls & Rows Per Page Selector */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Items Per Page Dropdown */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2.5 py-1 bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-[#f8fafc] focus:outline-none focus:border-[#226597]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-[#87C0CD]/40 dark:border-[#233554] bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947] transition cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#226597] text-white shadow-xs'
                          : 'bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] border border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#87C0CD]/40 dark:border-[#233554] bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947] transition cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-Import Safety Analysis & Confirmation Modal */}
      {showImportModal && analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#87C0CD]/30 dark:border-[#233554] pb-4 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#113F67] dark:text-[#f8fafc] font-display">
                    Excel Import Analysis & Confirmation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review records found in file before committing changes to the database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setAnalysisResult(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Field Requirements Reminder in Modal */}
            <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 rounded-xl text-[11px] flex items-center justify-between text-slate-700 dark:text-slate-300 shrink-0">
              <span>
                <strong className="text-[#226597] dark:text-[#38bdf8]">Mandatory Columns:</strong> <code className="font-mono font-bold">product_name</code>, <code className="font-mono font-bold">part_code</code>, <code className="font-mono font-bold">cable_cost_per_meter</code>.
              </span>
              <span className="text-slate-400">All other columns use defaults if empty.</span>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  New Records
                </span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 block pt-0.5">
                  {analysisResult.toInsert.length} to Insert
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  Existing Records
                </span>
                <span className="text-lg font-extrabold text-amber-700 dark:text-amber-400 block pt-0.5">
                  {analysisResult.toUpdate.length} to Modify/Overwrite
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0f1b36] border border-slate-200 dark:border-[#233554] rounded-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Unchanged
                </span>
                <span className="text-lg font-extrabold text-slate-700 dark:text-slate-300 block pt-0.5">
                  {analysisResult.unchanged.length} Identical
                </span>
              </div>

              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                  Errors / Skipped
                </span>
                <span className="text-lg font-extrabold text-rose-700 dark:text-rose-400 block pt-0.5">
                  {analysisResult.errors.length} Rows
                </span>
              </div>
            </div>

            {/* Validation Errors Alert if any */}
            {analysisResult.errors.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs space-y-1 shrink-0">
                <span className="font-extrabold text-rose-800 dark:text-rose-300 block">
                  ⚠️ Skipping {analysisResult.errors.length} Invalid Rows:
                </span>
                <ul className="list-disc list-inside text-rose-700 dark:text-rose-300 text-[11px] space-y-0.5 max-h-20 overflow-y-auto">
                  {analysisResult.errors.map((err, idx) => (
                    <li key={idx}>Row #{err.row}: {err.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overwritten Records Comparison Table */}
            {analysisResult.toUpdate.length > 0 ? (
              <div className="space-y-2 flex-1 overflow-y-auto min-h-[140px]">
                <span className="text-xs font-bold text-[#113F67] dark:text-[#f8fafc] block">
                  Existing Records That Will Be Modified / Overwritten ({analysisResult.toUpdate.length}):
                </span>
                <div className="border border-[#87C0CD]/30 dark:border-[#233554] rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-[#F3F9FB] dark:bg-[#111c33] uppercase text-[10px] font-extrabold text-[#113F67] dark:text-[#38bdf8] border-b border-[#87C0CD]/30 dark:border-[#233554]">
                      <tr>
                        <th className="px-3 py-2">Part Code</th>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2 text-right">Landing Cost Diff</th>
                        <th className="px-3 py-2 text-right">Final Selling Price Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#87C0CD]/20 dark:divide-[#233554]">
                      {analysisResult.toUpdate.map((u, idx) => (
                        <tr key={idx} className="hover:bg-[#F3F9FB]/60 dark:hover:bg-[#1e2e4a]">
                          <td className="px-3 py-2 font-mono font-bold text-[#226597] dark:text-[#38bdf8]">{u.part_code}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">{u.product_name}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-400">
                            <span className="line-through text-slate-400">₹{u.old_landing_cost}</span> ➔{' '}
                            <span className="font-bold text-[#113F67] dark:text-white">₹{u.new_landing_cost}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            <span className="line-through text-slate-400">₹{u.old_selling_price}</span> ➔{' '}
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{u.new_selling_price}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium shrink-0">
                ✓ No existing database records will be overwritten. All {analysisResult.toInsert.length} items are brand new Part Code configurations!
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end space-x-3 border-t border-[#87C0CD]/30 dark:border-[#233554] pt-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setAnalysisResult(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExecuteImport}
                disabled={executingImport || (analysisResult.toInsert.length === 0 && analysisResult.toUpdate.length === 0)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                {executingImport ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {executingImport
                    ? 'Executing Database Upsert...'
                    : `Confirm & Execute Import (${analysisResult.toInsert.length + analysisResult.toUpdate.length} Records)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
