import React from 'react';
import { Premio } from '@/types/premio';

type Props = {
  premio: Premio;
  onEdit: (p: Premio) => void;
  onToggle: (p: Premio) => void;
  onDelete: (p: Premio) => void;
  onView: (p: Premio) => void;
};

export default function PremioCard({ premio, onEdit, onToggle, onDelete, onView }: Props) {
  const canjeable = premio.is_active && premio.stock > 0;

  return (
    <div className="glass-card shadow-sm hover:shadow-md transition p-4 flex flex-col rounded-2xl border-slate-100 dark:border-slate-800">
      <div className="flex items-start gap-3">
        {(premio.image_url || premio.image_path) ? (
          <img
            src={premio.image_url ?? premio.image_path ?? ''}
            alt={premio.nombre}
            className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
            onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}
          />
        ) : (
          <div className="w-20 h-20 grid place-items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs flex-shrink-0">
            Sin imagen
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">{premio.nombre}</h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              premio.is_active 
                ? 'bg-green-500/10 text-sanjer-green border border-sanjer-green/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              {premio.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {premio.descripcion ? (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5">{premio.descripcion}</p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">—</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-700/50 p-2 text-center">
          <div className="text-slate-500 dark:text-slate-400 mb-0.5">Costo</div>
          <div className="font-bold text-slate-800 dark:text-slate-200">{premio.costo_fitcoins.toLocaleString()} fc</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-700/50 p-2 text-center">
          <div className="text-slate-500 dark:text-slate-400 mb-0.5">Stock</div>
          <div className={`font-bold text-slate-800 dark:text-slate-200 ${premio.stock <= 3 ? 'text-red-500 dark:text-red-400' : ''}`}>{premio.stock}</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-700/50 p-2 text-center">
          <div className="text-slate-500 dark:text-slate-400 mb-0.5">Estado</div>
          <div className={`font-bold ${canjeable ? 'text-sanjer-green' : 'text-slate-500 dark:text-slate-400'}`}>
            {canjeable ? 'Canjeable' : 'Agotado'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <button 
          className="px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors" 
          onClick={() => onView(premio)}
        >
          Ver
        </button>
        <button 
          className="px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors" 
          onClick={() => onEdit(premio)}
        >
          Editar
        </button>
        <button
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
            premio.is_active
              ? 'border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              : 'bg-sanjer-green text-white hover:bg-green-600'
          }`}
          onClick={() => onToggle(premio)}
        >
          {premio.is_active ? 'Desactivar' : 'Activar'}
        </button>
        <button 
          className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors ml-auto" 
          onClick={() => onDelete(premio)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
