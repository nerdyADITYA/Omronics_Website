import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Admin Auth & Layout
import { Login } from '../pages/admin/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/admin/AdminLayout';

// Admin Pages
import { Dashboard } from '../pages/admin/Dashboard';
import { ProductManagement } from '../pages/admin/ProductManagement';
import { CategoryManagement } from '../pages/admin/CategoryManagement';
import { ServiceManagement } from '../pages/admin/ServiceManagement';
import { IndustryManagement } from '../pages/admin/IndustryManagement';
import { ClientManagement } from '../pages/admin/ClientManagement';
import { TestimonialManagement } from '../pages/admin/TestimonialManagement';
import { EnquiryManagement } from '../pages/admin/EnquiryManagement';
import { SettingsManagement } from '../pages/admin/SettingsManagement';
import { CableCalculator } from '../pages/admin/CableCalculator';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />
      <Route path="/industries" element={<Industries />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* Protected Admin Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
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

      {/* Catch-All 404 Page Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
