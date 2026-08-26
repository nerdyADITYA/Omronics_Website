import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, FileCheck, AlertCircle, Clipboard, Sparkles } from 'lucide-react';
import api from '../../services/api';

export function MediaUploader({ value, onChange, folder = 'general', isDocument = false, label = 'Upload File' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  let cleanValue = value;
  if (typeof value === 'string' && value.trim().startsWith('{')) {
    try {
      cleanValue = JSON.parse(value.trim());
    } catch (e) {
      cleanValue = value;
    }
  }

  const fileUrl = typeof cleanValue === 'string' ? cleanValue : cleanValue?.url || cleanValue?.document_url || '';
  const fileName = typeof cleanValue === 'object' ? cleanValue?.filename || cleanValue?.document_name || '' : '';
  const fileSize = typeof cleanValue === 'object' ? cleanValue?.fileSize || cleanValue?.file_size || '' : '';

  const handleUploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const endpoint = isDocument ? '/uploads/document' : '/uploads/image';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data.url) {
        onChange({
          url: res.data.url,
          filename: res.data.filename || file.name,
          fileSize: res.data.fileSize || null,
        });
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUploadFile(file);
  };

  // Instant Window Paste Listener on Hover or Focus
  useEffect(() => {
    if (isDocument || fileUrl || uploading) return;

    const handleWindowPaste = (e) => {
      // Process paste if mouse is hovering over uploader OR container has focus
      if (!isHovered && containerRef.current && !containerRef.current.contains(document.activeElement)) {
        return;
      }

      const items = Array.from(e.clipboardData?.items || []);
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            e.stopPropagation();
            const ext = item.type.split('/')[1] || 'png';
            const pastedFile = new File([file], `pasted_image_${Date.now()}.${ext}`, { type: item.type });
            handleUploadFile(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isHovered, isDocument, fileUrl, uploading]);

  return (
    <div
      ref={containerRef}
      className="space-y-2 font-sans"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67] dark:text-[#f8fafc]">{label}</label>
        {!isDocument && !fileUrl && (
          <span
            className={`text-[10px] font-bold flex items-center space-x-1 transition ${
              isHovered ? 'text-amber-500 animate-pulse font-extrabold' : 'text-[#226597] dark:text-[#38bdf8]'
            }`}
          >
            {isHovered ? <Sparkles className="w-3 h-3 text-amber-500" /> : <Clipboard className="w-3 h-3" />}
            <span>{isHovered ? 'Ready! Press Ctrl+V Now to Paste' : 'Hover & Press Ctrl+V to Paste'}</span>
          </span>
        )}
      </div>

      {fileUrl ? (
        <div className="relative group rounded-xl border border-[#87C0CD]/40 dark:border-[#233554] bg-white dark:bg-[#152238] p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 truncate">
            {!isDocument ? (
              <img src={fileUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-[#87C0CD]/30 dark:border-[#233554]" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#E4F1F5] dark:bg-[#0f1b36] flex items-center justify-center text-[#226597] dark:text-[#38bdf8] border border-[#87C0CD]/40 dark:border-[#233554] shrink-0">
                <FileCheck className="w-5 h-5 text-[#226597] dark:text-[#38bdf8]" />
              </div>
            )}
            <div className="truncate">
              <span className="text-xs text-[#113F67] dark:text-[#f8fafc] font-bold block truncate max-w-xs">
                {fileName || (isDocument ? 'Uploaded Compressed PDF Catalog' : (fileUrl.startsWith('data:') ? 'Uploaded Image' : fileUrl))}
              </span>
              {fileSize && (
                <span className="inline-block text-[10px] font-bold text-[#226597] dark:text-[#38bdf8] bg-[#E4F1F5] dark:bg-[#0f1b36] px-2 py-0.5 rounded mt-0.5">
                  Size: {fileSize} (Compressed)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Remove File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          tabIndex={0}
          className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group shadow-xs focus:outline-none ${
            isHovered
              ? 'border-[#226597] dark:border-[#38bdf8] bg-white dark:bg-[#1e2e4a] ring-2 ring-[#226597]/30 shadow-md scale-[1.01]'
              : 'border-[#87C0CD]/60 dark:border-[#233554] bg-[#F3F9FB] dark:bg-[#152238] hover:bg-white dark:hover:bg-[#1e2e4a]'
          }`}
        >
          <Upload className={`w-6 h-6 transition mb-2 ${isHovered ? 'text-amber-500 scale-125' : 'text-[#226597] dark:text-[#38bdf8]'}`} />
          <span className="text-xs font-bold text-[#113F67] dark:text-[#f8fafc]">
            {uploading
              ? isDocument
                ? 'Uploading & Compressing PDF Stream...'
                : 'Uploading & Processing Image...'
              : isHovered
              ? 'Hovering Active — Press Ctrl+V to Paste Immediately!'
              : 'Click, Drag & Drop, or Hover & Press Ctrl+V'}
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold mt-1 bg-[#E4F1F5] dark:bg-[#0f1b36] px-3 py-1 rounded-full border border-[#87C0CD]/40 dark:border-[#233554]">
            {isDocument
              ? 'Required Format: PDF | Max File Size: 15 MB (Auto-Compressed)'
              : 'Formats: JPG, PNG, WEBP | Instant Hover Paste (Ctrl+V) & Mobile Camera'}
          </span>
          <input
            type="file"
            accept={isDocument ? '.pdf,application/pdf' : 'image/*'}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="flex items-center space-x-1 text-xs text-rose-600 mt-1 font-semibold">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
