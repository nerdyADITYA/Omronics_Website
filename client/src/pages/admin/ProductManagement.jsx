import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { FormModal } from '../../components/admin/FormModal';
import { DynamicForm } from '../../components/admin/DynamicForm';
import { StatusBadge } from '../../components/admin/StatusBadge';
import api from '../../services/api';

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/categories?status=ACTIVE');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const loadProducts = async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setProducts(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, search);
  }, [search]);

  const handleEdit = async (row) => {
    try {
      const res = await api.get(`/products/${row.id}`);
      let prodData = res.success && res.data ? res.data : { ...row };

      if (Array.isArray(prodData.documents) && prodData.documents.length > 0) {
        const doc = prodData.documents[0];
        prodData.pdf_catalog = {
          url: doc.document_url,
          filename: doc.document_name,
          fileSize: doc.file_size,
        };
      }

      setEditingProduct(prodData);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load detail for editing', err);
      setEditingProduct(row);
      setModalOpen(true);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = {
        ...formData,
        thumbnail_image: typeof formData.thumbnail_image === 'object' && formData.thumbnail_image !== null
          ? formData.thumbnail_image.url || formData.thumbnail_image.document_url || null
          : formData.thumbnail_image || null,
      };

      delete payload.category_name;
      delete payload.category_slug;
      delete payload.category_status;

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setModalOpen(false);
      setEditingProduct(null);
      loadProducts(pagination.page, search);
    } catch (err) {
      const errMsg = Array.isArray(err.errors) && err.errors.length > 0 ? err.errors.join('\n') : err.message || 'Operation failed';
      alert(errMsg);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete product "${row.product_name}"?`)) return;
    try {
      await api.delete(`/products/${row.id}`);
      loadProducts(pagination.page, search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const columns = [
    { header: 'ID', key: 'id' },
    {
      header: 'Image',
      key: 'thumbnail_image',
      render: (val) => (val ? <img src={val} alt="" className="w-10 h-10 object-contain rounded bg-white border border-[#87C0CD]/30" /> : '-'),
    },
    { header: 'Product Name', key: 'product_name' },
    { header: 'Category', key: 'category_name' },
    { header: 'Model Number', key: 'model_number' },
    {
      header: 'Price (₹)',
      key: 'price',
      render: (val) => (val !== null && val !== undefined && val !== '' ? `₹${Number(val).toLocaleString('en-IN')}` : '-'),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val, row) => {
        if (row.category_status === 'INACTIVE') {
          return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 whitespace-nowrap shadow-xs" title="Disabled on website because parent category is INACTIVE">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
              CATEGORY INACTIVE
            </span>
          );
        }
        return <StatusBadge status={val} />;
      },
    },
  ];

  const formFields = [
    {
      name: 'category_id',
      label: 'Category *',
      type: 'select',
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: 'product_name', label: 'Product Name *', type: 'text', placeholder: 'e.g. Panasonic A6 Servo Cable' },
    { name: 'slug', label: 'URL Slug', type: 'text', placeholder: 'Auto-generated if left blank' },
    { name: 'model_number', label: 'Model / Part Number', type: 'text', placeholder: 'e.g. MFECA0050EAE' },
    { name: 'price', label: 'Product Price (₹) - Integer Only', type: 'number', placeholder: 'e.g. 4500' },
    { name: 'short_description', label: 'Short Description', type: 'textarea', rows: 2 },
    { name: 'description', label: 'Full Description', type: 'textarea', rows: 4 },
    { name: 'features', label: 'Key Features (Line separated)', type: 'textarea', rows: 3 },
    { name: 'specifications', label: 'Technical Specifications', type: 'textarea', rows: 3 },
    { name: 'thumbnail_image', label: 'Thumbnail Image (Primary)', type: 'image', folder: 'products' },
    { name: 'images', label: 'Product Gallery Images (Select Multiple Files)', type: 'multi-image', folder: 'products' },
    { name: 'pdf_catalog', label: 'Product Catalog / Datasheet PDF', type: 'document', folder: 'documents' },
    { name: 'video_url', label: 'YouTube Demo Video Link (URL)', type: 'text', placeholder: 'e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { name: 'featured', label: 'Display on Home Page Featured List', type: 'checkbox' },
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
        title="Product Management"
        columns={columns}
        data={products}
        pagination={pagination}
        loading={loading}
        searchValue={search}
        onSearch={setSearch}
        onPageChange={(page) => loadProducts(page, search)}
        onAddNew={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.product_name}` : 'Create New Product'}
      >
        <DynamicForm
          fields={formFields}
          initialValues={editingProduct || { category_id: categories[0]?.id || '' }}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setModalOpen(false)}
          submitText={editingProduct ? 'Update Product' : 'Create Product'}
        />
      </FormModal>
    </div>
  );
}
