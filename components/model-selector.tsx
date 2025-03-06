'use client';
import { startTransition, useEffect, useMemo, useOptimistic, useState } from 'react';
import { useTranslations } from 'next-intl';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon, LoaderIcon } from './icons';

// 定义用户自定义模型的类型
interface UserModel {
  id: string;
  modelId: string;
  name: string;
  provider: {
    id: string;
    name: string;
    type: string;
    apiKey: string;
    baseUrl: string;
  };
}

// 修改模型选择器组件，支持显示用户自定义模型
export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const t = useTranslations('chat');
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);
  
  // 用户自定义模型的状态
  const [userModels, setUserModels] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 找到选中的模型
  const selectedModel = useMemo(() => {
    // 从用户模型中查找
    const userModel = userModels.find((model) => model.id === optimisticModelId);
    if (userModel) return { name: `${userModel.name} (${userModel.provider.name})` };
    
    // 如果没找到，返回默认显示
    return { name: t('selectModel') };
  }, [optimisticModelId, userModels, t]);
  
  // 获取用户自定义模型
  useEffect(() => {
    const fetchUserModels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setUserModels(data.models || []);
        
        // 如果有模型但当前没有选中任何模型，自动选择第一个模型
        if ((data.models || []).length > 0 && !optimisticModelId) {
          const firstModel = data.models[0];
          startTransition(() => {
            setOptimisticModelId(firstModel.id);
            saveChatModelAsCookie({ 
              modelId: firstModel.id, 
              isCustom: true,
              providerInfo: firstModel.provider,
              modelInfo: {
                modelId: firstModel.modelId,
                name: firstModel.name
              }
            });
          });
        }
      } catch (error) {
        console.error('Failed to fetch user models:', error);
        setError('Failed to load models');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserModels();
  }, [optimisticModelId]);

  // 保存用户配置模型列表到cookie
  useEffect(() => {
    if (userModels.length > 0) {
      // 将用户配置的模型信息转换为CustomModelInfo格式
      const customModelsInfo = userModels.map(model => ({
        provider: model.provider,
        model: {
          modelId: model.modelId,
          name: model.name
        }
      }));
      
      // 保存到cookie中
      document.cookie = `user-configured-models=${JSON.stringify(customModelsInfo)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1年有效期
    }
  }, [userModels]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {loading ? <LoaderIcon /> : null}
          {selectedModel.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {loading ? (
          <DropdownMenuItem disabled>
            <LoaderIcon />
            {t('loading')}
          </DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem disabled className="text-destructive">
            {error}
          </DropdownMenuItem>
        ) : (
          userModels.map((userModel) => (
            <DropdownMenuItem
              key={userModel.id}
              onSelect={() => {
                setOpen(false);
                startTransition(() => {
                  setOptimisticModelId(userModel.id);
                  saveChatModelAsCookie({ 
                    modelId: userModel.id, 
                    isCustom: true,
                    providerInfo: userModel.provider,
                    modelInfo: {
                      modelId: userModel.modelId,
                      name: userModel.name
                    }
                  });
                });
              }}
              className="gap-4 group/item flex flex-row justify-between items-center"
              data-active={userModel.id === optimisticModelId}
            >
              <div className="flex flex-col gap-1 items-start">
                <div>{userModel.name}</div>
                <div className="text-xs text-muted-foreground">
                  {userModel.provider.name} • {userModel.modelId}
                </div>
              </div>
              <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                <CheckCircleFillIcon />
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {!loading && !error && userModels.length === 0 && (
          <DropdownMenuItem disabled>
            {t('noModelsConfigured')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
