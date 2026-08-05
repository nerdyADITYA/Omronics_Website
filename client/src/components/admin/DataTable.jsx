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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-display">{title}</h2>
          <p className="text-xs text-slate-400">Total {pagination.total || data.length} items found</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48 md:w-64 transition"
            />
          </div>

          {/* Add New Button */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.header} className="px-6 py-3.5 font-semibold">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-6 py-3.5 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-800/40 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? (
                        col.render(row[col.key], row)
                      ) : col.key === 'status' ? (
                        <StatusBadge status={row[col.key]} />
                      ) : (
                        <span>{row[col.key] ?? '-'}</span>
                      )}
                    </td>
                  ))}

                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
