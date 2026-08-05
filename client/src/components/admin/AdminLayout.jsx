import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Wrench,
  Factory,
  Building2,
  MessageSquareQuote,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../context/SettingsContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Services', path: '/admin/services', icon: Wrench },
    { name: 'Industries', path: '/admin/industries', icon: Factory },
    { name: 'Clients', path: '/admin/clients', icon: Building2 },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Enquiries / Leads', path: '/admin/enquiries', icon: Inbox },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.company_name || 'Omronics'} className="h-9 max-w-[170px] object-contain rounded-lg" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-extrabold font-display text-gradient">{settings?.company_name || 'OMRONICS'}</span>
                  <span className="block text-[9px] uppercase tracking-widest text-slate-400">Admin CMS</span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <span className="block text-xs font-bold text-slate-200 truncate">{user?.fullName || user?.name || 'Admin'}</span>
              <span className="block text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
              {user?.role || 'ADMIN'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/60 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Admin Portal</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold">Control Panel</span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
