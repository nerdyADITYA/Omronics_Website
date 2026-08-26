import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Calculator,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../context/SettingsContext';
import { AdminThemeProvider, useAdminTheme } from '../../context/AdminThemeContext';

function AdminLayoutContent() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { isDark, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Cable Calculator', path: '/admin/cable-calculator', icon: Calculator },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Services', path: '/admin/services', icon: Wrench },
    { name: 'Industries', path: '/admin/industries', icon: Factory },
    { name: 'Clients', path: '/admin/clients', icon: Building2 },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'Enquiries / Leads', path: '/admin/enquiries', icon: Inbox },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
  ];

  const currentNav = navItems.find((item) => item.path === location.pathname);
  const activeTitle = currentNav ? currentNav.name : 'Admin Panel';

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className={`min-h-screen flex font-sans transition-colors duration-300 admin-root-wrapper ${isDark ? 'dark bg-[#0b1329] text-[#f8fafc]' : 'bg-[#F3F9FB] text-[#113F67]'}`}>
      {/* Sidebar */}
      <aside
        className={`${
          isDark ? 'bg-[#0f1b36] border-[#233554]' : 'bg-[#113F67] border-[#87C0CD]/30'
        } border-r text-white flex flex-col justify-between shrink-0 shadow-lg transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Header & Toggle */}
          <div className={`p-4 border-b ${isDark ? 'border-[#233554]' : 'border-[#87C0CD]/20'} flex items-center ${collapsed ? 'justify-center flex-col space-y-3' : 'justify-between'}`}>
            {!collapsed ? (
              <div className="flex items-center space-x-3 truncate">
                {settings?.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings.company_name || 'Omronics'}
                    className="h-9 max-w-[140px] object-contain rounded-lg bg-white p-1 admin-logo-img"
                  />
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-[#87C0CD] p-0.5 shadow-md shrink-0">
                      <div className="w-full h-full bg-[#113F67] rounded-[10px] flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-[#87C0CD]" />
                      </div>
                    </div>
                    <div className="truncate">
                      <span className="text-sm font-extrabold font-display text-white block truncate">
                        {settings?.company_name || 'OMRONICS'}
                      </span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#87C0CD] font-semibold">
                        Admin CMS
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#87C0CD] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#113F67] rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#87C0CD]" />
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg ${isDark ? 'bg-[#233554] text-slate-300 hover:text-white' : 'bg-[#226597]/40 hover:bg-[#226597] text-slate-200 hover:text-white'} transition shadow-xs cursor-pointer shrink-0`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.name : ''}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs font-bold transition ${
                      collapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
                    } ${
                      isActive
                        ? isDark ? 'bg-[#38bdf8] text-[#0b1329] shadow-md font-extrabold' : 'bg-[#226597] text-white shadow-md'
                        : isDark ? 'text-slate-300 hover:text-white hover:bg-[#233554]/70' : 'text-slate-300 hover:text-white hover:bg-[#226597]/40'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className={`p-3 border-t ${isDark ? 'border-[#233554]' : 'border-[#87C0CD]/20'} space-y-3`}>
          {!collapsed ? (
            <>
              <div className="flex items-center justify-between px-2">
                <div className="truncate">
                  <span className="block text-xs font-bold text-white truncate">
                    {user?.fullName || user?.name || 'Admin'}
                  </span>
                  <span className="block text-[10px] text-slate-300 truncate">{user?.email}</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-[#87C0CD] text-[#113F67] rounded shadow-xs shrink-0">
                  {user?.role || 'ADMIN'}
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 text-center py-2 px-3 ${isDark ? 'bg-[#233554] hover:bg-[#34496e]' : 'bg-[#226597]/50 hover:bg-[#226597]'} text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center space-x-1`}
                >
                  <span>View Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleLogout}
                  className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 rounded-lg transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 ${isDark ? 'bg-[#233554]' : 'bg-[#226597]/50'} hover:bg-[#226597] text-white rounded-xl transition flex items-center justify-center shadow-xs`}
                title="View Public Site"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleLogout}
                className="w-10 h-10 text-rose-300 hover:text-rose-100 hover:bg-rose-900/50 rounded-xl transition flex items-center justify-center cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar with Light/Dark Mode Toggle */}
        <header className={`px-8 py-4 border-b ${isDark ? 'bg-[#152238] border-[#233554] text-[#f8fafc]' : 'bg-white border-[#87C0CD]/30 text-[#113F67]'} flex items-center justify-between sticky top-0 z-10 transition-colors duration-300 shadow-xs`}>
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? 'bg-[#233554] border-[#34496e] text-[#38bdf8]' : 'bg-[#E4F1F5] border-[#87C0CD]/40 text-[#226597]'}`}>
              {activeTitle}
            </span>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer border ${
              isDark
                ? 'bg-[#233554] hover:bg-[#34496e] text-amber-300 border-amber-400/30'
                : 'bg-[#F3F9FB] hover:bg-[#E4F1F5] text-[#113F67] border-[#87C0CD]/40'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-amber-300">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#226597]" />
                <span className="text-[#113F67]">Dark Mode</span>
              </>
            )}
          </button>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent />
    </AdminThemeProvider>
  );
}
