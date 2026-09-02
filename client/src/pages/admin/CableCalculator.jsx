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
  Image as ImageIcon,
  Copy,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';

// Function to compute canonical base model template (e.g. S6-L-B107-20.0 -> S6-L-B107-xx.x, VW3M8B11Rxx -> VW3M8B11Rxx)
function getBasePartCodeTemplate(partCode) {
  if (!partCode) return '';
  let str = String(partCode).trim();

  // 1. If partCode already contains explicit wildcard ('xx.x', 'xxM', 'xxx', or 'xx'),
  // it is ALREADY the canonical base model template! (e.g. VW3M8B11Rxx, S6-L-B107-xx.x, MR-J3ENSCBLxxM-L)
  if (/xx/i.test(str)) {
    return str;
  }

  // 2. Trailing decimal length like S6-L-B107-20.0 or S6-L-B107-05.0 -> S6-L-B107-xx.x
  if (/-\d{1,2}\.\d+$/.test(str)) {
    return str.replace(/-\d{1,2}\.\d+$/, '-xx.x');
  }

  // 3. Trailing dash like S6-L-B107- -> S6-L-B107-xx.x
  if (str.endsWith('-')) {
    return `${str}xx.x`;
  }

  // 4. Schneider / Lexium / Delta trailing R03, R05, R10, R20, R30 -> Rxx
  if (/R\d{2}$/i.test(str)) {
    return str.replace(/R\d{2}$/i, 'Rxx');
  }

  // 5. Mitsubishi / Panasonic specific infix: CBL<len>M- or -<len>M- or -<len>M$ (e.g. MR-J3ENSCBL5M-L -> MR-J3ENSCBLxxM-L)
  if (/(CBL|-)\d+M(-|$)/i.test(str)) {
    return str.replace(/(CBL|-)\d+M(-|$)/gi, '$1xxM$2');
  }

  // 6. Trailing integer length like CBL-5 -> CBL-xxM
  if (/-\d+$/.test(str)) {
    return str.replace(/-\d+$/, '-xxM');
  }

  return str;
}

// Universal Multi-OEM Part Code Length Formatter
function formatPartCodeWithLength(basePartCode, length) {
  if (!basePartCode) return '';
  const lenNum = Number(length) || 5;
  const decimalSuffix = lenNum < 10 ? `0${lenNum.toFixed(1)}` : `${lenNum.toFixed(1)}`;
  const twoDigitSuffix = lenNum < 10 ? `0${Math.round(lenNum)}` : `${Math.round(lenNum)}`;
  const threeDigitSuffix = lenNum < 10 ? `00${Math.round(lenNum)}` : lenNum < 100 ? `0${Math.round(lenNum)}` : `${Math.round(lenNum)}`;
  const meterSuffix = `${lenNum}M`;

  let result = String(basePartCode).trim();

  // 1. Explicit 'xx.x' wildcard (e.g. S6-L-B107-xx.x -> S6-L-B107-20.0)
  if (/xx\.x/i.test(result)) {
    return result.replace(/xx\.x/gi, decimalSuffix);
  }

  // 2. Explicit 'xxM' wildcard (e.g. MR-J3ENSCBLxxM-L -> MR-J3ENSCBL20M-L)
  if (/xxM/i.test(result)) {
    return result.replace(/xxM/gi, meterSuffix);
  }

  // 3. Explicit 'xxx' wildcard (e.g. CBL-xxx-PWR -> CBL-020-PWR)
  if (/xxx/i.test(result)) {
    return result.replace(/xxx/gi, threeDigitSuffix);
  }

  // 4. Explicit 'xx' wildcard anywhere (e.g. VW3M8B11Rxx -> VW3M8B11R05 / VW3M8B11R20, or CBLxx-PWR)
  if (/xx/i.test(result)) {
    return result.replace(/xx/gi, twoDigitSuffix);
  }

  // 5. Trailing decimal like "-05.0" (e.g. S6-L-B107-05.0 -> S6-L-B107-20.0)
  if (/-\d{1,2}\.\d+$/.test(result)) {
    return result.replace(/-\d{1,2}\.\d+$/, `-${decimalSuffix}`);
  }

  // 6. Trailing R03, R05, R10, R20 (e.g. VW3M8B11R05 -> VW3M8B11R20)
  if (/R\d{2}$/i.test(result)) {
    return result.replace(/R\d{2}$/i, `R${twoDigitSuffix}`);
  }

  // 7. Mitsubishi / Panasonic specific infix: CBL<len>M- or -<len>M- or -<len>M$ (e.g. MR-J3ENSCBL5M-L -> MR-J3ENSCBL20M-L)
  if (/(CBL|-)\d+M(-|$)/i.test(result)) {
    return result.replace(/(CBL|-)\d+M(-|$)/gi, `$1${meterSuffix}$2`);
  }

  // 8. Trailing Dash
  if (result.endsWith('-')) {
    return `${result}${decimalSuffix}`;
  }

  // 9. Trailing integer like "-5" (e.g. CBL-5 -> CBL-20)
  if (/-\d+$/.test(result)) {
    return result.replace(/-\d+$/, `-${lenNum}`);
  }

  return `${result}-${meterSuffix}`;
}

function getVariantLength(variant) {
  if (!variant) return 5;
  if (variant.default_length !== undefined && variant.default_length !== null && !isNaN(Number(variant.default_length))) {
    const dLen = Number(variant.default_length);
    if (dLen > 0) return dLen;
  }
  const pc = String(variant.part_code || '');

  // If part code has explicit wildcard 'xx', default to 5
  if (/xx/i.test(pc)) return 5;

  // Check Schneider / Lexium trailing R03, R05, R10, R20
  const rMatch = pc.match(/R(\d{2})$/i);
  if (rMatch) return Number(rMatch[1]);

  // Check decimal suffix: -05.0, -20.0
  const decMatch = pc.match(/-(\d{1,2})\.\d+$/);
  if (decMatch) return Number(decMatch[1]);

  // Check Mitsubishi / Panasonic specific infix: CBL<len>M- or -<len>M- or -<len>M$
  const mMatch = pc.match(/(?:CBL|-)(\d+)M(?:-|$)/i);
  if (mMatch) return Number(mMatch[1]);

  return 5;
}

export function CableCalculator() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'setup'
  const [servoProducts, setServoProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [configurations, setConfigurations] = useState([]);

  // Active Variant Selection State
  const [activeVariantId, setActiveVariantId] = useState(null); // null means creating a NEW variant
  const [selectedModelKey, setSelectedModelKey] = useState('');

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
  const variantImageInputRef = useRef(null);

  // Custom Downward Variant Dropdown Selector State
  const variantDropdownRef = useRef(null);
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);
  const [variantSearchQuery, setVariantSearchQuery] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (variantDropdownRef.current && !variantDropdownRef.current.contains(event.target)) {
        setVariantDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Smart windowed pagination helper: returns an array with ellipsis (e.g. [1, 2, 3, 4, '...', 28])
  const getPaginationPages = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [paramTab, setParamTab] = useState('specs'); // 'specs' | 'images'

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
    image_urls: [],
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

  // Group into distinct base models (e.g. B107-xx.x and M107-xx.x)
  const distinctModelVariants = [];
  const seenBaseTemplates = new Set();
  productVariants.forEach((v) => {
    const baseTemplate = getBasePartCodeTemplate(v.part_code);
    const groupKey = `${baseTemplate}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();
    if (!seenBaseTemplates.has(groupKey)) {
      seenBaseTemplates.add(groupKey);
      distinctModelVariants.push({
        ...v,
        base_template: baseTemplate,
        model_group_key: groupKey,
      });
    }
  });

  // Available lengths for the active selected base model
  const availableVariantsForModel = productVariants.filter((v) => {
    const t = getBasePartCodeTemplate(v.part_code);
    const key = `${t}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();
    return key === selectedModelKey;
  });
  availableVariantsForModel.sort((a, b) => getVariantLength(a) - getVariantLength(b));

  const resetToNewVariant = (productId = selectedProductId) => {
    setActiveVariantId(null);
    setSelectedModelKey('');
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
      image_urls: [],
    });
  };

  const loadVariantIntoForm = (variant) => {
    setActiveVariantId(variant.id);
    const baseTemplate = getBasePartCodeTemplate(variant.part_code);
    const groupKey = `${baseTemplate}__${variant.motor_type || ''}__${variant.frame_size || ''}`.toLowerCase();
    setSelectedModelKey(groupKey);

    let urls = [];
    if (Array.isArray(variant.image_urls) && variant.image_urls.length > 0) {
      urls = variant.image_urls;
    } else if (variant.image_url) {
      const trimmed = String(variant.image_url).trim();
      if (trimmed.startsWith('[')) {
        try {
          urls = JSON.parse(trimmed);
        } catch (e) {
          urls = [trimmed];
        }
      } else if (trimmed.length > 0) {
        urls = [trimmed];
      }
    }

    // Model-level image fallback: if this specific length has no images, inherit from sibling variant of same model
    if (urls.length === 0) {
      const siblingWithImages = configurations.find((c) => {
        if (String(c.product_id) !== String(variant.product_id)) return false;
        const cBase = getBasePartCodeTemplate(c.part_code);
        const cKey = `${cBase}__${c.motor_type || ''}__${c.frame_size || ''}`.toLowerCase();
        return cKey === groupKey && (
          (Array.isArray(c.image_urls) && c.image_urls.length > 0) ||
          (c.image_url && String(c.image_url).trim().length > 0)
        );
      });
      if (siblingWithImages) {
        if (Array.isArray(siblingWithImages.image_urls) && siblingWithImages.image_urls.length > 0) {
          urls = siblingWithImages.image_urls;
        } else if (siblingWithImages.image_url) {
          try {
            const parsed = JSON.parse(siblingWithImages.image_url);
            urls = Array.isArray(parsed) ? parsed : [siblingWithImages.image_url];
          } catch (e) {
            urls = [siblingWithImages.image_url];
          }
        }
      }
    }

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
      image_urls: urls,
    });
  };

  const handleSelectModel = (modelKey) => {
    setSelectedModelKey(modelKey);
    if (!modelKey) {
      resetToNewVariant(selectedProductId);
      return;
    }
    const matching = productVariants.filter((v) => {
      const t = getBasePartCodeTemplate(v.part_code);
      const key = `${t}__${v.motor_type || ''}__${v.frame_size || ''}`.toLowerCase();
      return key === modelKey;
    });
    if (matching.length > 0) {
      const match = matching.find((v) => getVariantLength(v) === 5) || matching[0];
      loadVariantIntoForm(match);
    }
  };

  const handleAddDifferentLength = () => {
    if (!params.part_code) return;
    const currentBase = getBasePartCodeTemplate(params.part_code);
    const existingLens = availableVariantsForModel.map((v) => getVariantLength(v));
    const candidateLens = [1, 2, 3, 5, 8, 10, 15, 18, 20, 25, 30];
    const nextLen = candidateLens.find((l) => !existingLens.includes(l)) || (Math.max(...existingLens, 5) + 5);

    const newPartCode = formatPartCodeWithLength(params.part_code, nextLen);
    setActiveVariantId(null);
    setParams((prev) => ({
      ...prev,
      id: null,
      default_length: nextLen,
      part_code: newPartCode,
    }));
    setFeedback({
      type: 'success',
      message: `Cloned specifications from ${currentBase}. Set length to ${nextLen}m (${newPartCode}). Review details and click "Save Variant Setup" below to insert.`,
    });
  };

  const handleAddNewModel = () => {
    setSelectedModelKey('');
    resetToNewVariant(selectedProductId);
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

  // Multiple Image File & Clipboard Paste Handler
  const appendImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setParams((prev) => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), e.target.result],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleVariantImagePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            appendImageFile(file);
            e.preventDefault();
            return;
          }
        }
      }
    }
    const pastedText = e.clipboardData?.getData('text');
    if (pastedText && (pastedText.startsWith('http') || pastedText.startsWith('data:image'))) {
      setParams((prev) => ({
        ...prev,
        image_urls: [...(prev.image_urls || []), pastedText.trim()],
      }));
    }
  };

  const handleRemoveVariantImage = (indexToRemove) => {
    setParams((prev) => ({
      ...prev,
      image_urls: (prev.image_urls || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Single-Click Save Handler (Keeps Default Catalog Price Independent!)
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
      image_urls: params.image_urls || [],
    };

    try {
      const saveRes = await api.post('/cable-costs', payload);
      if (saveRes.success) {
        const savedPrice = Math.round(sellingPrice);

        setFeedback({
          type: 'success',
          message: `Saved Part Code setup "${params.part_code}" with Variant Selling Price ₹${savedPrice.toLocaleString('en-IN')}!`,
        });

        await loadData();
        if (saveRes.data && saveRes.data.id) {
          setActiveVariantId(saveRes.data.id);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save cable cost setup.' });
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

  const [exportingExcel, setExportingExcel] = useState(false);

  // Filter-Aware Visual Excel Export Handler (Embeds Real Images into Cells!)
  const handleExportToExcel = async () => {
    if (!filteredConfigurations || filteredConfigurations.length === 0) {
      setFeedback({ type: 'error', message: 'No cable records available to export.' });
      return;
    }

    setExportingExcel(true);
    setFeedback(null);

    try {
      const response = await api.post(
        '/cable-costs/export-excel',
        { configurations: filteredConfigurations },
        { responseType: 'blob' }
      );

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let filename = 'servo_cables_export.xlsx';
      if (filterProductName !== 'ALL' && filterPartCode !== 'ALL') {
        filename = `servo_cables_${filterProductName.replace(/\s+/g, '_')}_${filterPartCode.replace(/\s+/g, '_')}.xlsx`;
      } else if (filterProductName !== 'ALL') {
        filename = `servo_cables_${filterProductName.replace(/\s+/g, '_')}.xlsx`;
      } else if (filterPartCode !== 'ALL') {
        filename = `servo_cables_${filterPartCode.replace(/\s+/g, '_')}.xlsx`;
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: `Successfully exported ${filteredConfigurations.length} cable variant setup(s) with embedded visual images to "${filename}".`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to export visual Excel spreadsheet.' });
    } finally {
      setExportingExcel(false);
    }
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
    <div className="space-y-4 font-sans w-full max-w-full px-1 sm:px-2">
      {/* Hidden File Input for Excel Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileSelectForImport}
        className="hidden"
      />

      {/* Hidden File Input for Multiple Variant Images Upload */}
      <input
        ref={variantImageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            Array.from(e.target.files).forEach(appendImageFile);
            e.target.value = '';
          }
        }}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#E4F1F5] dark:bg-[#0f1b36] text-[#226597] dark:text-[#38bdf8] shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#113F67] dark:text-slate-100 font-display">Servo Cable Cost & Price Calculator</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manage Part Code variants, live assembly specs, hardware connectors, and profit margins.
            </p>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex items-center space-x-1.5 bg-[#F3F9FB] dark:bg-[#0f1b36] p-1 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554] shrink-0">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'calculator' ? 'bg-[#226597] text-white shadow-sm' : 'text-slate-600 hover:text-[#113F67]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'setup' ? 'bg-[#226597] text-white shadow-sm' : 'text-slate-600 hover:text-[#113F67]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
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
          <div className="lg:col-span-6 space-y-6 min-w-0">
            {/* Product & Variant Selector Box */}
            <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl p-4 space-y-3 shadow-sm min-w-0">
              <div className="flex items-center justify-between border-b border-[#87C0CD]/20 dark:border-[#233554] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#226597] dark:text-[#38bdf8]" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#113F67] dark:text-slate-100">1. Target Product & Model</h2>
                </div>
                {currentProduct && (
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Default Price: <span className="font-extrabold text-[#226597] dark:text-[#38bdf8]">{currentProduct.current_price ? `₹${Number(currentProduct.current_price).toLocaleString('en-IN')}` : 'Not set'}</span>
                  </div>
                )}
              </div>

              {/* Product and Model Selectors Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                {/* Product Selector */}
                <div className="flex flex-col">
                  <div className="h-5 flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#113F67] dark:text-slate-300">Target Servo Cable Product *</label>
                  </div>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      const prodId = e.target.value;
                      setSelectedProductId(prodId);
                      setSelectedModelKey('');
                      setActiveVariantId(null);
                      const matchingConfigs = configurations.filter((c) => String(c.product_id) === String(prodId));
                      if (matchingConfigs.length > 0) {
                        loadVariantIntoForm(matchingConfigs[0]);
                      } else {
                        resetToNewVariant(prodId);
                      }
                    }}
                    className="w-full h-10 px-3 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/40 dark:border-[#233554] rounded-xl text-xs text-[#113F67] dark:text-slate-200 font-bold focus:outline-none focus:border-[#226597] truncate shadow-xs"
                  >
                    {servoProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name} {p.model_number ? `(${p.model_number})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Selector */}
                <div className="flex flex-col">
                  <div className="h-5 flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#113F67] dark:text-slate-300">
                      Part Code Model ({distinctModelVariants.length})
                    </label>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      {activeVariantId && (
                        <>
                          <button
                            type="button"
                            onClick={handleAddDifferentLength}
                            className="text-[#226597] dark:text-[#38bdf8] hover:underline font-bold"
                            title="Clone specs for new length"
                          >
                            + Add Length
                          </button>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleAddNewModel}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                        title="Create new model"
                      >
                        + New Model
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 min-w-0 w-full">
                    <div className="relative flex-1 min-w-0" ref={variantDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setVariantDropdownOpen(!variantDropdownOpen)}
                        title={(() => {
                          const selectedModelItem = distinctModelVariants.find(
                            (m) => m.model_group_key === selectedModelKey
                          );
                          return selectedModelItem ? `${selectedModelItem.base_template} (${selectedModelItem.motor_type || ''})` : '';
                        })()}
                        className="w-full h-10 px-3 bg-[#F3F9FB] dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-xl text-xs font-bold text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] shadow-xs flex items-center justify-between transition cursor-pointer text-left min-w-0 overflow-hidden"
                      >
                        <div className="truncate pr-1.5 min-w-0 flex-1">
                          {(() => {
                            const selectedModelItem = distinctModelVariants.find(
                              (m) => m.model_group_key === selectedModelKey
                            );
                            if (selectedModelItem) {
                              return (
                                <span className="truncate block min-w-0">
                                  <span className="font-mono text-[#226597] dark:text-[#38bdf8] font-extrabold">
                                    {selectedModelItem.base_template}
                                  </span>
                                  {selectedModelItem.motor_type && (
                                    <span className="text-[#113F67] dark:text-slate-300 font-semibold ml-1 opacity-80 text-[10px]">
                                      ({selectedModelItem.motor_type})
                                    </span>
                                  )}
                                </span>
                              );
                            }
                            return (
                              <span className="text-slate-500 font-medium truncate block min-w-0 text-[11px]">
                                -- Select / Create Model --
                              </span>
                            );
                          })()}
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-slate-400 transform transition-transform shrink-0 ${
                            variantDropdownOpen ? '-rotate-90' : 'rotate-90'
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {variantDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-xl shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                          {distinctModelVariants.length > 5 && (
                            <div className="p-2 border-b border-[#87C0CD]/30 dark:border-[#233554] bg-[#F3F9FB] dark:bg-[#0f1b36]">
                              <input
                                type="text"
                                placeholder="Search Part Code Model or Motor Spec..."
                                value={variantSearchQuery}
                                onChange={(e) => setVariantSearchQuery(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#226597]"
                                autoFocus
                              />
                            </div>
                          )}

                          <div className="max-h-60 overflow-y-auto divide-y divide-[#87C0CD]/10 dark:divide-[#233554]/50 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleAddNewModel();
                                setVariantDropdownOpen(false);
                                setVariantSearchQuery('');
                              }}
                              className={`w-full px-3.5 py-2.5 text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                !activeVariantId && !selectedModelKey
                                  ? 'bg-[#226597] text-white'
                                  : 'text-[#113F67] dark:text-slate-200 hover:bg-[#F3F9FB] dark:hover:bg-[#1e2e4a]'
                              }`}
                            >
                              <div className="flex items-center space-x-1.5">
                                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                <span>+ Create Brand New Part Code Model</span>
                              </div>
                            </button>

                            {(() => {
                              const filteredModels = distinctModelVariants.filter((m) => {
                                if (!variantSearchQuery.trim()) return true;
                                const q = variantSearchQuery.toLowerCase();
                                return (
                                  (m.base_template && m.base_template.toLowerCase().includes(q)) ||
                                  (m.part_code && m.part_code.toLowerCase().includes(q)) ||
                                  (m.motor_type && m.motor_type.toLowerCase().includes(q)) ||
                                  (m.frame_size && m.frame_size.toLowerCase().includes(q))
                                );
                              });

                              if (filteredModels.length === 0) {
                                return (
                                  <div className="p-3 text-center text-xs text-slate-400 italic">
                                    No models match search query.
                                  </div>
                                );
                              }

                              return filteredModels.map((m) => {
                                const isSelected = m.model_group_key === selectedModelKey;
                                return (
                                  <button
                                    key={m.model_group_key}
                                    type="button"
                                    onClick={() => {
                                      handleSelectModel(m.model_group_key);
                                      setVariantDropdownOpen(false);
                                      setVariantSearchQuery('');
                                    }}
                                    className={`w-full px-3.5 py-2.5 text-left text-xs transition flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#E4F1F5] dark:bg-[#1e2e4a] text-[#226597] dark:text-[#38bdf8] font-extrabold border-l-4 border-[#226597]'
                                        : 'text-[#113F67] dark:text-slate-200 hover:bg-[#F3F9FB] dark:hover:bg-[#111c33] font-semibold'
                                    }`}
                                  >
                                    <div className="flex flex-col space-y-0.5 min-w-0 pr-2">
                                      <span className="font-mono text-xs font-bold text-[#113F67] dark:text-slate-100 truncate">
                                        {m.base_template}
                                      </span>
                                      {m.motor_type && (
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                          {m.motor_type} {m.frame_size ? `(${m.frame_size})` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {activeVariantId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(activeVariantId)}
                        className="h-10 px-3 text-xs font-bold bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-xl transition flex items-center cursor-pointer shrink-0 shadow-xs"
                        title="Delete active length setup"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Saved Lengths for this Model Strip */}
              {selectedModelKey && (
                <div className="p-2.5 bg-[#E4F1F5]/40 dark:bg-[#152238]/60 border border-[#87C0CD]/30 dark:border-[#233554] rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                    <span className="text-[10px] font-extrabold text-[#113F67] dark:text-slate-200 uppercase tracking-wider mr-1">
                      Saved Lengths ({availableVariantsForModel.length}):
                    </span>
                    {availableVariantsForModel.map((v) => {
                      const vLen = getVariantLength(v);
                      const isSelected = String(v.id) === String(activeVariantId);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => loadVariantIntoForm(v)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center space-x-1 ${
                            isSelected
                              ? 'bg-[#226597] text-white border-[#226597] shadow-xs scale-105'
                              : 'bg-white dark:bg-[#1e2e4a] text-[#113F67] dark:text-slate-200 border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                          }`}
                        >
                          <span>{vLen}m</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-sky-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            ₹{Number(v.selling_price || 0).toLocaleString('en-IN')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDifferentLength}
                    className="px-2 py-1 bg-white dark:bg-[#1e2e4a] border border-dashed border-[#226597] text-[#226597] dark:text-[#38bdf8] text-[11px] font-bold rounded-lg hover:bg-[#E4F1F5] transition flex items-center space-x-1 cursor-pointer shrink-0"
                    title="Add a new length variant with same specs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Length</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Component Parameters Panel */}
            <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl p-4 space-y-3.5 shadow-sm min-w-0">
              <div className="flex flex-wrap items-center justify-between border-b border-[#87C0CD]/20 dark:border-[#233554] pb-2.5 gap-2">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#226597] dark:text-[#38bdf8]" />
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#113F67] dark:text-slate-100">
                    2. Live Parameters
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                    {activeVariantId ? `#${activeVariantId}` : 'New'}
                  </span>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center space-x-1 bg-[#F3F9FB] dark:bg-[#0f1b36] p-1 rounded-lg border border-[#87C0CD]/30 dark:border-[#233554]">
                  <button
                    type="button"
                    onClick={() => setParamTab('specs')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      paramTab === 'specs' ? 'bg-[#226597] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-[#113F67] dark:hover:text-slate-200'
                    }`}
                  >
                    Specs & Costs
                  </button>
                  <button
                    type="button"
                    onClick={() => setParamTab('images')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer ${
                      paramTab === 'images' ? 'bg-[#226597] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-[#113F67] dark:hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Images ({params.image_urls ? params.image_urls.length : 0})</span>
                  </button>
                </div>

                {/* Header Quick Save Button */}
                <button
                  type="button"
                  onClick={handleSaveVariantAndSync}
                  disabled={saving || !selectedProductId}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  title="Save active setup"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Setup (₹{Math.round(sellingPrice).toLocaleString('en-IN')})</span>
                </button>
              </div>

              {paramTab === 'specs' ? (
                <div className="space-y-3">
                  {/* Row 1: Header Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Part Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. S6-L-P014-xx.x"
                        value={params.part_code}
                        onChange={(e) => setParams({ ...params, part_code: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Frame Size Header</label>
                      <input
                        type="text"
                        placeholder="e.g. 40/60/80 FRAME SIZE"
                        value={params.frame_size}
                        onChange={(e) => setParams({ ...params, frame_size: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-semibold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Power / Motor Type Header</label>
                      <input
                        type="text"
                        placeholder="e.g. 100W TO 750W - INCREMENTAL"
                        value={params.motor_type}
                        onChange={(e) => setParams({ ...params, motor_type: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-semibold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Row 2: Raw Cable & Length */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Cable Dimension Spec</label>
                      <input
                        type="text"
                        placeholder="e.g. 2X2X0.20SQMM SHD"
                        value={params.cable_dimension}
                        onChange={(e) => setParams({ ...params, cable_dimension: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-semibold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Cable Cost / Meter (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 90"
                        value={params.cable_cost_per_meter}
                        onChange={(e) => setParams({ ...params, cable_cost_per_meter: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase">Length (m)</label>
                        <span className="text-[11px] font-extrabold text-[#226597] dark:text-[#38bdf8]">{params.default_length}m</span>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        placeholder="e.g. 5"
                        value={params.default_length}
                        onChange={(e) => {
                          const lenVal = parseFloat(e.target.value) || 1;
                          let updatedPartCode = params.part_code;
                          if (!activeVariantId && params.part_code) {
                            updatedPartCode = formatPartCodeWithLength(params.part_code, lenVal);
                          }
                          setParams((prev) => ({
                            ...prev,
                            default_length: lenVal,
                            part_code: updatedPartCode,
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Row 3: Connectors & Hardware */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Connector 1 Name</label>
                      <input
                        type="text"
                        placeholder="e.g. DB9-MALE"
                        value={params.connector1_name}
                        onChange={(e) => setParams({ ...params, connector1_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-semibold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Conn 1 Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 50"
                        value={params.connector1_cost}
                        onChange={(e) => setParams({ ...params, connector1_cost: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Connector 2 Name</label>
                      <input
                        type="text"
                        placeholder="e.g. 7 PIN MICRO"
                        value={params.connector2_name}
                        onChange={(e) => setParams({ ...params, connector2_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-semibold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Conn 2 Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 250"
                        value={params.connector2_cost}
                        onChange={(e) => setParams({ ...params, connector2_cost: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Row 4: Assembly & Margin */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Labour Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 150"
                        value={params.labour_cost}
                        onChange={(e) => setParams({ ...params, labour_cost: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase mb-0.5">Battery Cost (₹ Opt.)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 0"
                        value={params.battery_cost}
                        onChange={(e) => setParams({ ...params, battery_cost: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[10px] font-bold text-[#113F67] dark:text-slate-300 uppercase">Margin (%)</label>
                        <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">{params.margin_percentage}%</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="1"
                        placeholder="e.g. 35"
                        value={params.margin_percentage}
                        onChange={(e) => setParams({ ...params, margin_percentage: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Additional Components */}
                  <div className="bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#113F67] dark:text-slate-200">
                        Additional Components ({Array.isArray(params.additional_components) ? params.additional_components.length : 0})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddExtraComponent}
                        className="px-2 py-1 bg-[#226597] hover:bg-[#113F67] text-white text-[10px] font-bold rounded-md transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Component</span>
                      </button>
                    </div>

                    {Array.isArray(params.additional_components) && params.additional_components.length > 0 && (
                      <div className="space-y-1.5">
                        {params.additional_components.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white dark:bg-[#152238] p-1.5 rounded-lg border border-[#87C0CD]/40 dark:border-[#233554]">
                            <input
                              type="text"
                              placeholder={`e.g. Connector ${idx + 3} / Terminal`}
                              value={item.name}
                              onChange={(e) => handleUpdateExtraComponent(idx, 'name', e.target.value)}
                              className="flex-1 px-2 py-1 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/30 dark:border-[#233554] rounded text-xs font-semibold text-[#113F67] dark:text-slate-200"
                            />
                            <div className="w-24 flex items-center">
                              <span className="text-xs font-bold text-slate-500 mr-1">₹</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={item.cost}
                                onChange={(e) => handleUpdateExtraComponent(idx, 'cost', e.target.value)}
                                className="w-full px-2 py-1 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/30 dark:border-[#233554] rounded text-xs font-bold text-[#113F67] dark:text-slate-200"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExtraComponent(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Remove component"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Tab 2: Images & Diagrams Gallery */
                <div className="space-y-3 bg-[#F3F9FB]/60 dark:bg-[#0f1b36]/80 p-3.5 rounded-xl border border-[#87C0CD]/30 dark:border-[#233554]">
                  <div
                    onPaste={handleVariantImagePaste}
                    tabIndex={0}
                    onClick={() => variantImageInputRef.current?.click()}
                    className="border-2 border-dashed border-[#87C0CD]/50 dark:border-[#233554] hover:border-[#226597] rounded-xl p-3 bg-white dark:bg-[#152238] transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[#E4F1F5] dark:bg-[#0f1b36] text-[#226597] dark:text-[#38bdf8]">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#113F67] dark:text-slate-200">
                          Click to upload or <span className="text-emerald-600 dark:text-emerald-400 underline">paste images (Ctrl+V)</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Photos map to this Part Code model across all lengths.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-[#226597] text-white text-[10px] font-bold rounded-md">
                      Browse Files
                    </span>
                  </div>

                  {/* Previews */}
                  {Array.isArray(params.image_urls) && params.image_urls.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          Uploaded Gallery ({params.image_urls.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setParams({ ...params, image_urls: [] })}
                          className="text-[10px] text-rose-600 hover:underline font-bold"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {params.image_urls.map((imgUrl, idx) => (
                          <div key={idx} className="relative group w-full h-16 bg-white rounded-lg border border-[#87C0CD]/30 p-1 shadow-2xs overflow-hidden">
                            <img src={imgUrl} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => handleRemoveVariantImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-80 group-hover:opacity-100 hover:bg-rose-700 transition shadow-xs"
                              title="Delete image"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1 py-0.2 bg-[#113F67] text-white text-[7px] font-extrabold rounded uppercase">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-4">No images uploaded for this model yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Excel Sheet Breakdown Card */}
          <div className="lg:col-span-6 min-w-0">
            <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl p-4 space-y-3.5 shadow-md sticky top-6 min-w-0">
              <div className="flex items-center justify-between border-b border-[#87C0CD]/30 dark:border-[#233554] pb-2.5">
                <h2 className="text-sm font-extrabold text-[#113F67] dark:text-slate-100 font-display flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Cost Calculation Breakdown</span>
                </h2>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#226597] dark:text-[#38bdf8] bg-[#E4F1F5] dark:bg-[#0f1b36] px-2.5 py-0.5 rounded-full border border-[#87C0CD]/40 dark:border-[#233554]">
                  Formula Engine
                </span>
              </div>

              {/* Banner Header Table */}
              <div className="bg-[#FFF8E7] dark:bg-[#2a1e0c] border border-amber-300 dark:border-amber-700/60 rounded-xl p-2.5 text-center space-y-0.5 min-w-0 overflow-hidden">
                <div className="text-[11px] font-black tracking-wide text-amber-950 dark:text-amber-200 uppercase break-words break-all leading-tight">
                  {params.frame_size || 'FRAME SIZE (SPECIFY)'}
                </div>
                <div className="text-[11px] font-black tracking-wide text-amber-950 dark:text-amber-200 uppercase break-words break-all leading-tight">
                  {params.motor_type || 'POWER / MOTOR TYPE (SPECIFY)'}
                </div>
                <div className="text-xs font-black text-amber-900 dark:text-amber-300 font-mono pt-0.5 break-words break-all leading-tight">
                  {params.part_code || 'PART CODE (SPECIFY)'}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#87C0CD]/30 dark:border-[#233554] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F3F9FB] dark:bg-[#111c33] uppercase text-[9px] font-extrabold text-[#113F67] dark:text-[#38bdf8] border-b border-[#87C0CD]/30 dark:border-[#233554]">
                    <tr>
                      <th className="px-3 py-2">Component / Specification</th>
                      <th className="px-3 py-2 text-right">Details</th>
                      <th className="px-3 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#87C0CD]/20 dark:divide-[#233554] text-[#113F67]">
                    <tr>
                      <td className="px-3 py-1.5 font-extrabold bg-[#E4F1F5] dark:bg-[#111c33] text-[#226597] dark:text-[#38bdf8]">LENGTH</td>
                      <td className="px-3 py-1.5 text-right font-extrabold text-[#226597]">{lengthVal} meters</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{cablePerMeter}/m</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-semibold">
                        Dimensions
                        <span className="block text-[9px] text-slate-500 font-normal">
                          {params.cable_dimension || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-500">{lengthVal}m × ₹{cablePerMeter}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{rawCableCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-semibold">
                        Connector 1
                        <span className="block text-[9px] text-slate-500 font-normal">
                          {params.connector1_name || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-500">Unit Price</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{c1Cost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-semibold">
                        Connector 2
                        <span className="block text-[9px] text-slate-500 font-normal">
                          {params.connector2_name || 'Not specified'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-500">Unit Price</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{c2Cost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-semibold">Labour Cost</td>
                      <td className="px-3 py-1.5 text-right text-slate-500">Assembly</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold">₹{labourCost.toLocaleString('en-IN')}</td>
                    </tr>
                    {batteryCost > 0 && (
                      <tr>
                        <td className="px-3 py-1.5 font-semibold">
                          Battery
                          <span className="block text-[9px] text-slate-500 font-normal">
                            {params.battery_name || 'Battery'}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right text-slate-500">Unit Price</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">₹{batteryCost.toLocaleString('en-IN')}</td>
                      </tr>
                    )}

                    {/* Landing Cost Row (C10) */}
                    <tr className="bg-sky-50 dark:bg-[#0f1b36] font-extrabold border-t-2 border-[#87C0CD]/50 dark:border-[#233554]">
                      <td className="px-3 py-2 text-[#113F67] dark:text-[#38bdf8] uppercase tracking-wider text-[11px]">LANDING COST (C10)</td>
                      <td className="px-3 py-2 text-right text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                        Sum of Components
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-[#113F67] dark:text-slate-100">
                        ₹{landingCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {/* Profit Margin % Row (C11 & C12) */}
                    <tr>
                      <td className="px-3 py-1.5 font-semibold dark:text-slate-200">PROFIT MARGIN % (C11)</td>
                      <td className="px-3 py-1.5 text-right font-bold text-emerald-700 dark:text-emerald-400">{marginPct}%</td>
                      <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        + ₹{profitMarginCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {/* Final Selling Price Row (C13) */}
                    <tr className="bg-[#113F67] dark:bg-[#0b1b38] text-white font-extrabold">
                      <td className="px-3 py-2.5 uppercase tracking-wider text-[11px]">CALCULATED SELLING PRICE</td>
                      <td className="px-3 py-2.5 text-right text-[9px] text-slate-300 font-normal">
                        Landing + Margin
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-base text-emerald-400">
                        ₹{Math.round(sellingPrice).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Single-Click Save Button */}
              <button
                onClick={handleSaveVariantAndSync}
                disabled={saving || !selectedProductId}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Variant Setup (₹{Math.round(sellingPrice).toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Setup Overview Data Table & Controls Header Bar */
        <div className="bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] rounded-2xl px-2.5 py-3.5 sm:px-3.5 sm:py-4 space-y-3.5 shadow-sm w-full">
          <div className="flex items-center justify-between gap-2 border-b border-[#87C0CD]/30 dark:border-[#233554] pb-3">
            <h2 className="text-sm font-extrabold text-[#113F67] dark:text-slate-100 font-display whitespace-nowrap shrink-0">
              Part Code Variant
            </h2>

            {/* Data Table Filters & Excel Data Actions Bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Product Name Filter Dropdown */}
              <div className="flex items-center space-x-1 shrink-0">
                <Filter className="w-3 h-3 text-[#226597] dark:text-[#38bdf8] shrink-0" />
                <select
                  value={filterProductName}
                  onChange={(e) => {
                    setFilterProductName(e.target.value);
                    setFilterPartCode('ALL'); // Reset part code filter when product changes
                  }}
                  className="px-2 py-1 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-[11px] font-bold text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] shrink-0"
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
              <div className="flex items-center space-x-1 shrink-0">
                <Tag className="w-3 h-3 text-[#226597] dark:text-[#38bdf8] shrink-0" />
                <select
                  value={filterPartCode}
                  onChange={(e) => setFilterPartCode(e.target.value)}
                  className="px-2 py-1 bg-[#F3F9FB] dark:bg-[#0f1b36] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-[11px] font-bold text-[#113F67] dark:text-slate-200 focus:outline-none focus:border-[#226597] shrink-0"
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
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <X className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* Vertical Separator */}
              <div className="h-4 w-px bg-[#87C0CD]/40 dark:bg-[#233554] mx-0.5 shrink-0"></div>

              {/* 1. Download Sample Excel Template */}
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="px-2.5 py-1 bg-[#E4F1F5] dark:bg-[#0f1b36] hover:bg-[#87C0CD]/30 text-[#113F67] dark:text-[#38bdf8] border border-[#87C0CD]/40 dark:border-[#233554] text-[11px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Download pre-formatted sample Excel import template"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Sample Excel</span>
              </button>

              {/* 2. Import Excel File */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importingFile}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Upload Excel file to batch import cable prices"
              >
                {importingFile ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <UploadCloud className="w-3 h-3" />
                )}
                <span>Import Excel</span>
              </button>

              {/* 3. Export Excel File */}
              <button
                type="button"
                onClick={handleExportToExcel}
                disabled={exportingExcel}
                className="px-2.5 py-1 bg-[#226597] hover:bg-[#113F67] disabled:opacity-50 text-white text-[11px] font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title={`Export ${filteredConfigurations.length} ${filterProductName !== 'ALL' || filterPartCode !== 'ALL' ? 'filtered' : 'all'} record(s) to Excel with embedded visual images`}
              >
                {exportingExcel ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Export ({filteredConfigurations.length})</span>
              </button>

              {/* 4. Toggle Excel Field Requirements Guide */}
              <button
                type="button"
                onClick={() => setShowImportGuide(!showImportGuide)}
                className={`p-1 rounded-lg border text-xs font-bold transition flex items-center justify-center cursor-pointer shrink-0 ${
                  showImportGuide
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-[#F3F9FB] dark:bg-[#0b1329] text-[#226597] dark:text-[#38bdf8] border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#E4F1F5]'
                }`}
                title="Toggle Excel import field requirements guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
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
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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

                {/* 3. Image Instructions Guide Card */}
                <div className="p-3.5 bg-white dark:bg-[#152238] border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-2 md:col-span-2">
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center space-x-1.5 text-xs">
                    <ImageIcon className="w-4 h-4" />
                    <span>HOW TO ATTACH VARIANT IMAGES IN EXCEL (2 EASY METHODS)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300">
                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-800/40 space-y-1">
                      <span className="font-bold text-[#113F67] dark:text-[#f8fafc] block text-xs">Method 1: Paste Picture Files Directly into Rows</span>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        In Microsoft Excel or Google Sheets, simply <strong className="text-[#226597] dark:text-[#38bdf8]">Insert / Paste picture files</strong> directly into the table row of that Part Code. The import engine automatically extracts, optimizes, and links them to the variant!
                      </p>
                    </div>
                    <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-lg border border-sky-200/60 dark:border-sky-800/40 space-y-1">
                      <span className="font-bold text-[#113F67] dark:text-[#f8fafc] block text-xs">Method 2: Use the "images" Column for URLs</span>
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        Add direct image URLs in the <code className="font-mono text-[#226597] dark:text-[#38bdf8] font-bold">images</code> column. For multiple photos for one variant, separate links with a comma (e.g. <code className="font-mono text-[10px]">url1.jpg, url2.jpg</code>).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            <table className="w-full table-fixed text-left text-xs text-[#113F67] dark:text-slate-200">
              <colgroup>
                <col className="w-[17%]" />
                <col className="w-[16%]" />
                <col className="w-[24%]" />
                <col className="w-[21%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead className="bg-[#F3F9FB] dark:bg-[#0f1b36] uppercase text-[9px] sm:text-[10px] tracking-wider font-extrabold text-[#113F67] dark:text-[#38bdf8] border-b border-[#87C0CD]/30 dark:border-[#233554]">
                <tr>
                  <th className="px-3 py-2.5">Product Name</th>
                  <th className="px-3 py-2.5">Partcode</th>
                  <th className="px-3 py-2.5">Motor Spec</th>
                  <th className="px-3 py-2.5">Cable Spec</th>
                  <th className="px-2 py-2.5 text-right whitespace-nowrap">Landing Price</th>
                  <th className="px-2 pr-5 py-2.5 text-right whitespace-nowrap">Final Price</th>
                  <th className="pl-4 pr-3 py-2.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87C0CD]/20 dark:divide-[#233554]">
                {paginatedConfigurations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
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
                      <tr key={c.id} className="hover:bg-[#F3F9FB]/60 dark:hover:bg-[#0f1b36]/60 transition">
                        <td className="px-3 py-2 align-middle">
                          <span className="font-bold text-[#113F67] dark:text-slate-100 block text-[11px] leading-snug break-words">
                            {c.product_name}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <span className="px-1.5 py-0.5 bg-[#E4F1F5] dark:bg-[#0f1b36] rounded border border-[#87C0CD]/40 dark:border-[#233554] font-mono text-[10px] font-bold text-[#226597] dark:text-[#38bdf8] inline-block break-all tracking-tight">
                            {c.part_code || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <span className="block text-[11px] font-medium text-[#113F67] dark:text-slate-200 leading-snug break-words">
                            {c.motor_type || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <span className="block font-medium text-[#113F67] dark:text-slate-200 text-[11px] leading-snug break-words">
                            {c.cable_dimension || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-2 align-middle text-right font-bold font-mono text-[#113F67] dark:text-white whitespace-nowrap text-[11px]">
                          {landingVal > 0 ? `₹${landingVal.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-2 pr-5 py-2 align-middle text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-xs">
                          {c.selling_price ? `₹${Number(c.selling_price).toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="pl-4 pr-3 py-2 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedProductId(String(c.product_id));
                                loadVariantIntoForm(c);
                                setActiveTab('calculator');
                              }}
                              className="p-1.5 bg-[#226597] hover:bg-[#113F67] text-white rounded-lg transition cursor-pointer shadow-xs inline-flex items-center justify-center shrink-0"
                              title="Edit in Calculator"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(c.id)}
                              className="p-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition cursor-pointer shadow-xs inline-flex items-center justify-center shrink-0"
                              title="Delete variant setup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-[#87C0CD]/30 dark:border-[#233554] text-xs">
              {/* Entry Counter Summary & Rows Per Page */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                  Showing <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{startIndex + 1}</span> to{' '}
                  <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{endIndex}</span> of{' '}
                  <span className="font-extrabold text-[#113F67] dark:text-[#f8fafc]">{totalItems}</span> entries
                  {totalItems < configurations.length && (
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      (Filtered from {configurations.length})
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-[#F3F9FB] dark:bg-[#0b1329] border border-[#87C0CD]/40 dark:border-[#233554] rounded-lg text-xs font-bold text-[#113F67] dark:text-[#f8fafc] focus:outline-none focus:border-[#226597]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Windowed Page Navigation Buttons */}
              <div className="flex items-center space-x-1 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#87C0CD]/40 dark:border-[#233554] bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947] transition cursor-pointer shrink-0"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPaginationPages(currentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="w-7 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 font-bold shrink-0">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer shrink-0 ${
                        currentPage === p
                          ? 'bg-[#226597] text-white shadow-xs'
                          : 'bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] border border-[#87C0CD]/40 dark:border-[#233554] hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#87C0CD]/40 dark:border-[#233554] bg-white dark:bg-[#0f1b36] text-[#113F67] dark:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F3F9FB] dark:hover:bg-[#1a2947] transition cursor-pointer shrink-0"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                        <th className="px-3 py-2 text-center">Images</th>
                        <th className="px-3 py-2 text-right">Landing Cost Diff</th>
                        <th className="px-3 py-2 text-right">Final Selling Price Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#87C0CD]/20 dark:divide-[#233554]">
                      {analysisResult.toUpdate.map((u, idx) => (
                        <tr key={idx} className="hover:bg-[#F3F9FB]/60 dark:hover:bg-[#1e2e4a]">
                          <td className="px-3 py-2 font-mono font-bold text-[#226597] dark:text-[#38bdf8]">{u.part_code}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">{u.product_name}</td>
                          <td className="px-3 py-2 text-center">
                            {u.image_count > 0 ? (
                              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-md font-bold text-[10px]">
                                📷 {u.image_count}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">—</span>
                            )}
                          </td>
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
