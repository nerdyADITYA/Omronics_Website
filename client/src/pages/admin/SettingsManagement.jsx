import React, { useState, useEffect } from 'react';
import { DynamicForm } from '../../components/admin/DynamicForm';
import api from '../../services/api';

import { useSettings } from '../../context/SettingsContext';

export function SettingsManagement() {
  const { reloadSettings } = useSettings();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        if (res.success) setSettings(res.data);
      } catch (err) {
        console.error('Failed to load website settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (formData) => {
    try {
      const res = await api.put('/settings', formData);
      if (res.success) {
        setSettings(res.data);
        reloadSettings();
        setMessage('Website settings saved successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const fields = [
    { name: 'company_name', label: 'Company Name *', type: 'text' },
    { name: 'company_email', label: 'Primary Contact Email *', type: 'text' },
    { name: 'support_email', label: 'Support Email', type: 'text' },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'alternate_phone', label: 'Alternate Phone Number', type: 'text' },
    { name: 'address', label: 'Corporate & Manufacturing Address', type: 'textarea', rows: 3 },
    { name: 'meta_title', label: 'Global SEO Title', type: 'text' },
    { name: 'meta_description', label: 'Global SEO Description', type: 'textarea', rows: 3 },
    { name: 'logo', label: 'Header Logo Image', type: 'image', folder: 'settings' },
    { name: 'favicon', label: 'Favicon Icon', type: 'image', folder: 'settings' },
  ];

  if (loading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Global Website Settings</h1>
          <p className="text-xs text-slate-400">Configure global company information, contact numbers, and SEO defaults.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 font-semibold">
          {message}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <DynamicForm
          fields={fields}
          initialValues={settings || {}}
          onSubmit={handleSave}
          submitText="Save Website Settings"
        />
      </div>
    </div>
  );
}
