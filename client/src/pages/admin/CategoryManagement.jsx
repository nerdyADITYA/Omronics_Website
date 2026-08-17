import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setCategories(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories(1, search);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setModalOpen(false);
      setEditingCategory(null);
      loadCategories(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete category "${row.name}"?`)) return;
    try {
      await api.delete(`/categories/${row.id}`);
      loadCategories(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Category Name', key: 'name' },
    { header: 'Slug', key: 'slug' },
    { header: 'Short Description', key: 'short_description' },
    { header: 'Sort Order', key: 'sort_order' },
    { header: 'Status', key: 'status' },
  ];

  const formFields = [
    { name: 'name', label: 'Category Name *', type: 'text', placeholder: 'e.g. Servo Cables' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'Auto-generated if left blank' },
    { name: 'short_description', label: 'Short Description', type: 'textarea', rows: 2 },
    { name: 'description', label: 'Full Description', type: 'textarea', rows: 4 },
    { name: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '0' },
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
        title="Category Management"
        columns={columns}
        data={categories}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadCategories(page, search)}
        onAddNew={() => {
          setEditingCategory(null);
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setEditingCategory(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingCategory || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingCategory ? 'Update Category' : 'Create Category'}
        />
      </FormModal>
    </div>
  );
}
