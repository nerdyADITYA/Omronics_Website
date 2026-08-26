import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import api from '../../services/api';

export function CableCalculator() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'setup'
  const [servoProducts, setServoProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Active Variant Selection State
  const [activeVariantId, setActiveVariantId] = useState(null); // null means creating a NEW variant

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
      console.error('Failed to load cable calculator data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Saved Variants for the currently selected product
  const productVariants = configurations.filter(
    (c) => String(c.product_id) === String(selectedProductId)
  );

  useEffect(() => {
    if (!selectedProductId) return;
    const variants = configurations.filter(
      (c) => String(c.product_id) === String(selectedProductId)
    );

    if (variants.length > 0) {
      // If we haven't selected a variant yet, or selected one not in this product, default to first variant
      const currentExists = variants.find((v) => String(v.id) === String(activeVariantId));
      if (currentExists) {
        loadVariantIntoForm(currentExists);
      } else {
        loadVariantIntoForm(variants[0]);
      }
    } else {
      // Reset form to blank new variant for this product
      resetToNewVariant(selectedProductId);
    }
  }, [selectedProductId, configurations]);

  const loadVariantIntoForm = (variant) => {
    setActiveVariantId(variant.id);
    setParams({
      id: variant.id,
      product_id: String(variant.product_id),
      frame_size: variant.frame_size || '',
      motor_type: variant.motor_type || '',
      part_code: variant.part_code || '',
      default_length: variant.default_length !== undefined && variant.default_length !== null ? Number(variant.default_length) : 5,
      cable_dimension: variant.cable_dimension || '',
      cable_cost_per_meter: variant.cable_cost_per_meter !== undefined && variant.cable_cost_per_meter !== null ? variant.cable_cost_per_meter : '',
      connector1_name: variant.connector1_name || '',
      connector1_cost: variant.connector1_cost !== undefined && variant.connector1_cost !== null ? variant.connector1_cost : '',
      connector2_name: variant.connector2_name || '',
      connector2_cost: variant.connector2_cost !== undefined && variant.connector2_cost !== null ? variant.connector2_cost : '',
      labour_cost: variant.labour_cost !== undefined && variant.labour_cost !== null ? variant.labour_cost : '',
      battery_name: variant.battery_name || '',
      battery_cost: variant.battery_cost !== undefined && variant.battery_cost !== null ? variant.battery_cost : '',
      margin_percentage: variant.margin_percentage !== undefined && variant.margin_percentage !== null ? Number(variant.margin_percentage) : 35,
      additional_components: Array.isArray(variant.additional_components) ? variant.additional_components : [],
    });
  };

  const resetToNewVariant = (productId = selectedProductId) => {
    const selectedProd = servoProducts.find((p) => String(p.id) === String(productId));
    setActiveVariantId(null);
    setParams({
      id: null,
      product_id: String(productId),
      frame_size: '',
      motor_type: '',
      part_code: selectedProd?.model_number || '',
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
  };

  // Dynamic Extra Component Handlers
  const handleAddExtraComponent = () => {
    setParams((prev) => ({
      ...prev,
      additional_components: [
        ...(Array.isArray(prev.additional_components) ? prev.additional_components : []),
        { name: '', cost: '' },
      ],
    }));
  };

  const handleUpdateExtraComponent = (index, field, value) => {
    setParams((prev) => {
      const list = [...(Array.isArray(prev.additional_components) ? prev.additional_components : [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, additional_components: list };
    });
  };

  const handleRemoveExtraComponent = (index) => {
    setParams((prev) => {
      const list = [...(Array.isArray(prev.additional_components) ? prev.additional_components : [])];
      list.splice(index, 1);
      return { ...prev, additional_components: list };
    });
  };

  // Live Formula Calculations
  const lengthVal = Number(params.default_length) || 0;
  const cablePerMeter = Number(params.cable_cost_per_meter) || 0;
  const rawCableCost = lengthVal * cablePerMeter;
  const c1Cost = Number(params.connector1_cost) || 0;
  const c2Cost = Number(params.connector2_cost) || 0;
  const labourCost = Number(params.labour_cost) || 0;
  const batteryCost = Number(params.battery_cost) || 0;

  const extraComponentsCost = Array.isArray(params.additional_components)
    ? params.additional_components.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)
    : 0;

  // C10 Landing Cost = (C5 * C6) + C7 + C8 + C9 + Battery + Extra Components
  const landingCost = rawCableCost + c1Cost + c2Cost + labourCost + batteryCost + extraComponentsCost;
  // C11 Margin %
  const marginPct = Number(params.margin_percentage) || 0;
  // C12 Profit Margin Cost = C11 * C10
  const profitMarginCost = (marginPct / 100) * landingCost;
  // C13 Selling Price = C12 + C10
  const sellingPrice = landingCost + profitMarginCost;

  const handleSaveVariantAndSync = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProductId) {
      alert('Please select a Servo Cable product.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const finalPrice = Math.round(sellingPrice);
      const finalLanding = Math.round(landingCost);
      // 1. Save component configuration (with landing_cost, selling_price, and id if editing)
      const configRes = await api.post('/cable-costs', {
        ...params,
        landing_cost: finalLanding,
        selling_price: finalPrice,
        id: activeVariantId,
        product_id: selectedProductId,
      });
      // 2. Sync product price
      const priceRes = await api.post('/cable-costs/sync-price', {
        productId: selectedProductId,
        sellingPrice: finalPrice,
      });

      if (configRes.success && priceRes.success) {
        setFeedback({
          type: 'success',
          message: `Saved variant setup "${params.part_code || 'Part Code'}" and updated Product Catalog price to ₹${finalPrice.toLocaleString('en-IN')}!`,
        });
        await loadData();
        if (configRes.data && configRes.data.id) {
          setActiveVariantId(configRes.data.id);
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
    <div className="space-y-6 font-sans max-w-7xl mx-auto">
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

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-[#F3F9FB] p-1.5 rounded-xl border border-[#87C0CD]/30">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'calculator' ? 'bg-[#226597] text-white shadow-sm' : 'text-slate-600 hover:text-[#113F67]'
            }`}
          >
            <Calculator className="w-4 h-4" />
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

      {/* Feedback Alert */}
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
          <button onClick={() => setFeedback(null)} className="hover:opacity-75">
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
                                : 'bg-[#F3F9FB] text-[#113F67] border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
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
                                : 'bg-[#F3F9FB] text-slate-400 hover:text-rose-600 border-[#87C0CD]/40 hover:bg-rose-50'
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
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-medium">
                    No saved variants yet for this product. Enter your specs below and click <strong>Save Variant Setup</strong> to create one!
                  </div>
                )}
              </div>

              {currentProduct && (
                <div className="p-3 bg-[#F3F9FB] border border-[#87C0CD]/30 rounded-xl flex items-center justify-between text-xs">
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
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {activeVariantId ? `Editing Variant #${activeVariantId}` : 'Creating New Variant'}
                </span>
              </div>

              {/* Header Specifications */}
              <div className="space-y-3 bg-[#F3F9FB]/60 p-4 rounded-xl border border-[#87C0CD]/30">
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
                      className="w-full px-3 py-2 bg-white border border-[#87C0CD]/40 rounded-lg text-xs font-mono font-bold text-[#226597] placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Cable Dimension & Length */}
              <div className="space-y-3 bg-[#F3F9FB]/60 p-4 rounded-xl border border-[#87C0CD]/30">
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
                              : 'bg-white text-[#113F67] border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
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
              <div className="space-y-3 bg-[#F3F9FB]/60 p-4 rounded-xl border border-[#87C0CD]/30">
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
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                            title="Remove Component"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No extra components added. Click above to add dynamic connectors or hardware.</p>
                  )}
                </div>
              </div>

              {/* Profit Margin % */}
              <div className="space-y-2 bg-[#F3F9FB]/60 p-4 rounded-xl border border-[#87C0CD]/30">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[#113F67]">Profit Margin (%)</label>
                  <span className="text-xs font-extrabold text-emerald-700">{params.margin_percentage}%</span>
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
                          : 'bg-white text-[#113F67] border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
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
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#226597] bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
                  Formula Engine
                </span>
              </div>

              {/* Banner Header Table */}
              <div className="bg-[#FFF8E7] border border-amber-300 rounded-xl p-4 text-center space-y-1">
                <div className="text-xs font-black tracking-wide text-amber-950 uppercase">
                  {params.frame_size || 'FRAME SIZE (SPECIFY)'}
                </div>
                <div className="text-xs font-black tracking-wide text-amber-950 uppercase">
                  {params.motor_type || 'POWER / MOTOR TYPE (SPECIFY)'}
                </div>
                <div className="text-sm font-black text-amber-900 font-mono pt-1">
                  {params.part_code || 'PART CODE (SPECIFY)'}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#87C0CD]/30 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F3F9FB] uppercase text-[10px] font-extrabold text-[#113F67] border-b border-[#87C0CD]/30">
                    <tr>
                      <th className="px-4 py-3">Component / Specification</th>
                      <th className="px-4 py-3 text-right">Details</th>
                      <th className="px-4 py-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#87C0CD]/20 text-[#113F67]">
                    <tr>
                      <td className="px-4 py-3 font-extrabold bg-amber-50/50">LENGTH</td>
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

                    {/* Dynamic Extra Components Rows */}
                    {Array.isArray(params.additional_components) &&
                      params.additional_components.map((item, idx) => {
                        const itemCost = Number(item.cost) || 0;
                        return (
                          <tr key={idx} className="bg-amber-50/20">
                            <td className="px-4 py-3 font-semibold">
                              {item.name || `Extra Component ${idx + 3}`}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-500">Unit Price</td>
                            <td className="px-4 py-3 text-right font-mono font-bold">₹{itemCost.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}

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
        /* Tab 2: Complete Unfiltered Setup Overview Table */
        <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#87C0CD]/30 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#113F67] font-display">
                All Saved Part Code Variant Configurations ({configurations.length})
              </h2>
              <p className="text-xs text-slate-500">
                Complete overview of all configured Part Codes across all Servo Cable products.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#113F67]">
              <thead className="bg-[#F3F9FB] uppercase text-[10px] font-extrabold text-[#113F67] border-b border-[#87C0CD]/30">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Part Code</th>
                  <th className="px-4 py-3">Header / Motor Spec</th>
                  <th className="px-4 py-3">Cable Spec & Cost</th>
                  <th className="px-4 py-3">Connectors & Extra Items</th>
                  <th className="px-4 py-3">Landing Price</th>
                  <th className="px-4 py-3">Margin %</th>
                  <th className="px-4 py-3">Final Selling Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87C0CD]/20">
                {configurations.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                      No Part Code variant configurations saved yet. Select a product on the calculator tab to configure!
                    </td>
                  </tr>
                ) : (
                  configurations.map((c) => {
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
                        <td className="px-4 py-3.5 font-bold text-[#113F67]">{c.product_name}</td>
                        <td className="px-4 py-3.5 font-mono text-[#226597] font-bold">
                          <span className="px-2 py-0.5 bg-[#E4F1F5] rounded border border-[#87C0CD]/40">
                            {c.part_code || 'Unnamed Part Code'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 space-y-0.5">
                          {c.frame_size && <span className="block text-[10px] text-slate-500 font-semibold">{c.frame_size}</span>}
                          {c.motor_type && <span className="block text-[11px] font-bold text-[#113F67]">{c.motor_type}</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold">{c.cable_dimension || '-'}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {c.cable_cost_per_meter ? `₹${c.cable_cost_per_meter}/m` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 space-y-0.5">
                          {c.connector1_name && <span className="block text-[11px]">{c.connector1_name}: ₹{c.connector1_cost}</span>}
                          {c.connector2_name && <span className="block text-[11px]">{c.connector2_name}: ₹{c.connector2_cost}</span>}
                          {Array.isArray(c.additional_components) &&
                            c.additional_components.map((item, idx) => (
                              <span key={idx} className="block text-[10px] text-amber-800 font-semibold">
                                + {item.name}: ₹{item.cost}
                              </span>
                            ))}
                        </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-[#113F67]">
                        {landingVal > 0 ? `₹${landingVal.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">{c.margin_percentage}%</td>
                      <td className="px-4 py-3.5 font-bold font-mono text-emerald-700">
                        {c.selling_price ? `₹${Number(c.selling_price).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedProductId(String(c.product_id));
                            loadVariantIntoForm(c);
                            setActiveTab('calculator');
                          }}
                          className="px-3 py-1 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-[11px] rounded-lg transition cursor-pointer"
                        >
                          Load in Calculator
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(c.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
