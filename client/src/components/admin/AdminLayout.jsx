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
    <div className="min-h-screen bg-[#F3F9FB] text-[#113F67] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#113F67] border-r border-[#87C0CD]/30 text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#87C0CD]/20 flex items-center space-x-3">
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.company_name || 'Omronics'} className="h-9 max-w-[170px] object-contain rounded-lg bg-white p-1" />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-[#87C0CD] p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#113F67] rounded-[10px] flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-[#87C0CD]" />
                  </div>
                </div>
                <div>
                  <span className="text-base font-extrabold font-display text-white">{settings?.company_name || 'OMRONICS'}</span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#87C0CD] font-semibold">Admin CMS</span>
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
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#226597] text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-[#226597]/40'
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
        <div className="p-4 border-t border-[#87C0CD]/20 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <span className="block text-xs font-bold text-white truncate">{user?.fullName || user?.name || 'Admin'}</span>
              <span className="block text-[10px] text-slate-300 truncate">{user?.email}</span>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-[#87C0CD] text-[#113F67] rounded shadow-xs">
              {user?.role || 'ADMIN'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 bg-[#226597]/50 hover:bg-[#226597] text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center space-x-1"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
