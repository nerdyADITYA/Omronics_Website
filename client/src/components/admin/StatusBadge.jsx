import React from 'react';

export function StatusBadge({ status }) {
  const isOk = status === 'ACTIVE' || status === 'COMPLETED';
  const isPending = status === 'NEW' || status === 'IN_PROGRESS' || status === 'CONTACTED';
  const isBad = status === 'INACTIVE' || status === 'CLOSED';

  let colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  if (isOk) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (isPending) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (isBad) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOk ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
      {status}
    </span>
  );
}
