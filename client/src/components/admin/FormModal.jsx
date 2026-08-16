import React from 'react';
import { X } from 'lucide-react';

export function FormModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#113F67]/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-[#87C0CD]/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#87C0CD]/30 bg-[#F3F9FB]">
          <h3 className="text-base font-bold text-[#113F67] font-display">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-[#113F67] rounded-lg hover:bg-[#E4F1F5] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
}
