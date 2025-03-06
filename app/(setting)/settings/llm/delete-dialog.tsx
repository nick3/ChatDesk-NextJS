'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DeleteDialogState } from './types';

interface DeleteDialogProps {
  state: DeleteDialogState;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  saving: boolean;
}

export function DeleteDialog({ state, onOpenChange, onConfirm, saving }: DeleteDialogProps) {
  const t = useTranslations('llm');

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state.type === 'provider' ? t('confirmDeleteProvider') : t('confirmDeleteModel')}
          </DialogTitle>
          <DialogDescription>
            {state.type === 'provider'
              ? t('deleteProviderWarning')
              : t('deleteModelWarning')
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}