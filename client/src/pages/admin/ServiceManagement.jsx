import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const loadServices = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/services?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setServices(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(1, search);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setModalOpen(false);
      setEditingService(null);
      loadServices(pagination.page, search);
    } catch (err) {
      const errMsg = Array.isArray(err.errors) && err.errors.length > 0 ? err.errors.join('\n') : err.message || 'Operation failed';
      alert(errMsg);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete service "${row.service_name}"?`)) return;
    try {
      await api.delete(`/services/${row.id}`);
      loadServices(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Service Name', key: 'service_name' },
    { header: 'Slug', key: 'slug' },
    { header: 'Short Description', key: 'short_description' },
    { header: 'Status', key: 'status' },
  ];

  const formFields = [
    { name: 'service_name', label: 'Service Name *', type: 'text', placeholder: 'e.g. Electrical Control Panel Manufacturing' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'Auto-generated if left blank' },
    { name: 'short_description', label: 'Short Description', type: 'textarea', rows: 2 },
    { name: 'description', label: 'Full Details', type: 'textarea', rows: 5 },
    {
      name: 'solutions_provided',
      label: 'Solutions Provided (Line separated list)',
      type: 'textarea',
      rows: 4,
      placeholder: 'PLC – SCADA – MES Integration\nDigital Monitoring Systems\nIoT Sensor Implementation\nEnergy Monitoring Solutions',
    },
    {
      name: 'key_features',
      label: 'Key Features & Benefits (Line separated list)',
      type: 'textarea',
      rows: 4,
      placeholder: 'Real-time visibility of production and processes\nImproved machine efficiency and uptime\nData-driven planning and predictive maintenance',
    },
    { name: 'banner_image', label: 'Banner Image', type: 'image', folder: 'services' },
    { name: 'thumbnail_image', label: 'Thumbnail Image', type: 'image', folder: 'services' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ACTIVE', label: 'ACTIVE' },
        { value: 'INACTIVE', label: 'INACTIVE' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Service Management"
        columns={columns}
        data={services}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadServices(page, search)}
        onAddNew={() => {
          setEditingService(null);
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setEditingService(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.service_name}` : 'Create New Service'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingService || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingService ? 'Update Service' : 'Create Service'}
        />
      </FormModal>
    </div>
  );
}
