import React, { useState } from 'react';
import { MediaUploader } from './MediaUploader';
import { MultiMediaUploader } from './MultiMediaUploader';

export function DynamicForm({ fields = [], initialValues = {}, onSubmit, onCancel, submitText = 'Save' }) {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {field.label}
              </label>
              <textarea
                rows={field.rows || 4}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          );
        }

        if (field.type === 'select') {
          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {field.label}
              </label>
              <select
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
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
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor={field.name} className="text-sm font-medium text-slate-300 cursor-pointer">
                {field.label}
              </label>
            </div>
          );
        }

        return (
          <div key={field.name} className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              {field.label}
            </label>
            <input
              type={field.type || 'text'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>
        );
      })}

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-lg shadow-cyan-500/20 transition"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
