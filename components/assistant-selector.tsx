'use client';

import { type ReactNode, useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  UserIcon,
} from './icons';

// 助手类型定义
export type Assistant = {
  id: string;
  name: string;
  systemPrompt: string;
  temperature?: number;
  modelId: string;
};

export function useAssistant({
  chatId,
  initialAssistantId,
}: {
  chatId: string;
  initialAssistantId?: string;
}) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(initialAssistantId);
  const [isLoading, setIsLoading] = useState(false);

  // 获取所有助手列表
  useEffect(() => {
    const fetchAssistants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/assistants');
        if (!response.ok) {
          throw new Error('Failed to fetch assistants');
        }
        const data = await response.json();
        setAssistants(data);
      } catch (error) {
        console.error('Error fetching assistants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  // 获取当前选中的助手
  // useEffect(() => {
  //   const fetchChatAssistant = async () => {
  //     if (!chatId) return;
      
  //     try {
  //       const response = await fetch(`/api/chats/${chatId}/assistant`);
  //       if (response.ok) {
  //         const data = await response.json();
  //         if (data && data.assistantId) {
  //           setSelectedAssistantId(data.assistantId);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching chat assistant:', error);
  //     }
  //   };

  //   if (chatId && !selectedAssistantId) {
  //     fetchChatAssistant();
  //   }
  // }, [chatId, selectedAssistantId]);

  // 更改选中的助手
  const changeAssistant = async (assistantId: string) => {
    setSelectedAssistantId(assistantId);
    
    if (chatId) {
      try {
        await fetch(`/api/chat/${chatId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assistantId }),
        });
      } catch (error) {
        console.error('Error updating chat assistant:', error);
      }
    }
  };

  const selectedAssistant = useMemo(() => {
    return assistants.find(assistant => assistant.id === selectedAssistantId);
  }, [assistants, selectedAssistantId]);

  return {
    assistants,
    selectedAssistant,
    selectedAssistantId,
    changeAssistant,
    isLoading
  };
}

export function AssistantSelector({
  chatId,
  className,
  initialAssistantId,
}: {
  chatId: string;
  initialAssistantId?: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('chat');

  const { assistants, selectedAssistant, changeAssistant } = useAssistant({
    chatId,
    initialAssistantId,
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
          disabled={assistants.length === 0}
        >
          <UserIcon />
          {selectedAssistant?.name || t('defaultAssistant')}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {assistants.map((assistant) => (
          <DropdownMenuItem
            key={assistant.id}
            onSelect={() => {
              changeAssistant(assistant.id);
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={assistant.id === selectedAssistant?.id}
          >
            <div className="flex flex-col gap-1 items-start">
              {assistant.name}
              {assistant.systemPrompt && (
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {assistant.systemPrompt.substring(0, 50)}
                  {assistant.systemPrompt.length > 50 ? '...' : ''}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}