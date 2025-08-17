import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Premio } from '@/types/premio';
import ImagePicker from './ImagePicker';

type Mode = 'create' | 'edit' | 'view';

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Premio;
  submitting?: boolean;
  onSubmit: (payload: FormData | Record<string, any>) => Promise<void>;
  onClose: () => void;
};

export default function PremioFormModal({ open, mode, initial, submitting, onSubmit, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      costo_fitcoins: 10,
      stock: 0,
      is_active: true as any,
    },
  });

  const readOnly = mode === 'view';

  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [showPicker, setShowPicker] = useState(true);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        reset({
          nombre: initial.nombre ?? '',
          descripcion: initial.descripcion ?? '',
          costo_fitcoins: initial.costo_fitcoins ?? 10,
          stock: initial.stock ?? 0,
          is_active: (initial.is_active ?? true) as any,
        });
        if (initial.image_url) {
          setShowPicker(false);
          setUrl(initial.image_url);
        } else {
          setShowPicker(true);
          setUrl('');
        }
      } else {
        reset();
        setShowPicker(true);
        setUrl('');
      }
      setFile(null);
      setImageMode('file');
      setRemoveImage(false);
    }
  }, [open, initial, reset]);

  if (!open) return null;

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
            data.is_active = data.is_active === true || data.is_active === 'true';
            const base: Record<string, any> = { ...data };

            if (mode === 'create') {
              if (imageMode === 'file' && file) {
                const fd = new FormData();
                Object.entries(base).forEach(([k, v]) => fd.append(k, String(v)));
                fd.append('image', file);
                await onSubmit(fd);
              } else if (imageMode === 'url' && url) {
                await onSubmit({ ...base, image_path: url });
              } else {
                await onSubmit(base);
              }
            } else if (mode === 'edit') {
              if (removeImage) {
                const fd = new FormData();
                Object.entries(base).forEach(([k, v]) => fd.append(k, String(v)));
                fd.append('remove_image', 'true');
                await onSubmit(fd);
              } else if (imageMode === 'file' && file) {
                const fd = new FormData();
                Object.entries(base).forEach(([k, v]) => fd.append(k, String(v)));
                fd.append('image', file);
                await onSubmit(fd);
              } else if (imageMode === 'url' && url && url !== initial?.image_url) {
                await onSubmit({ ...base, image_path: url });
              } else {
                await onSubmit(base);
              }
            }
          })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre*</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                aria-invalid={errors.nombre ? 'true' : 'false'}
                {...register('nombre', { required: 'Requerido' })}
              />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{String(errors.nombre.message)}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Costo (Fitcoins)*</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                aria-invalid={errors.costo_fitcoins ? 'true' : 'false'}
                {...register('costo_fitcoins', { required: 'Requerido', min: { value: 1, message: 'Mínimo 1' } })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stock*</label>
              <input
                type="number"
                min={0}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                aria-invalid={errors.stock ? 'true' : 'false'}
                {...register('stock', { required: 'Requerido', min: { value: 0, message: 'No negativo' } })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Activo</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                {...register('is_active')}
              >
                <option value={true as any}>Sí</option>
                <option value={false as any}>No</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                disabled={readOnly}
                {...register('descripcion')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Imagen</label>

              {!readOnly && !showPicker && initial?.image_url && !removeImage && (
                <div className="space-y-2">
                  <img
                    src={initial.image_url}
                    alt={initial.nombre || ''}
                    className="h-24 rounded-md border object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md border"
                      onClick={() => { setShowPicker(true); setImageMode('file'); }}
                    >
                      Reemplazar
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md border"
                      onClick={() => { setRemoveImage(true); setShowPicker(false); }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )}

              {removeImage && !showPicker && (
                <div className="text-sm text-red-600">
                  Se quitará la imagen.
                  <button type="button" className="ml-2 underline" onClick={() => setRemoveImage(false)}>
                    Deshacer
                  </button>
                </div>
              )}

              {readOnly && initial?.image_url && (
                <img
                  src={initial.image_url}
                  alt={initial.nombre || ''}
                  className="h-24 rounded-md border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}

              {!readOnly && showPicker && (
                <ImagePicker
                  mode={imageMode}
                  valueFile={file}
                  valueUrl={imageMode === 'url' ? url : ''}
                  onModeChange={(m) => {
                    setImageMode(m);
                    if (m === 'file') {
                      setUrl('');
                    } else {
                      setFile(null);
                    }
                  }}
                  onFileChange={setFile}
                  onUrlChange={setUrl}
                  onRemove={mode === 'edit' ? () => { setRemoveImage(true); setShowPicker(false); } : undefined}
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
