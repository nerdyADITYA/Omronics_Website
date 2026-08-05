import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export function MediaUploader({ value, onChange, folder = 'general', isDocument = false, label = 'Upload File' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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
        onChange(res.data.url);
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      
      {value ? (
        <div className="relative group rounded-lg border border-slate-700 bg-slate-900 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-3 truncate">
            {!isDocument ? (
              <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <span className="text-xs text-slate-300 truncate max-w-xs">{value}</span>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/60 hover:bg-slate-900 p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-center group">
          <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 mb-2 transition" />
          <span className="text-xs font-medium text-slate-300">
            {uploading ? 'Uploading & Processing...' : `Click to select ${isDocument ? 'PDF Document' : 'Image'}`}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            {isDocument ? 'Max file size 15MB (.pdf)' : 'Max file size 5MB (JPG, PNG, WEBP auto-converted)'}
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
        <div className="flex items-center space-x-1 text-xs text-rose-400 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
