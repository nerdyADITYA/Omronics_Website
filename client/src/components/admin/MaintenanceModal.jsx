import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, X, RefreshCw, Sparkles } from 'lucide-react';

export function MaintenanceModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  currentSettings,
  isSubmitting,
}) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    email: '',
    phone: '',
  });

  const willEnable = !currentStatus;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: currentSettings?.maintenance_title || 'Website Under Scheduled Maintenance',
        message:
          currentSettings?.maintenance_message ||
          'We are currently performing scheduled maintenance and upgrades to serve you better. Please check back shortly.',
        email:
          currentSettings?.maintenance_contact_email ||
          currentSettings?.support_email ||
          currentSettings?.company_email ||
          'sales@omronics.com',
        phone:
          currentSettings?.maintenance_contact_phone ||
          currentSettings?.phone ||
          '+91 9512953737',
      });
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      is_maintenance_mode: willEnable,
      maintenance_title: formData.title,
      maintenance_message: formData.message,
      maintenance_contact_email: formData.email,
      maintenance_contact_phone: formData.phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1B36]/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#112240] rounded-3xl shadow-2xl border border-[#87C0CD]/40 dark:border-[#233554] overflow-hidden z-10 transition-all transform animate-scale-up">
        {/* Header Ribbon */}
        <div
          className={`px-6 py-5 flex items-center justify-between border-b ${
            willEnable
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-900/50'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-900/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                willEnable
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {willEnable ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold font-display text-[#113F67] dark:text-white">
                {willEnable
                  ? 'Enable Maintenance Mode?'
                  : 'Restore Public Website?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {willEnable
                  ? 'Public visitors will see the maintenance notice'
                  : 'Public visitors will regain full website access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {willEnable ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold block mb-1">
                  ⚠️ Notice to Administrator:
                </span>
                Activating maintenance mode will immediately lock all public
                website routes (<code className="font-mono text-[11px] font-bold">/</code>,{' '}
                <code className="font-mono text-[11px] font-bold">/products</code>,{' '}
                <code className="font-mono text-[11px] font-bold">/services</code>, etc.).
                You and your team can still access the <strong>Admin Dashboard</strong> at any time.
              </div>

              {/* Maintenance Notice Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#113F67] dark:text-slate-200">
                  Custom Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#87C0CD]/50 dark:border-[#233554] bg-white dark:bg-[#0B1B36] text-xs font-medium text-[#113F67] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#226597]"
                  placeholder="e.g. Website Under Scheduled Maintenance"
                />
              </div>

              {/* Maintenance Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#113F67] dark:text-slate-200">
                  Visitor Explanation Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#87C0CD]/50 dark:border-[#233554] bg-white dark:bg-[#0B1B36] text-xs font-medium text-[#113F67] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#226597] resize-none"
                  placeholder="Explain why the website is temporarily offline and when it will return."
                />
              </div>

              {/* Emergency Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#113F67] dark:text-slate-200">
                    Emergency Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#87C0CD]/50 dark:border-[#233554] bg-white dark:bg-[#0B1B36] text-xs font-medium text-[#113F67] dark:text-white focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#113F67] dark:text-slate-200">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#87C0CD]/50 dark:border-[#233554] bg-white dark:bg-[#0B1B36] text-xs font-medium text-[#113F67] dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ready to bring the website back online?</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Confirming will immediately restore all public catalog pages, product
                customizers, and enquiry forms for all website visitors.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#87C0CD]/30 dark:border-[#233554]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs tracking-wide transition shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50 ${
                willEnable
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : willEnable ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Yes, Enable Maintenance Mode</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, Restore Public Website</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
