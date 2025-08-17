import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Premio } from '@/types/premio';

type Props = {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  initial?: Partial<Premio>;
  submitting?: boolean;
  onSubmit: (data: any) => Promise<void> | void;
  onClose: () => void;
};

export default function PremioFormModal({ open, mode, initial, submitting, onSubmit, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      costo_fitcoins: 10,
      stock: 0,
      is_active: true as any,
      image_path: '',
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        nombre: initial.nombre ?? '',
        descripcion: initial.descripcion ?? '',
        costo_fitcoins: initial.costo_fitcoins ?? 10,
        stock: initial.stock ?? 0,
        is_active: (initial.is_active ?? true) as any,
        image_path: initial.image_path ?? '',
      });
    }
  }, [initial, reset]);

  if (!open) return null;

  const readOnly = mode === 'view';
  const imagePath = watch('image_path');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Nuevo premio' : mode === 'edit' ? 'Editar premio' : 'Detalle del premio'}
          </h2>
          <button className="rounded-full border w-9 h-9" onClick={onClose}>✕</button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (data) => {
            if (readOnly) return;
            data.costo_fitcoins = Number(data.costo_fitcoins);
            data.stock = Number(data.stock);
            data.is_active = (data.is_active === true || data.is_active === 'true');
            await onSubmit(data);
          })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre*</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                {...register('nombre', { required: 'Requerido' })} />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{String(errors.nombre.message)}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Costo (Fitcoins)*</label>
              <input type="number" min={1} className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                {...register('costo_fitcoins', { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } })} />
            </div>

            <div>
              <label className="text-sm font-medium">Stock*</label>
              <input type="number" min={0} className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                {...register('stock', { required: 'Requerido', min: { value: 0, message: 'No negativo' } })} />
            </div>

            <div>
              <label className="text-sm font-medium">Activo</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2" disabled={readOnly} {...register('is_active')}>
                <option value={true as any}>Sí</option>
                <option value={false as any}>No</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea rows={3} className="mt-1 w-full rounded-lg border px-3 py-2" disabled={readOnly}
                {...register('descripcion')} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Imagen (ruta/URL)</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" disabled={readOnly}
                {...register('image_path')} />
              {(imagePath || initial?.image_url) && (
                <img
                  className="h-24 mt-2 rounded-md border object-cover"
                  src={(imagePath as string) || (initial?.image_url ?? '')}
                  onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 rounded-lg border" onClick={onClose}>
              {readOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!readOnly && (
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60">
                {submitting ? 'Guardando…' : mode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
