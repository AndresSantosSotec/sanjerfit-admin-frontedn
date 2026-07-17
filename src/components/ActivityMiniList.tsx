import React from 'react';

interface Item {
  id: number;
  exercise_type: string;
  created_at: string;
  user: { id: number; name: string };
}

export default function ActivityMiniList({ list }: { list: Item[] }) {
  if (!list || list.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Sin actividad reciente</p>
    );
  }
  return (
    <div className="space-y-3">
      {list.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sanjer-blue to-sanjer-green flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {item.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight truncate">
              <span className="font-semibold">{item.user.name}</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal"> · </span>
              <span className="text-sanjer-green font-semibold">{item.exercise_type}</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
