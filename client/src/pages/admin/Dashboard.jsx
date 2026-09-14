import React, { useState, useEffect } from 'react';
import { Package, FolderTree, Inbox, Wrench, ShieldAlert, CheckCircle2, AlertTriangle, Power } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { MaintenanceModal } from '../../components/admin/MaintenanceModal';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';

export function Dashboard() {
  const { settings, reloadSettings } = useSettings();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    enquiries: 0,
    services: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const isMaintenanceActive = Boolean(settings?.is_maintenance_mode);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pRes, cRes, eRes, sRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/categories?limit=1'),
          api.get('/enquiries?limit=5'),
          api.get('/services?limit=1'),
        ]);

        setStats({
          products: pRes.pagination?.total || 0,
          categories: cRes.pagination?.total || 0,
          enquiries: eRes.pagination?.total || 0,
          services: sRes.pagination?.total || 0,
        });

        if (eRes.success) setRecentEnquiries(eRes.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleMaintenanceToggle = async (modalPayload) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.put('/settings', modalPayload);
      if (res.success) {
        await reloadSettings();
        setIsModalOpen(false);
        setToastMessage({
          type: 'success',
          text: modalPayload.is_maintenance_mode
            ? '🔴 Maintenance Mode is now ACTIVE. Public UI routes are disabled.'
            : '🟢 Maintenance Mode DISABLED. Public website has been restored online!',
        });
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to update website status.',
      });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statCards = [
    { name: 'Total Products', count: stats.products, icon: Package },
    { name: 'Categories', count: stats.categories, icon: FolderTree },
    { name: 'Customer Enquiries', count: stats.enquiries, icon: Inbox },
    { name: 'Active Services', count: stats.services, icon: Wrench },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold shadow-md flex items-center justify-between animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Maintenance Mode Controller */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#113F67]">Executive Overview</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Real-time status of catalog items, lead inquiries, and media assets.</p>
        </div>

        {/* Maintenance Mode Control Card */}
        <div
          className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isMaintenanceActive
              ? 'bg-amber-500/10 border-amber-300 dark:border-amber-700/60'
              : 'bg-white border-[#87C0CD]/40'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
                isMaintenanceActive
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isMaintenanceActive ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Website Status:
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                    isMaintenanceActive
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isMaintenanceActive ? 'bg-amber-600 animate-ping' : 'bg-emerald-600'
                    }`}
                  />
                  {isMaintenanceActive ? 'MAINTENANCE MODE ACTIVE' : 'PUBLIC WEBSITE LIVE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isMaintenanceActive
                  ? 'All public UI routes are disabled with maintenance screen'
                  : 'Website is fully visible & active to public visitors'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer whitespace-nowrap active:scale-98 ${
              isMaintenanceActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>
              {isMaintenanceActive ? 'Disable Maintenance (Restore Website)' : 'Enable Maintenance Mode'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="p-6 rounded-2xl bg-white border border-[#87C0CD]/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#113F67] uppercase tracking-wider">{card.name}</span>
                <Icon className="w-5 h-5 text-[#226597]" />
              </div>
              <div className="text-3xl font-extrabold font-display text-[#113F67]">
                {loading ? '...' : card.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Customer Enquiries Table */}
      <div className="bg-white border border-[#87C0CD]/40 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#87C0CD]/30 pb-4">
          <h2 className="text-base font-bold font-display text-[#113F67]">Recent Lead Enquiries</h2>
          <span className="text-xs text-slate-500 font-medium">Latest 5 submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#113F67]">
            <thead className="bg-[#F3F9FB] uppercase text-[10px] tracking-wider text-[#113F67] border-b border-[#87C0CD]/30 font-bold">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#87C0CD]/20">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                    No enquiries logged yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#F3F9FB]/60 transition">
                    <td className="px-4 py-3.5 font-bold text-[#113F67]">{enq.customer_name}</td>
                    <td className="px-4 py-3.5 text-slate-600">{enq.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4F1F5] text-[#226597] border border-[#87C0CD]/40">
                        {enq.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{enq.requirement}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={enq.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleMaintenanceToggle}
        currentStatus={isMaintenanceActive}
        currentSettings={settings}
        isSubmitting={isUpdatingStatus}
      />
    </div>
  );
}
