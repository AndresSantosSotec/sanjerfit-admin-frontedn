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
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition p-4 flex flex-col">
      <div className="flex items-start gap-3">
        {(premio.image_url || premio.image_path) ? (
          <img
            src={premio.image_url ?? premio.image_path ?? ''}
            alt={premio.nombre}
            className="w-20 h-20 object-cover rounded-md border"
            onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}
          />
        ) : (
          <div className="w-20 h-20 grid place-items-center rounded-md border bg-gray-50 text-gray-400 text-xs">
            Sin imagen
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{premio.nombre}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${premio.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {premio.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {premio.descripcion ? (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{premio.descripcion}</p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">—</p>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-gray-500">Costo</div>
          <div className="font-semibold">{premio.costo_fitcoins.toLocaleString()} fc</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-gray-500">Stock</div>
          <div className={`font-semibold ${premio.stock <= 3 ? 'text-red-600' : ''}`}>{premio.stock}</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-gray-500">Estado</div>
          <div className={`font-semibold ${canjeable ? 'text-green-600' : 'text-gray-500'}`}>
            {canjeable ? 'Canjeable' : 'No disponible'}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-1.5 rounded-lg border" onClick={() => onView(premio)}>Ver</button>
        <button className="px-3 py-1.5 rounded-lg border" onClick={() => onEdit(premio)}>Editar</button>
        <button
          className={`px-3 py-1.5 rounded-lg ${premio.is_active ? 'border' : 'bg-black text-white'}`}
          onClick={() => onToggle(premio)}
        >
          {premio.is_active ? 'Desactivar' : 'Activar'}
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white" onClick={() => onDelete(premio)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
