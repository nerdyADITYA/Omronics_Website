import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle, FileCheck } from 'lucide-react';
import api from '../../services/api';

export function MediaUploader({ value, onChange, folder = 'general', isDocument = false, label = 'Upload File' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileUrl = typeof value === 'string' ? value : value?.url || value?.document_url || '';
  const fileName = typeof value === 'object' ? value?.filename || value?.document_name || '' : '';
  const fileSize = typeof value === 'object' ? value?.fileSize || value?.file_size || '' : '';

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
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

  return (
    <div className="space-y-2 font-sans">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67]">{label}</label>

      {fileUrl ? (
        <div className="relative group rounded-xl border border-[#87C0CD]/40 bg-white p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3 truncate">
            {!isDocument ? (
              <img src={fileUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-[#87C0CD]/30" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#E4F1F5] flex items-center justify-center text-[#226597] border border-[#87C0CD]/40 shrink-0">
                <FileCheck className="w-5 h-5 text-[#226597]" />
              </div>
            )}
            <div className="truncate">
              <span className="text-xs text-[#113F67] font-bold block truncate max-w-xs">
                {fileName || (isDocument ? 'Uploaded Compressed PDF Catalog' : (fileUrl.startsWith('data:') ? 'Uploaded Image' : fileUrl))}
              </span>
              {fileSize && (
                <span className="inline-block text-[10px] font-bold text-[#226597] bg-[#E4F1F5] px-2 py-0.5 rounded mt-0.5">
                  Size: {fileSize} (Compressed)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
            title="Remove File"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-[#87C0CD]/60 hover:border-[#226597] bg-[#F3F9FB] hover:bg-white p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center group shadow-xs">
          <Upload className="w-6 h-6 text-[#226597] group-hover:scale-110 transition mb-2" />
          <span className="text-xs font-bold text-[#113F67]">
            {uploading
              ? isDocument
                ? 'Uploading & Compressing PDF Stream...'
                : 'Uploading & Processing Image...'
              : `Click to select ${isDocument ? 'PDF Product Catalog' : 'Image'}`}
          </span>
          <span className="text-[10px] text-slate-600 font-semibold mt-1 bg-[#E4F1F5] px-3 py-1 rounded-full border border-[#87C0CD]/40">
            {isDocument
              ? 'Required Format: PDF | Max File Size: 15 MB (Auto-Compressed)'
              : 'Required Formats: JPG, PNG, WEBP | Max File Size: 5 MB (Auto-Converted)'}
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
        <div className="flex items-center space-x-1 text-xs text-rose-600 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
