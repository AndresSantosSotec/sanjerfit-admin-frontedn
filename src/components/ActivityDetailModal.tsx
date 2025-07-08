import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/hooks/useActivities';

interface Props {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  onValidate: (id: number, ok: boolean) => void;
}

export default function ActivityDetailModal({ open, onClose, activity, onValidate }: Props) {
  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de Actividad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm">
              <strong>Usuario:</strong> {activity.user.name}
            </p>
            <p className="text-sm">
              <strong>Tipo:</strong> {activity.exercise_type}
            </p>
            <p className="text-sm">
              <strong>Duración:</strong> {activity.duration} {activity.duration_unit}
            </p>
            <p className="text-sm">
              <strong>Fecha:</strong>{' '}
              {new Date(activity.created_at).toLocaleString()}
            </p>

            <p className="text-sm flex items-center gap-1">
              <strong>Estado:</strong>
              <Badge variant={activity.is_valid ? 'default' : 'destructive'}>
                {activity.is_valid ? 'Válida' : 'Inválida'}
              </Badge>

            </p>
            {activity.location_lat && activity.location_lng && (
              <p className="text-sm">
                <strong>Ubicación:</strong> {activity.location_lat},{' '}
                {activity.location_lng}
              </p>
            )}
            {activity.notes && (
              <p className="text-sm">
                <strong>Notas:</strong> {activity.notes}
              </p>
            )}
          </div>

          {activity.selfie_url && (
            <img
              src={activity.selfie_url}
              alt="Selfie"
              className="max-h-64 w-full object-contain rounded"
            />
          )}
          {activity.device_image_url && (
            <img
              src={activity.device_image_url}
              alt="Dispositivo"
              className="max-h-64 w-full object-contain rounded"
            />
          )}
          {activity.attachments_url && activity.attachments_url.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Adjuntos:</p>
              <ul className="list-disc list-inside text-sm">
                {activity.attachments_url.map(url => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sanjer-blue underline"
                    >
                      {url.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="destructive" onClick={() => onValidate(activity.id, false)}>
            Invalidar

          </Button>
          <Button variant="default" onClick={() => onValidate(activity.id, true)}>
            Validar

          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
