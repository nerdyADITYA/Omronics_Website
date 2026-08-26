import React, { useState } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Star, Loader2, Clipboard } from 'lucide-react';
import api from '../../services/api';

export function MultiMediaUploader({ value = [], onChange, folder = 'products', label = 'Product Gallery Images' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Normalize value array into objects: [{ image_url, alt_text, display_order }]
  const images = (Array.isArray(value) ? value : []).map((img, index) => {
    if (typeof img === 'string') {
      return { image_url: img, alt_text: '', display_order: index };
    }
    return { ...img, display_order: img.display_order ?? index };
  });

  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', folder);

      const res = await api.post('/uploads/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && Array.isArray(res.data)) {
        const newUploadedImages = res.data.map((item, idx) => ({
          image_url: item.url,
          alt_text: item.filename || '',
          display_order: images.length + idx,
        }));
        const updatedList = [...images, ...newUploadedImages];
        onChange(updatedList);
      } else {
        setError(res.message || 'Failed to upload images.');
      }
    } catch (err) {
      console.error('Multi image upload error:', err);
      setError(err.message || 'Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleUploadFiles(files);
      e.target.value = '';
    }
  };

  const handlePaste = (e) => {
    if (uploading) return;
    const items = Array.from(e.clipboardData?.items || []);
    const pastedFiles = [];
    items.forEach((item, index) => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const ext = item.type.split('/')[1] || 'png';
          pastedFiles.push(new File([file], `pasted_image_${Date.now()}_${index}.${ext}`, { type: item.type }));
        }
      }
    });

    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleUploadFiles(pastedFiles);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index).map((img, idx) => ({ ...img, display_order: idx }));
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    const reordered = updated.map((img, idx) => ({ ...img, display_order: idx }));
    onChange(reordered);
  };

  return (
    <div className="space-y-3 font-sans" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#113F67] dark:text-[#f8fafc] uppercase tracking-wider">
          {label} ({images.length})
        </label>
        <span className="text-[10px] text-[#226597] dark:text-[#38bdf8] font-bold flex items-center space-x-1">
          <Clipboard className="w-3 h-3" />
          <span>Clipboard Paste & Mobile Camera Supported</span>
        </span>
      </div>

      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-[#87C0CD]/60 dark:border-[#233554] hover:border-[#226597] dark:hover:border-[#38bdf8] rounded-2xl p-6 text-center transition bg-[#F3F9FB] dark:bg-[#152238] hover:bg-white dark:hover:bg-[#1e2e4a] group shadow-xs focus:outline-none">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#E4F1F5] dark:bg-[#0f1b36] border border-[#87C0CD]/50 dark:border-[#233554] flex items-center justify-center text-[#226597] dark:text-[#38bdf8] group-hover:scale-110 transition">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#226597] dark:text-[#38bdf8]" /> : <Upload className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-bold text-[#113F67] dark:text-[#f8fafc] block">
              {uploading ? 'Processing & Converting Images to WebP...' : 'Click, Drag & Drop, or Paste Images (Ctrl+V)'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block pt-0.5">
              Supports PNG, JPG, WEBP, Clipboard Screenshots, & Mobile Camera Capture
            </span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden bg-white dark:bg-[#152238] border border-[#87C0CD]/40 dark:border-[#233554] p-2 space-y-2 flex flex-col justify-between shadow-xs"
            >
              <div className="h-28 bg-[#F3F9FB] dark:bg-[#0f1b36] rounded-lg overflow-hidden relative flex items-center justify-center border border-[#87C0CD]/20 dark:border-[#233554]">
                <img src={img.image_url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#226597] dark:bg-[#38bdf8] text-white dark:text-[#0b1329] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Primary</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full transition shadow hover:bg-rose-700 cursor-pointer"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reordering Controls */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 px-1 font-medium">
                <span className="font-mono text-[10px]">#{idx + 1}</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1 hover:text-[#226597] dark:hover:text-[#38bdf8] disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1 hover:text-[#226597] dark:hover:text-[#38bdf8] disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
