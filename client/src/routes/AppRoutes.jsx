import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

// Public Pages
import { Home } from '../pages/public/Home';
import { Products } from '../pages/public/Products';
import { ProductDetail } from '../pages/public/ProductDetail';
import { Services } from '../pages/public/Services';
import { ServiceDetail } from '../pages/public/ServiceDetail';
import { Industries } from '../pages/public/Industries';
import { Clients } from '../pages/public/Clients';
import { About } from '../pages/public/About';
import { Contact } from '../pages/public/Contact';
import { NotFound } from '../pages/public/NotFound';
import { Maintenance } from '../pages/public/Maintenance';

// Admin Auth & Layout
import { Login } from '../pages/admin/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/admin/AdminLayout';

// Admin Pages
import { Dashboard } from '../pages/admin/Dashboard';
import { ProductManagement } from '../pages/admin/ProductManagement';
import { SubProductManagement } from '../pages/admin/SubProductManagement';
import { CategoryManagement } from '../pages/admin/CategoryManagement';
import { ServiceManagement } from '../pages/admin/ServiceManagement';
import { IndustryManagement } from '../pages/admin/IndustryManagement';
import { ClientManagement } from '../pages/admin/ClientManagement';
import { TestimonialManagement } from '../pages/admin/TestimonialManagement';
import { EnquiryManagement } from '../pages/admin/EnquiryManagement';
import { SettingsManagement } from '../pages/admin/SettingsManagement';
import { CableCalculator } from '../pages/admin/CableCalculator';

export function AppRoutes() {
  const { settings, loading } = useSettings();
  const isMaintenance = Boolean(settings?.is_maintenance_mode);

  return (
    <Routes>
      {/* Admin Login (Always Accessible) */}
      <Route path="/admin/login" element={<Login />} />

      {/* Protected Admin Dashboard Routes (Always Accessible to Authenticated Admins) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="sub-products" element={<SubProductManagement />} />
          <Route path="cable-calculator" element={<CableCalculator />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="industries" element={<IndustryManagement />} />
          <Route path="clients" element={<ClientManagement />} />
          <Route path="testimonials" element={<TestimonialManagement />} />
          <Route path="enquiries" element={<EnquiryManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
        </Route>
      </Route>

      {/* Public Routes - Render Maintenance screen when is_maintenance_mode is active */}
      {isMaintenance ? (
        <>
          <Route path="/" element={<Maintenance />} />
          <Route path="/products" element={<Maintenance />} />
          <Route path="/products/:slug" element={<Maintenance />} />
          <Route path="/services" element={<Maintenance />} />
          <Route path="/services/:slug" element={<Maintenance />} />
          <Route path="/industries" element={<Maintenance />} />
          <Route path="/clients" element={<Maintenance />} />
          <Route path="/about" element={<Maintenance />} />
          <Route path="/contact" element={<Maintenance />} />
          <Route path="*" element={<Maintenance />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Catch-All 404 Page Not Found */}
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
}
