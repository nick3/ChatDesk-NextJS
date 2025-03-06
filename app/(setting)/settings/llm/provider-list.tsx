'use client';

import { useTranslations } from 'next-intl';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderIcon } from '@/components/ui/provider-icon';
import { cn } from '@/lib/utils';
import { LLMProvider } from './types';

interface ProviderListProps {
  providers: LLMProvider[];
  selectedProvider: LLMProvider | null;
  onSelectProvider: (provider: LLMProvider) => void;
  onAddProvider: () => void;
  saving: boolean;
}

export function ProviderList({
  providers,
  selectedProvider,
  onSelectProvider,
  onAddProvider,
  saving
}: ProviderListProps) {
  const t = useTranslations('llm');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('providers')}</CardTitle>
        <CardDescription>{t('providersDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {providers.map(provider => (
            <button
              key={provider.id}
              type="button"
              className={cn(
                "flex items-center w-full text-left p-2 rounded-md cursor-pointer hover:bg-accent",
                selectedProvider?.id === provider.id && "bg-accent"
              )}
              onClick={() => onSelectProvider(provider)}
            >
              <div className="mr-2">
                <ProviderIcon type={provider.type} />
              </div>
              <span className="grow truncate">{provider.name}</span>
            </button>
          ))}

          {providers.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              {t('noProviders')}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onAddProvider}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 size-4" />
          )}
          {t('addProvider')}
        </Button>
      </CardContent>
    </Card>
  );
}