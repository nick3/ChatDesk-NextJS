'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  PlusCircle, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  CardFooter,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ProviderIcon, PROVIDER_TYPES } from '@/components/ui/provider-icon';

// 模型服务商接口定义
interface LLMProvider {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  baseUrl: string;
  models?: Array<{id: string, name: string}>;
  isCustom?: boolean;
}

export default function LLMSettingsPage() {
  const t = useTranslations('llm');

  // 状态管理
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    // 模拟从API加载数据
    const mockProviders: LLMProvider[] = [
      {
        id: '1',
        name: 'OpenAI',
        type: PROVIDER_TYPES.OPENAI,
        apiKey: 'sk-**********',
        baseUrl: 'https://api.openai.com/v1'
      },
      {
        id: '2',
        name: 'Azure OpenAI',
        type: PROVIDER_TYPES.AZURE,
        apiKey: 'azure-**********',
        baseUrl: 'https://your-endpoint.openai.azure.com/'
      },
      {
        id: '3',
        name: t('customProvider'),
        type: PROVIDER_TYPES.CUSTOM,
        apiKey: 'key-**********',
        baseUrl: 'https://your-custom-api.com/v1',
        isCustom: true,
        models: [
          {id: 'model1', name: 'Custom Model 1'},
          {id: 'model2', name: 'Custom Model 2'}
        ]
      }
    ];
    
    setProviders(mockProviders);
    setSelectedProvider(mockProviders[0]);
  }, [t]);

  // 处理添加新的服务商
  const handleAddProvider = () => {
    const newProvider: LLMProvider = {
      id: Date.now().toString(),
      name: t('newProvider'),
      type: PROVIDER_TYPES.CUSTOM,
      apiKey: '',
      baseUrl: '',
      isCustom: true,
      models: []
    };
    
    setProviders([...providers, newProvider]);
    setSelectedProvider(newProvider);
  };

  // 处理删除服务商
  const handleDeleteProvider = (id: string) => {
    const updatedProviders = providers.filter(p => p.id !== id);
    setProviders(updatedProviders);
    
    if (selectedProvider?.id === id) {
      setSelectedProvider(updatedProviders.length > 0 ? updatedProviders[0] : null);
    }
    
    toast.success(t('providerDeleted'));
  };

  // 自动保存
  const saveChanges = (updatedProvider: LLMProvider) => {
    setSaving(true);
    
    // 模拟API保存
    setTimeout(() => {
      setProviders(providers.map(p => 
        p.id === updatedProvider.id ? updatedProvider : p
      ));
      setSaving(false);
      toast.success(t('settingsSaved'));
    }, 500);
  };

  // 更新表单值
  const handleFormChange = (field: string, value: any) => {
    if (!selectedProvider) return;
    
    const updatedProvider = { 
      ...selectedProvider, 
      [field]: value 
    };
    
    setSelectedProvider(updatedProvider);
    saveChanges(updatedProvider);
  };

  // 更新自定义模型
  const handleModelChange = (index: number, field: string, value: string) => {
    if (!selectedProvider || !selectedProvider.models) return;
    
    const updatedModels = [...selectedProvider.models];
    updatedModels[index] = {
      ...updatedModels[index],
      [field]: value
    };
    
    const updatedProvider = {
      ...selectedProvider,
      models: updatedModels
    };
    
    setSelectedProvider(updatedProvider);
    saveChanges(updatedProvider);
  };

  // 添加新模型
  const handleAddModel = () => {
    if (!selectedProvider) return;
    
    const updatedProvider = {
      ...selectedProvider,
      models: [
        ...(selectedProvider.models || []),
        { id: `model-${Date.now()}`, name: '' }
      ]
    };
    
    setSelectedProvider(updatedProvider);
    saveChanges(updatedProvider);
  };

  // 删除模型
  const handleDeleteModel = (index: number) => {
    if (!selectedProvider || !selectedProvider.models) return;
    
    const updatedModels = [...selectedProvider.models];
    updatedModels.splice(index, 1);
    
    const updatedProvider = {
      ...selectedProvider,
      models: updatedModels
    };
    
    setSelectedProvider(updatedProvider);
    saveChanges(updatedProvider);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 左侧服务商列表 */}
        <div className="md:col-span-1">
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
                    className={cn(
                      "flex items-center w-full text-left p-2 rounded-md cursor-pointer hover:bg-accent",
                      selectedProvider?.id === provider.id && "bg-accent"
                    )}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="mr-2">
                      <ProviderIcon type={provider.type} />
                    </div>
                    <span className="flex-grow truncate">{provider.name}</span>
                  </button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAddProvider}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addProvider')}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* 右侧配置表单 */}
        <div className="md:col-span-3">
          {selectedProvider ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedProvider.name}</CardTitle>
                  <CardDescription>
                    {t('configureProvider', { name: selectedProvider.name })}
                  </CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteProvider(selectedProvider.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider-name">{t('providerName')}</Label>
                    <Input 
                      id="provider-name"
                      value={selectedProvider.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="provider-type">{t('providerType')}</Label>
                    <Select 
                      value={selectedProvider.type}
                      onValueChange={(value) => handleFormChange('type', value)}
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
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Input 
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={selectedProvider.apiKey}
                      onChange={(e) => handleFormChange('apiKey', e.target.value)}
                      placeholder={t('enterApiKey')}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="base-url">{t('apiBaseUrl')}</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <AlertCircle className="h-4 w-4" />
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
                      value={selectedProvider.baseUrl}
                      onChange={(e) => handleFormChange('baseUrl', e.target.value)}
                      placeholder={t('enterBaseUrl')}
                    />
                  </div>
                </div>
                
                {/* 自定义模型配置（仅针对自定义服务商） */}
                {selectedProvider.isCustom && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{t('models')}</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddModel}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('addModel')}
                      </Button>
                    </div>
                    
                    {selectedProvider.models && selectedProvider.models.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProvider.models.map((model, index) => (
                          <div key={model.id || `model-${index}-${Date.now()}`} className="flex items-end gap-2">
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`model-name-${index}`}>
                                  {t('modelName')}
                                </Label>
                                <Input
                                  id={`model-name-${index}`}
                                  value={model.name}
                                  onChange={(e) => handleModelChange(index, 'name', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`model-id-${index}`}>
                                  {t('modelId')}
                                </Label>
                                <Input
                                  id={`model-id-${index}`}
                                  value={model.id}
                                  onChange={(e) => handleModelChange(index, 'id', e.target.value)}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteModel(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t('noModels')}
                      </p>
                    )}
                  </div>
                )}
                
                {saving && <p className="text-sm text-muted-foreground">{t('saving')}</p>}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">
                  {t('selectProviderPrompt')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}