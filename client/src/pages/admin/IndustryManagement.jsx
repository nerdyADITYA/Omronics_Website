import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function IndustryManagement() {
  const [industries, setIndustries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);

  const loadIndustries = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/industries?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setIndustries(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load industries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries(1, search);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingIndustry) {
        await api.put(`/industries/${editingIndustry.id}`, formData);
      } else {
        await api.post('/industries', formData);
      }
      setModalOpen(false);
      setEditingIndustry(null);
      loadIndustries(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete industry "${row.industry_name}"?`)) return;
    try {
      await api.delete(`/industries/${row.id}`);
      loadIndustries(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Industry Name', key: 'industry_name' },
    { header: 'Slug', key: 'slug' },
    { header: 'Status', key: 'status' },
  ];

  const formFields = [
    { name: 'industry_name', label: 'Industry Name *', type: 'text', placeholder: 'e.g. Automotive & Robotics' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'Auto-generated if left blank' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    { name: 'banner_image', label: 'Banner Image', type: 'image', folder: 'industries' },
    { name: 'thumbnail_image', label: 'Thumbnail Image', type: 'image', folder: 'industries' },
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
        title="Industry Management"
        columns={columns}
        data={industries}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadIndustries(page, search)}
        onAddNew={() => {
          setEditingIndustry(null);
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setEditingIndustry(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIndustry ? `Edit Industry: ${editingIndustry.industry_name}` : 'Create New Industry'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingIndustry || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingIndustry ? 'Update Industry' : 'Create Industry'}
        />
      </FormModal>
    </div>
  );
}
