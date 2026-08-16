import React, { useState, useEffect } from 'react';
import { Package, FolderTree, Inbox, Wrench } from 'lucide-react';
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
    { name: 'Total Products', count: stats.products, icon: Package },
    { name: 'Categories', count: stats.categories, icon: FolderTree },
    { name: 'Customer Enquiries', count: stats.enquiries, icon: Inbox },
    { name: 'Active Services', count: stats.services, icon: Wrench },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold font-display text-[#113F67]">Executive Overview</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Real-time status of catalog items, lead inquiries, and media assets.</p>
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
    </div>
  );
}
