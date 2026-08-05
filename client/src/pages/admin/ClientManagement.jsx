import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const loadClients = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/clients?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setClients(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients(1, search);
  }, [search]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingClient) {
        await api.put(`/clients/${editingClient.id}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setModalOpen(false);
      setEditingClient(null);
      loadClients(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete client "${row.client_name}"?`)) return;
    try {
      await api.delete(`/clients/${row.id}`);
      loadClients(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    {
      header: 'Logo',
      key: 'logo_url',
      render: (val) => (val ? <div className="w-16 h-10 bg-white p-1 rounded border border-slate-700 flex items-center justify-center"><img src={val} alt="" className="w-full h-full object-contain" /></div> : '-'),
    },
    { header: 'Client Name', key: 'client_name' },
    { header: 'Website', key: 'website_url' },
    { header: 'Status', key: 'status' },
  ];

  const formFields = [
    { name: 'client_name', label: 'Client / OEM Partner Name *', type: 'text', placeholder: 'e.g. Siemens India' },
    { name: 'logo_url', label: 'Client Logo *', type: 'image', folder: 'clients' },
    { name: 'website_url', label: 'Website URL', type: 'text', placeholder: 'https://...' },
    { name: 'description', label: 'Brief Description', type: 'textarea', rows: 2 },
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
        title="Client Management"
        columns={columns}
        data={clients}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadClients(page, search)}
        onAddNew={() => {
          setEditingClient(null);
          setModalOpen(true);
        }}
        onEdit={(row) => {
          setEditingClient(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? `Edit Client: ${editingClient.client_name}` : 'Create New Client'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingClient || {}}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingClient ? 'Update Client' : 'Create Client'}
        />
      </FormModal>
    </div>
  );
}
