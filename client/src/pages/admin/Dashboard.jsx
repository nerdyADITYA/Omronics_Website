import React, { useState, useEffect } from 'react';
import { Package, FolderTree, Inbox, Wrench, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../services/api';

export function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    enquiries: 0,
    services: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const statCards = [
    { name: 'Total Products', count: stats.products, icon: Package, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/50' },
    { name: 'Categories', count: stats.categories, icon: FolderTree, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/50' },
    { name: 'Customer Enquiries', count: stats.enquiries, icon: Inbox, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/50' },
    { name: 'Active Services', count: stats.services, icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-100">Executive Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time status of catalog items, lead inquiries, and media assets.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className={`p-6 rounded-2xl border ${card.bg} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-3xl font-extrabold font-display text-slate-100">
                {loading ? '...' : card.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Customer Enquiries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold font-display text-slate-100">Recent Lead Enquiries</h2>
          <span className="text-xs text-slate-400">Latest 5 submissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No enquiries logged yet.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-slate-200">{e.customer_name}</td>
                    <td className="px-4 py-3 text-slate-400">{e.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300">
                        {e.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-300">{e.requirement}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-[11px]">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
