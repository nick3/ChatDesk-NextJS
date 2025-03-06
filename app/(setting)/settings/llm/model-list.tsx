'use client';

import { useTranslations } from 'next-intl';
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LLMModel } from './types';

interface ModelListProps {
  models: LLMModel[];
  modelsModified: Record<string, boolean>;
  onAddModel: () => void;
  onModelChange: (id: string, field: string, value: string) => void;
  onModelInputBlur: (modelId: string) => void;
  onSaveModel: (model: LLMModel) => void;
  onDeleteModel: (id: string) => void;
  onBatchAddModels?: () => void;
  providerType?: string;
  saving: boolean;
}

export function ModelList({
  models,
  modelsModified,
  onAddModel,
  onModelChange,
  onModelInputBlur,
  onSaveModel,
  onDeleteModel,
  onBatchAddModels,
  providerType,
  saving
}: ModelListProps) {
  const t = useTranslations('llm');

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('models')}</h3>
        <div className="space-x-2">
          {providerType === 'openai' && onBatchAddModels && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBatchAddModels}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {t('importOpenAIModels')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddModel}
            disabled={saving}
          >
            <PlusCircle className="mr-2 size-4" />
            {t('addModel')}
          </Button>
        </div>
      </div>

      {models.length > 0 ? (
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className="flex items-end gap-2">
              <div className="grow grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`model-name-${model.id}`}>
                    {t('modelName')}
                  </Label>
                  <Input
                    id={`model-name-${model.id}`}
                    value={model.name}
                    onChange={(e) => onModelChange(model.id, 'name', e.target.value)}
                    onBlur={() => onModelInputBlur(model.id)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor={`model-id-${model.id}`}>
                    {t('modelId')}
                  </Label>
                  <Input
                    id={`model-id-${model.id}`}
                    value={model.modelId}
                    onChange={(e) => onModelChange(model.id, 'modelId', e.target.value)}
                    onBlur={() => onModelInputBlur(model.id)}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="flex space-x-1">
                {modelsModified[model.id] && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onSaveModel(model)}
                    disabled={saving}
                    title={t('save')}
                  >
                    <Save className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteModel(model.id)}
                  disabled={saving}
                  title={t('delete')}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {t('noModels')}
        </p>
      )}
    </div>
  );
}