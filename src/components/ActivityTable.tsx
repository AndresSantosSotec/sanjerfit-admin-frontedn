import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';

export default function ActivityTable() {
  const [page, setPage] = useState(1);
  const { data, total, loading } = useActivities(page);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-sanjer-blue" />
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b font-medium">
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Ejercicio</th>
              <th className="px-4 py-2 text-left">Duración</th>
              <th className="px-4 py-2 text-left">Kcal</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr key={a.id} className="border-b">
                <td className="px-4 py-2">{a.user.name}</td>
                <td className="px-4 py-2">{a.exercise_type}</td>
                <td className="px-4 py-2">
                  {a.duration} {a.duration_unit}
                </td>
                <td className="px-4 py-2">{a.calories}</td>
                <td className="px-4 py-2">
                  {new Date(a.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* paginador simple */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-40"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          ◀
        </button>
        <span>{page}</span>
        <button
          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-40"
          disabled={page * 15 >= total}
          onClick={() => setPage(p => p + 1)}
        >
          ▶
        </button>
      </div>
    </>
  );
}
