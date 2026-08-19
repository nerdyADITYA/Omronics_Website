import React from 'react';
import { Search, ChevronLeft, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function DataTable({
  columns = [],
  data = [],
  pagination = {},
  onPageChange,
  onSearch,
  searchValue = '',
  onAddNew,
  onEdit,
  onDelete,
  title = 'Records',
  loading = false,
}) {
  return (
    <div className="bg-white border border-[#87C0CD]/40 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="p-4 md:p-6 border-b border-[#87C0CD]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#113F67] font-display">{title}</h2>
          <p className="text-xs text-slate-500 font-medium">Total {pagination.total || data.length} items found</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#226597]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl text-xs text-[#113F67] focus:outline-none focus:border-[#226597] w-48 md:w-64 transition"
            />
          </div>

          {/* Add New Button */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#113F67]">
          <thead className="bg-[#F3F9FB] uppercase text-[10px] tracking-wider text-[#113F67] border-b border-[#87C0CD]/30 font-bold">
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.header} className={`px-6 py-3.5 font-bold whitespace-nowrap ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-3.5 text-right font-bold whitespace-nowrap">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#87C0CD]/20">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500 font-medium">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-[#F3F9FB]/60 transition">
                  {columns.map((col) => {
                    const isLongField = col.isLongText || ['short_description', 'description', 'requirement', 'features', 'specifications', 'message', 'testimonial'].includes(col.key);
                    
                    return (
                      <td
                        key={col.key}
                        className={`px-6 py-4 font-medium ${
                          isLongField
                            ? 'min-w-[280px] max-w-md break-words leading-relaxed text-slate-600'
                            : 'whitespace-nowrap'
                        } ${col.className || ''}`}
                      >
                        {(() => {
                          const val = col.render ? col.render(row[col.key], row) : row[col.key];
                          if (typeof val === 'string' && ['ACTIVE', 'INACTIVE', 'NEW', 'IN_PROGRESS', 'CONTACTED', 'CLOSED', 'COMPLETED'].includes(val.trim())) {
                            return <StatusBadge status={val.trim()} />;
                          }
                          if (col.render) {
                            return val;
                          }
                          if (col.key === 'status') {
                            return <StatusBadge status={row[col.key]} />;
                          }
                          return <span>{val ?? '-'}</span>;
                        })()}
                      </td>
                    );
                  })}

                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-[#226597] hover:text-[#113F67] rounded-lg hover:bg-[#E4F1F5] transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-[#87C0CD]/30 bg-[#F3F9FB] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 bg-white border border-[#87C0CD]/40 hover:bg-[#E4F1F5] disabled:opacity-40 text-[#113F67] rounded-lg transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 bg-white border border-[#87C0CD]/40 hover:bg-[#E4F1F5] disabled:opacity-40 text-[#113F67] rounded-lg transition shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
