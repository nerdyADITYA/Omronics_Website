import React from 'react';

export function StatusBadge({ status }) {
  const isOk = status === 'ACTIVE' || status === 'COMPLETED';
  const isPending = status === 'NEW' || status === 'IN_PROGRESS' || status === 'CONTACTED';
  const isBad = status === 'INACTIVE' || status === 'CLOSED';

  let colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
  if (isOk) {
    colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
  } else if (isPending) {
    colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
  } else if (isBad) {
    colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-800/50';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOk ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
      {status}
    </span>
  );
}
