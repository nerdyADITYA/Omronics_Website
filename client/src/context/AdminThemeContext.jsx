import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export function AdminThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin_theme_mode');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin_theme_mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <AdminThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
