import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <DialogContent className="max-w-2xl p-0">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-bold text-center sm:text-left">
              {info.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <p className="whitespace-pre-line leading-relaxed text-sm">
                {info.content}
              </p>
              {info.image_url && (
                <img
                  src={info.image_url}
                  alt="imagen"
                  className="w-full max-h-80 object-contain rounded"
                />
              )}
              {info.video_url && (
                <video
                  src={info.video_url}
                  controls
                  className="w-full max-h-80 object-contain rounded"
                />
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 pb-6 pt-4">
            <Button onClick={onClose}>Cerrar</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
