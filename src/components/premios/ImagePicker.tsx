import React, { useEffect, useState } from 'react';

type Mode = 'file' | 'url';

interface ImagePickerProps {
  mode: Mode;
  valueFile?: File | null;
  valueUrl?: string;
  onModeChange: (m: Mode) => void;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  accept?: string;
}

export default function ImagePicker({
  mode,
  valueFile,
  valueUrl,
  onModeChange,
  onFileChange,
  onUrlChange,
  onRemove,
  maxSizeMB = 2,
  accept = 'image/jpeg,image/png,image/webp',
}: ImagePickerProps) {
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (mode === 'file' && valueFile) {
      const url = URL.createObjectURL(valueFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (mode === 'url' && valueUrl) {
      setPreview(valueUrl);
    } else {
      setPreview('');
    }
  }, [mode, valueFile, valueUrl]);

  const handleFile = (f: File | null) => {
    setError('');
    if (f) {
      if (!accept.split(',').includes(f.type)) {
        setError('Formato inválido (solo jpeg, png, webp)');
        onFileChange(null);
        return;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo supera ${maxSizeMB}MB`);
        onFileChange(null);
        return;
      }
    }
    onFileChange(f);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-md border ${mode === 'file' ? 'bg-gray-100' : ''}`}
          onClick={() => { onModeChange('file'); onUrlChange(''); }}
        >
          Archivo
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-md border ${mode === 'url' ? 'bg-gray-100' : ''}`}
          onClick={() => { onModeChange('url'); onFileChange(null); }}
        >
          URL
        </button>
        {onRemove && (
          <button type="button" className="px-3 py-1.5 rounded-md border" onClick={onRemove}>
            Quitar
          </button>
        )}
      </div>

      {mode === 'file' ? (
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
      ) : (
        <input
          type="text"
          value={valueUrl || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border px-3 py-2"
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="h-24 rounded-md border object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
    </div>
  );
}
