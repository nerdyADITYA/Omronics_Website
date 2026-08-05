import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const loadTestimonials = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/testimonials?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setTestimonials(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load testimonials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials(1, search);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial.id}`, formData);
      } else {
        await api.post('/testimonials', formData);
      }
      setModalOpen(false);
      setEditingTestimonial(null);
      loadTestimonials(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete testimonial by "${row.customer_name}"?`)) return;
    try {
      await api.delete(`/testimonials/${row.id}`);
      loadTestimonials(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Company', key: 'company_name' },
    { header: 'Designation', key: 'designation' },
    { header: 'Rating', key: 'rating', render: (val) => `${val || 5} ★` },
    { header: 'Status', key: 'status' },
  ];

  const formFields = [
    { name: 'customer_name', label: 'Customer Name *', type: 'text', placeholder: 'e.g. Anil Kumar' },
    { name: 'company_name', label: 'Company Name', type: 'text', placeholder: 'e.g. Apex Engineering' },
    { name: 'designation', label: 'Designation', type: 'text', placeholder: 'e.g. Chief Maintenance Engineer' },
    { name: 'photo', label: 'Customer Photo', type: 'image', folder: 'testimonials' },
    {
      name: 'rating',
      label: 'Rating (1 - 5)',
      type: 'select',
      options: [
        { value: 5, label: '5 Stars' },
        { value: 4, label: '4 Stars' },
        { value: 3, label: '3 Stars' },
      ],
    },
    { name: 'review', label: 'Review Text *', type: 'textarea', rows: 4 },
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
        title="Testimonial Management"
        columns={columns}
        data={testimonials}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadTestimonials(page, search)}
        onAddNew={() => {
          setEditingTestimonial(null);
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setEditingTestimonial(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTestimonial ? `Edit Testimonial: ${editingTestimonial.customer_name}` : 'Create New Testimonial'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingTestimonial || { rating: 5 }}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
        />
      </FormModal>
    </div>
  );
}
