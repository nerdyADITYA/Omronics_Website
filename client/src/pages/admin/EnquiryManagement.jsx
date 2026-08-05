import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const loadEnquiries = async (page = 1, searchQuery = '', status = '') => {
    setLoading(true);
    try {
      let url = `/enquiries?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`;
      if (status) url += `&status=${status}`;
      const res = await api.get(url);
      if (res.success) {
        setEnquiries(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries(1, search, statusFilter);
  }, [search, statusFilter]);

  const handleUpdateStatus = async (formData) => {
    try {
      await api.patch(`/enquiries/${selectedEnquiry.id}/status`, formData);
      setModalOpen(false);
      setSelectedEnquiry(null);
      loadEnquiries(pagination.page, search, statusFilter);
    } catch (err) {
      alert(err.message || 'Failed to update enquiry status');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete enquiry from "${row.customer_name}"?`)) return;
    try {
      await api.delete(`/enquiries/${row.id}`);
      loadEnquiries(pagination.page, search, statusFilter);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Source', key: 'source_type' },
    { header: 'Customer', key: 'customer_name' },
    { header: 'Company', key: 'company_name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Status', key: 'status' },
    {
      header: 'Date',
      key: 'created_at',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  const statusFormFields = [
    {
      name: 'status',
      label: 'Update Status',
      type: 'select',
      options: [
        { value: 'NEW', label: 'NEW' },
        { value: 'CONTACTED', label: 'CONTACTED' },
        { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
        { value: 'COMPLETED', label: 'COMPLETED' },
        { value: 'CLOSED', label: 'CLOSED' },
      ],
    },
    { name: 'remarks', label: 'Internal Sales Remarks', type: 'textarea', rows: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center space-x-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter by Status:</span>
        {['', 'NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === st ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            {st || 'ALL'}
          </button>
        ))}
      </div>

      <DataTable
        title="Customer Lead Enquiries"
        columns={columns}
        data={enquiries}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadEnquiries(page, search, statusFilter)}
        onEdit={(row) => {
          setSelectedEnquiry(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* Details & Status Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedEnquiry ? `Enquiry #${selectedEnquiry.id} - ${selectedEnquiry.customer_name}` : 'Enquiry Details'}
      >
        {selectedEnquiry && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <p><strong>Customer:</strong> {selectedEnquiry.customer_name} ({selectedEnquiry.email})</p>
              <p><strong>Company:</strong> {selectedEnquiry.company_name || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedEnquiry.phone || 'N/A'}</p>
              <p><strong>Location:</strong> {selectedEnquiry.city || ''} {selectedEnquiry.country || ''}</p>
              <p><strong>Subject:</strong> {selectedEnquiry.subject || 'N/A'}</p>
              <div className="pt-2 border-t border-slate-800">
                <span className="block font-bold text-slate-200 mb-1">Customer Requirement Details:</span>
                <p className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-line">
                  {selectedEnquiry.requirement}
                </p>
              </div>
            </div>

            <DynamicForm
              fields={statusFormFields}
              initialValues={{ status: selectedEnquiry.status, remarks: selectedEnquiry.remarks || '' }}
              onSubmit={handleUpdateStatus}
              onCancel={() => setModalOpen(false)}
              submitText="Update Status & Remarks"
            />
          </div>
        )}
      </FormModal>
    </div>
  );
}
