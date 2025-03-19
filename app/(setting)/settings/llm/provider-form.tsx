'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Trash2, Eye, EyeOff, AlertCircle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PROVIDER_TYPES } from '@/components/ui/provider-icon';
import type { LLMProvider , LLMModel } from './types';
import { ModelList } from './model-list';

interface ProviderFormProps {
  provider: LLMProvider;
  models: LLMModel[];
  modelsModified: Record<string, boolean>;
  providerModified: boolean;
  saving: boolean;
  onProviderChange: (field: string, value: any) => void;
  onProviderInputBlur: () => void;
  onSaveProvider: () => void;
  onDeleteProvider: (id: string) => void;
  onAddModel: () => void;
  onModelChange: (id: string, field: string, value: string) => void;
  onModelInputBlur: (modelId: string) => void;
  onDeleteModel: (id: string) => void;
  onBatchAddModels: () => void;
}

export function ProviderForm({
  provider,
  models,
  modelsModified,
  providerModified,
  saving,
  onProviderChange,
  onProviderInputBlur,
  onSaveProvider,
  onDeleteProvider,
  onAddModel,
  onModelChange,
  onModelInputBlur,
  onDeleteModel,
  onBatchAddModels
}: ProviderFormProps) {
  const t = useTranslations('llm');
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{provider.name}</CardTitle>
          <CardDescription>
            {t('configureProvider', { name: provider.name })}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {providerModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveProvider}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t('save')}
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteProvider(provider.id)}
            disabled={saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="provider-name">{t('providerName')}</Label>
            <Input
              id="provider-name"
              value={provider.name}
              onChange={(e) => onProviderChange('name', e.target.value)}
              onBlur={onProviderInputBlur}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="provider-type">{t('providerType')}</Label>
            <Select
              value={provider.type}
              onValueChange={(value) => onProviderChange('type', value)}
              disabled={saving}
            >
              <SelectTrigger id="provider-type">
                <SelectValue placeholder={t('selectProviderType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PROVIDER_TYPES.OPENAI}>OpenAI</SelectItem>
                <SelectItem value={PROVIDER_TYPES.AZURE}>Azure OpenAI</SelectItem>
                <SelectItem value={PROVIDER_TYPES.ANTHROPIC}>Anthropic</SelectItem>
                <SelectItem value={PROVIDER_TYPES.DEEPSEEK}>DeepSeek</SelectItem>
                <SelectItem value={PROVIDER_TYPES.GOOGLE}>Google AI</SelectItem>
                <SelectItem value={PROVIDER_TYPES.XAI}>xAI</SelectItem>
                <SelectItem value={PROVIDER_TYPES.OLLAMA}>Ollama</SelectItem>
                <SelectItem value={PROVIDER_TYPES.CUSTOM}>{t('custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key">{t('apiKey')}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                type="button"
                disabled={saving}
              >
                {showApiKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
            <Input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              value={provider.apiKey}
              onChange={(e) => onProviderChange('apiKey', e.target.value)}
              onBlur={onProviderInputBlur}
              placeholder={t('enterApiKey')}
              disabled={saving}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="base-url">{t('apiBaseUrl')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <AlertCircle className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('apiBaseUrlTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="base-url"
              value={provider.baseUrl}
              onChange={(e) => onProviderChange('baseUrl', e.target.value)}
              onBlur={onProviderInputBlur}
              placeholder={t('enterBaseUrl')}
              disabled={saving}
            />
          </div>
        </div>

        {/* 模型列表组件 */}
        <ModelList 
          models={models}
          modelsModified={modelsModified}
          onAddModel={onAddModel}
          onModelChange={onModelChange}
          onModelInputBlur={onModelInputBlur}
          onDeleteModel={onDeleteModel}
          onBatchAddModels={onBatchAddModels}
          providerType={provider.type}
          saving={saving}
        />

        {saving && <p className="text-sm text-muted-foreground">{t('saving')}</p>}
        {/* 添加状态指示器 */}
        {providerModified && !saving && (
          <p className="text-sm text-amber-500">{t('unsavedChanges')}</p>
        )}
        {!providerModified && !saving && Object.values(modelsModified).some(v => v) && (
          <p className="text-sm text-amber-500">{t('unsavedModelChanges')}</p>
        )}
      </CardContent>
    </Card>
  );
}