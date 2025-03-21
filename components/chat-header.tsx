'use client';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';

// 自定义模型信息类型
interface CustomModelInfo {
  provider: {
    id: string;
    name: string;
    type: string;
    apiKey: string;
    baseUrl: string;
  };
  model: {
    modelId: string;
    name: string;
  };
}

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  isCustomModel = false,
  customModelInfo = null,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isCustomModel?: boolean;
  customModelInfo?: CustomModelInfo | null;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const t = useTranslations('chat');
  const { width: windowWidth } = useWindowSize();
  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">{t('newChat')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('newChat')}</TooltipContent>
        </Tooltip>
      )}
      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}
      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.selectedModelId === nextProps.selectedModelId &&
    prevProps.isCustomModel === nextProps.isCustomModel &&
    JSON.stringify(prevProps.customModelInfo) === JSON.stringify(nextProps.customModelInfo)
  );
});
