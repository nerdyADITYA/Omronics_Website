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
  const total = Number(pagination?.total || data.length || 0);
  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || 10);
  const totalPages = Number(pagination?.totalPages || Math.ceil(total / limit) || 1);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  const getPaginationPages = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="bg-white border border-[#87C0CD]/40 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="p-4 md:p-6 border-b border-[#87C0CD]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#113F67] font-display">{title}</h2>
          <p className="text-xs text-slate-500 font-medium">Total {total} items found</p>
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
      {total > 0 && (
        <div className="p-4 border-t border-[#87C0CD]/30 bg-[#F3F9FB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium whitespace-nowrap">
            Showing <span className="font-extrabold text-[#113F67]">{startIndex + 1}</span> to{' '}
            <span className="font-extrabold text-[#113F67]">{endIndex}</span> of{' '}
            <span className="font-extrabold text-[#113F67]">{total}</span> items
          </div>

          <div className="flex items-center space-x-1 shrink-0 overflow-x-auto">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#87C0CD]/40 bg-white text-[#113F67] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E4F1F5] transition cursor-pointer shrink-0"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPaginationPages(page, totalPages).map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="w-7 h-8 flex items-center justify-center text-slate-400 font-bold shrink-0">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange && onPageChange(p)}
                  className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-bold rounded-lg transition cursor-pointer shrink-0 ${
                    page === p
                      ? 'bg-[#226597] text-white shadow-xs'
                      : 'bg-white text-[#113F67] border border-[#87C0CD]/40 hover:bg-[#E4F1F5]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#87C0CD]/40 bg-white text-[#113F67] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E4F1F5] transition cursor-pointer shrink-0"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
