import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { MultiMediaUploader } from './MultiMediaUploader';

export function DynamicForm({
  fields = [],
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Save',
  isSubmitting: externalSubmitting,
}) {
  const [formData, setFormData] = useState(initialValues);
  const [internalSubmitting, setInternalSubmitting] = useState(false);

  const isSubmitting = externalSubmitting !== undefined ? externalSubmitting : internalSubmitting;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setInternalSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setInternalSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Submitting Glass Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center space-y-3 p-6 animate-in fade-in duration-200">
          <Loader2 className="w-8 h-8 text-[#226597] animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-xs font-extrabold text-[#113F67] uppercase tracking-wider">Updating Database</p>
            <p className="text-[11px] text-slate-500 font-medium">Please wait while changes are processed and saved...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {fields.map((field) => {
          const value = formData[field.name] ?? field.defaultValue ?? '';

          if (field.type === 'multi-image') {
            return (
              <MultiMediaUploader
                key={field.name}
                label={field.label}
                value={value}
                onChange={(val) => handleChange(field.name, val)}
                folder={field.folder || 'products'}
              />
            );
          }

          if (field.type === 'image' || field.type === 'document') {
            return (
              <MediaUploader
                key={field.name}
                label={field.label}
                value={value}
                onChange={(val) => handleChange(field.name, val)}
                folder={field.folder || 'general'}
                isDocument={field.type === 'document'}
              />
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67]">
                  {field.label}
                </label>
                <textarea
                  rows={field.rows || 4}
                  value={value}
                  disabled={isSubmitting}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-lg px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition disabled:opacity-60"
                />
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67]">
                  {field.label}
                </label>
                <select
                  value={value}
                  disabled={isSubmitting}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-lg px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition font-medium disabled:opacity-60"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'checkbox') {
            return (
              <div key={field.name} className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id={field.name}
                  checked={!!value}
                  disabled={isSubmitting}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="w-4 h-4 rounded bg-[#F3F9FB] border-[#87C0CD]/60 text-[#226597] focus:ring-[#226597] disabled:opacity-60"
                />
                <label htmlFor={field.name} className="text-xs font-bold text-[#113F67] cursor-pointer">
                  {field.label}
                </label>
              </div>
            );
          }

          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#113F67]">
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                value={value}
                disabled={isSubmitting}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-lg px-3 py-2 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] transition disabled:opacity-60"
              />
            </div>
          );
        })}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#87C0CD]/30">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-[#113F67] bg-[#E4F1F5] hover:bg-[#CBE2E8] rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-[#226597] hover:bg-[#113F67] rounded-lg shadow transition flex items-center space-x-2 disabled:opacity-75 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
            <span>{isSubmitting ? 'Saving...' : submitText}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
