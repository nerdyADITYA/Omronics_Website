import React, { useState, useEffect } from 'react';
import { Calculator, Settings2, Save, RefreshCw, CheckCircle2, AlertCircle, Cpu, Zap, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export function CableCalculator() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'setup'
  const [servoProducts, setServoProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [configurations, setConfigurations] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Interactive Calculator State
  const [calcLength, setCalcLength] = useState(5);
  const [calcMargin, setCalcMargin] = useState(35);

  // Setup Form State
  const [setupForm, setSetupForm] = useState({
    product_id: '',
    frame_size: '40/60/80 FRAME SIZE',
    motor_type: '100W TO 750W - INCREMENTAL',
    part_code: 'S6-L-P014-xx.x',
    default_length: 5,
    cable_dimension: '2X2X0.20SQMM SHD',
    cable_cost_per_meter: 90,
    connector1_name: 'DB9-MALE',
    connector1_cost: 50,
    connector2_name: 'MICRO MOTOR 7 PIN',
    connector2_cost: 250,
    labour_cost: 150,
    battery_name: '',
    battery_cost: 0,
    margin_percentage: 35,
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

  useEffect(() => {
    if (!selectedProductId) return;
    const found = configurations.find((c) => String(c.product_id) === String(selectedProductId));
    if (found) {
      setCurrentConfig(found);
      setCalcLength(Number(found.default_length) || 5);
      setCalcMargin(Number(found.margin_percentage) || 35);
      setSetupForm({
        product_id: String(found.product_id),
        frame_size: found.frame_size || '',
        motor_type: found.motor_type || '',
        part_code: found.part_code || '',
        default_length: Number(found.default_length) || 5,
        cable_dimension: found.cable_dimension || '',
        cable_cost_per_meter: Number(found.cable_cost_per_meter) || 0,
        connector1_name: found.connector1_name || '',
        connector1_cost: Number(found.connector1_cost) || 0,
        connector2_name: found.connector2_name || '',
        connector2_cost: Number(found.connector2_cost) || 0,
        labour_cost: Number(found.labour_cost) || 0,
        battery_name: found.battery_name || '',
        battery_cost: Number(found.battery_cost) || 0,
        margin_percentage: Number(found.margin_percentage) || 35,
      });
    } else {
      const selectedProd = servoProducts.find((p) => String(p.id) === String(selectedProductId));
      setCurrentConfig(null);
      setSetupForm((prev) => ({
        ...prev,
        product_id: selectedProductId,
        part_code: selectedProd?.model_number || 'S6-L-P014-xx.x',
      }));
    }
  }, [selectedProductId, configurations, servoProducts]);

  // Formulas
  const lengthVal = Number(calcLength) || 0;
  const cablePerMeter = Number(currentConfig?.cable_cost_per_meter) || Number(setupForm.cable_cost_per_meter) || 0;
  const rawCableCost = lengthVal * cablePerMeter;
  const c1Cost = Number(currentConfig?.connector1_cost) || Number(setupForm.connector1_cost) || 0;
  const c2Cost = Number(currentConfig?.connector2_cost) || Number(setupForm.connector2_cost) || 0;
  const labourCost = Number(currentConfig?.labour_cost) || Number(setupForm.labour_cost) || 0;
  const batteryCost = Number(currentConfig?.battery_cost) || Number(setupForm.battery_cost) || 0;

  // C10 Landing Cost = (C5 * C6) + C7 + C8 + C9 + Battery
  const landingCost = rawCableCost + c1Cost + c2Cost + labourCost + batteryCost;
  // C11 Margin %
  const marginPct = Number(calcMargin) || 0;
  // C12 Profit Margin Cost = C11 * C10
  const profitMarginCost = (marginPct / 100) * landingCost;
  // C13 Selling Price = C12 + C10
  const sellingPrice = landingCost + profitMarginCost;

  const handleSetupSave = async (e) => {
    e.preventDefault();
    if (!setupForm.product_id) {
      alert('Please select a Servo Cable product.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.post('/cable-costs', setupForm);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Cable cost components saved successfully!' });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save cable cost configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncPrice = async () => {
    if (!selectedProductId || !sellingPrice) return;
    setSyncing(true);
    setFeedback(null);
    try {
      const finalPrice = Math.round(sellingPrice);
      const res = await api.post('/cable-costs/sync-price', {
        productId: selectedProductId,
        sellingPrice: finalPrice,
      });
      if (res.success) {
        setFeedback({ type: 'success', message: `Selling Price ₹${finalPrice.toLocaleString('en-IN')} updated on Product catalog!` });
        await loadData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to sync selling price to product.' });
    } finally {
      setSyncing(false);
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
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
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
            Calculate landing costs, profit margins, and update selling prices directly for Servo Cable products.
          </p>
        </div>

        {/* Tab Selector */}
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
            <span>Component Setup</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
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

      {/* Main Content Areas */}
      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selector & Variable Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#113F67]">1. Select Servo Product</h2>
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Servo Cable Product *</label>
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

              {currentProduct && (
                <div className="p-3.5 bg-[#F3F9FB] border border-[#87C0CD]/30 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Current Saved Selling Price:</span>
                    <span className="font-extrabold text-[#113F67]">
                      {currentProduct.current_price ? `₹${Number(currentProduct.current_price).toLocaleString('en-IN')}` : 'Not set'}
                    </span>
                  </div>
                  {currentConfig && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Part Code:</span>
                      <span className="font-mono text-[#226597] font-bold">{currentConfig.part_code || '-'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Variable Inputs Card */}
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-5 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#113F67]">2. Adjust Cable Parameters</h2>

              {/* Cable Length */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#113F67]">Cable Length (meters)</label>
                  <span className="text-xs font-extrabold text-[#226597]">{calcLength} meters</span>
                </div>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={calcLength}
                  onChange={(e) => setCalcLength(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-extrabold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[3, 5, 10, 15, 20, 25, 30].map((len) => (
                    <button
                      key={len}
                      onClick={() => setCalcLength(len)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition ${
                        Number(calcLength) === len
                          ? 'bg-[#226597] text-white border-[#226597]'
                          : 'bg-[#F3F9FB] text-[#113F67] border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
                      }`}
                    >
                      {len}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Margin % */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#113F67]">Profit Margin (%)</label>
                  <span className="text-xs font-extrabold text-emerald-700">{calcMargin}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={calcMargin}
                  onChange={(e) => setCalcMargin(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-extrabold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[20, 25, 30, 35, 40, 45, 50].map((m) => (
                    <button
                      key={m}
                      onClick={() => setCalcMargin(m)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition ${
                        Number(calcMargin) === m
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-[#F3F9FB] text-[#113F67] border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
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
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-6 shadow-md">
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
                  {currentConfig?.frame_size || setupForm.frame_size || '40/60/80 FRAME SIZE'}
                </div>
                <div className="text-xs font-black tracking-wide text-amber-950 uppercase">
                  {currentConfig?.motor_type || setupForm.motor_type || '100W TO 750W - INCREMENTAL'}
                </div>
                <div className="text-sm font-black text-amber-900 font-mono pt-1">
                  {currentConfig?.part_code || setupForm.part_code || 'S6-L-P014-xx.x'}
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
                          {currentConfig?.cable_dimension || setupForm.cable_dimension || '2X2X0.20SQMM SHD'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{lengthVal}m × ₹{cablePerMeter}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{rawCableCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        Connector 1
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {currentConfig?.connector1_name || setupForm.connector1_name || 'DB9-MALE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">Unit Price</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">₹{c1Cost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">
                        Connector 2
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {currentConfig?.connector2_name || setupForm.connector2_name || 'MICRO MOTOR 7 PIN'}
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
                            {currentConfig?.battery_name || setupForm.battery_name || 'Battery'}
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
                        (C5×C6) + C7 + C8 + C9
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

              {/* Sync Selling Price Button */}
              <button
                onClick={handleSyncPrice}
                disabled={syncing || !selectedProductId}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Sync Selling Price (₹{Math.round(sellingPrice).toLocaleString('en-IN')}) to Product</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Cable Component Setup Form */
        <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#87C0CD]/30 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#113F67] font-display">Configure Servo Cable Components</h2>
              <p className="text-xs text-slate-500">
                Manage raw cable specification costs, connector unit prices, labour, and default profit margins per Servo Cable product.
              </p>
            </div>
          </div>

          <form onSubmit={handleSetupSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Servo Product */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-bold text-[#113F67] mb-2">Target Servo Cable Product *</label>
                <select
                  value={setupForm.product_id}
                  onChange={(e) => {
                    setSetupForm((prev) => ({ ...prev, product_id: e.target.value }));
                    setSelectedProductId(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                  required
                >
                  <option value="">-- Select Product --</option>
                  {servoProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} {p.model_number ? `(${p.model_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Banner Labels */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Frame Size Header</label>
                <input
                  type="text"
                  value={setupForm.frame_size}
                  onChange={(e) => setSetupForm({ ...setupForm, frame_size: e.target.value })}
                  placeholder="e.g. 40/60/80 FRAME SIZE"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Motor Power / Type Header</label>
                <input
                  type="text"
                  value={setupForm.motor_type}
                  onChange={(e) => setSetupForm({ ...setupForm, motor_type: e.target.value })}
                  placeholder="e.g. 100W TO 750W - INCREMENTAL"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Part Code</label>
                <input
                  type="text"
                  value={setupForm.part_code}
                  onChange={(e) => setSetupForm({ ...setupForm, part_code: e.target.value })}
                  placeholder="e.g. S6-L-P014-xx.x"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Cable Spec & Cost */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Cable Dimension Spec</label>
                <input
                  type="text"
                  value={setupForm.cable_dimension}
                  onChange={(e) => setSetupForm({ ...setupForm, cable_dimension: e.target.value })}
                  placeholder="e.g. 2X2X0.20SQMM SHD"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Cable Cost per Meter (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={setupForm.cable_cost_per_meter}
                  onChange={(e) => setSetupForm({ ...setupForm, cable_cost_per_meter: e.target.value })}
                  placeholder="e.g. 90"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Default Length (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={setupForm.default_length}
                  onChange={(e) => setSetupForm({ ...setupForm, default_length: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Connector 1 */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Connector 1 Name</label>
                <input
                  type="text"
                  value={setupForm.connector1_name}
                  onChange={(e) => setSetupForm({ ...setupForm, connector1_name: e.target.value })}
                  placeholder="e.g. DB9-MALE"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Connector 1 Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={setupForm.connector1_cost}
                  onChange={(e) => setSetupForm({ ...setupForm, connector1_cost: e.target.value })}
                  placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Connector 2 */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Connector 2 Name</label>
                <input
                  type="text"
                  value={setupForm.connector2_name}
                  onChange={(e) => setSetupForm({ ...setupForm, connector2_name: e.target.value })}
                  placeholder="e.g. MICRO MOTOR 7 PIN"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Connector 2 Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={setupForm.connector2_cost}
                  onChange={(e) => setSetupForm({ ...setupForm, connector2_cost: e.target.value })}
                  placeholder="e.g. 250"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Labour */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Labour Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={setupForm.labour_cost}
                  onChange={(e) => setSetupForm({ ...setupForm, labour_cost: e.target.value })}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Battery (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Battery Name (Optional)</label>
                <input
                  type="text"
                  value={setupForm.battery_name}
                  onChange={(e) => setSetupForm({ ...setupForm, battery_name: e.target.value })}
                  placeholder="e.g. 3.6V Lithium Battery"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Battery Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={setupForm.battery_cost}
                  onChange={(e) => setSetupForm({ ...setupForm, battery_cost: e.target.value })}
                  placeholder="e.g. 0"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>

              {/* Profit Margin */}
              <div>
                <label className="block text-xs font-bold text-[#113F67] mb-2">Default Profit Margin (%)</label>
                <input
                  type="number"
                  step="1"
                  value={setupForm.margin_percentage}
                  onChange={(e) => setSetupForm({ ...setupForm, margin_percentage: e.target.value })}
                  placeholder="e.g. 35"
                  className="w-full px-3.5 py-2.5 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs font-bold text-[#113F67] focus:outline-none focus:border-[#226597]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#87C0CD]/30">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#226597] hover:bg-[#113F67] text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Cable Component Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
