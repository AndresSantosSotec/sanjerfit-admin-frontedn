import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GeneralInfo } from '@/types/general-info';

interface Props {
  open: boolean;
  onClose: () => void;
  info: GeneralInfo | null;
}

export default function GeneralInfoDetailModal({ open, onClose, info }: Props) {
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{info.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="whitespace-pre-line text-sm">{info.content}</p>
          {info.image_url && (
            <img
              src={info.image_url}
              alt="imagen"
              className="w-full max-h-64 object-contain rounded"
            />
          )}
          {info.video_url && (
            <video
              src={info.video_url}
              controls
              className="w-full max-h-64 object-contain rounded"
            />
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
