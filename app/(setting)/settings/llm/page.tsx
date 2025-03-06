'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';

// 导入拆分的组件
import { LLMProvider, LLMModel, DeleteDialogState } from './types';
import { ProviderList } from './provider-list';
import { ProviderForm } from './provider-form';
import { DeleteDialog } from './delete-dialog';

export default function LLMSettingsPage() {
  const t = useTranslations('llm');

  // 状态管理
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 删除对话框状态
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>({
    open: false,
    type: null,
    itemId: null
  });
  
  // 添加修改状态跟踪
  const [providerModified, setProviderModified] = useState(false);
  const [modelsModified, setModelsModified] = useState<Record<string, boolean>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化加载数据
  useEffect(() => {
    fetchProviders();
  }, []);

  // 当选择了提供商后，加载其模型
  useEffect(() => {
    if (selectedProvider) {
      fetchModels(selectedProvider.id);
    } else {
      setModels([]);
    }
  }, [selectedProvider]);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // 获取所有提供商
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProviders(data.providers || []);
      
      if (data.providers && data.providers.length > 0) {
        setSelectedProvider(data.providers[0]);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  // 获取指定提供商的模型
  const fetchModels = async (providerId: string) => {
    try {
      const response = await fetch(`/api/model?providerId=${providerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setModels(data.models || []);
      setModelsModified({}); // 重置修改状态
    } catch (error) {
      console.error('Failed to fetch models:', error);
      toast.error(t('loadModelsError'));
    }
  };

  // 处理添加新的服务商
  const handleAddProvider = () => {
    const newProvider: LLMProvider = {
      id: generateUUID(),
      name: t('newProvider'),
      type: 'custom',
      apiKey: '',
      baseUrl: '',
      isCustom: true
    };
    
    setProviders([...providers, newProvider]);
    setSelectedProvider(newProvider);
    setModels([]);
    
    // 保存到服务器
    saveProvider(newProvider);
  };

  // 清除待处理的保存定时器
  const clearPendingSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };

  // 更新表单值
  const handleProviderChange = (field: string, value: any) => {
    if (!selectedProvider) return;
    
    const updatedProvider = { 
      ...selectedProvider, 
      [field]: value 
    };
    
    setSelectedProvider(updatedProvider);
    setProviderModified(true);
    
    // 如果是选择框，立即保存
    if (field === 'type') {
      saveProvider(updatedProvider);
      return;
    }
    
    // 对于文本输入，使用更长的防抖时间
    clearPendingSave();
    saveTimeoutRef.current = setTimeout(() => {
      saveProvider(updatedProvider);
    }, 2000);
  };

  // 处理输入框失去焦点时保存
  const handleProviderInputBlur = () => {
    if (!selectedProvider || !providerModified) return;
    
    clearPendingSave();
    saveProvider(selectedProvider);
  };
  
  // 手动保存提供商设置
  const handleSaveProvider = () => {
    if (!selectedProvider || !providerModified) return;
    
    clearPendingSave();
    saveProvider(selectedProvider);
  };

  // 保存提供商到服务器
  const saveProvider = async (providerData: LLMProvider) => {
    setSaving(true);
    
    // 检查是新建还是更新
    const isNew = !providers.some(p => p.id === providerData.id && !p.isCustom);
    
    try {
      const response = await fetch('/api/provider', {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 如果是新建，不需要更新providers，因为已经在UI中添加了
      if (!isNew) {
        setProviders(providers.map(p => 
          p.id === providerData.id ? providerData : p
        ));
      }
      
      setProviderModified(false);
      toast.success(t('settingsSaved'));
    } catch (error) {
      console.error('Failed to save provider:', error);
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  // 添加新模型
  const handleAddModel = () => {
    if (!selectedProvider) return;
    
    const newModel: LLMModel = {
      id: generateUUID(),
      providerId: selectedProvider.id,
      modelId: '',
      name: t('newModel')
    };
    
    // 只在本地添加模型，不立即调用API保存
    setModels([...models, newModel]);
    
    // 标记该模型为已修改，等待用户保存
    setModelsModified(prev => ({
      ...prev,
      [newModel.id]: true
    }));
  };

  // 更新模型数据
  const handleModelChange = (id: string, field: string, value: string) => {
    const updatedModels = models.map(model => {
      if (model.id === id) {
        return { ...model, [field]: value };
      }
      return model;
    });
    
    setModels(updatedModels);
    
    // 标记该模型为已修改
    setModelsModified(prev => ({
      ...prev,
      [id]: true
    }));
    
    // 找到被修改的模型
    const updatedModel = updatedModels.find(m => m.id === id);
    
    if (updatedModel) {
      // 为每个模型使用单独的防抖定时器
      clearTimeout(Number(updatedModel.id + '_timer'));
      const timerId = setTimeout(() => {
        saveModel(updatedModel, false); // 使用false表示非用户主动触发的保存
      }, 2000);
      
      // 将定时器ID存储在DOM元素上，以便后续清除
      (window as any)[updatedModel.id + '_timer'] = timerId;
    }
  };

  // 处理模型输入框失去焦点
  const handleModelInputBlur = (modelId: string) => {
    // 清除对应模型的定时器
    clearTimeout(Number((window as any)[modelId + '_timer']));
    
    // 如果模型已修改，立即保存
    if (modelsModified[modelId]) {
      const modelToSave = models.find(m => m.id === modelId);
      if (modelToSave) {
        saveModel(modelToSave, false); // 使用false表示非用户主动触发的保存
      }
    }
  };

  // 保存模型到服务器
  const saveModel = async (modelData: LLMModel, isUserAction: boolean = false) => {
    // 验证必填字段 - 仅在用户主动点击保存按钮时执行验证
    if (isUserAction && (!modelData.providerId || !modelData.modelId || !modelData.name)) {
      toast.error(t('modelFieldsRequired'));
      return;
    }
    
    // 自动保存时，如果必填字段未完成，则不发送请求
    if (!isUserAction && (!modelData.providerId || !modelData.modelId || !modelData.name)) {
      console.log('模型必填字段未完成，取消自动保存');
      return;
    }
    
    setSaving(true);
    
    // 检查是新建还是更新
    const isNew = !models.some(m => m.id === modelData.id && m.providerId !== '');
    
    try {
      console.log(`正在${isNew ? '创建' : '更新'}模型，URL: /api/model`, modelData);
      
      const response = await fetch('/api/model', {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API 错误 (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
      
      // 如果是新建，不需要更新models，因为已经在UI中添加了
      if (!isNew) {
        setModels(models.map(m => 
          m.id === modelData.id ? modelData : m
        ));
      }
      
      // 清除该模型的修改标记
      setModelsModified(prev => ({
        ...prev,
        [modelData.id]: false
      }));
      
      toast.success(t('modelSaved'));
    } catch (error) {
      console.error('Failed to save model:', error);
      toast.error(t('saveModelError'));
    } finally {
      setSaving(false);
    }
  };

  // 处理删除服务商确认
  const confirmDeleteProvider = (id: string) => {
    setDeleteDialogState({
      open: true,
      type: 'provider',
      itemId: id
    });
  };

  // 处理删除服务商
  const handleDeleteProvider = async () => {
    const providerId = deleteDialogState.itemId;
    if (!providerId) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/provider?id=${providerId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedProviders = providers.filter(p => p.id !== providerId);
      setProviders(updatedProviders);
      
      if (selectedProvider?.id === providerId) {
        setSelectedProvider(updatedProviders.length > 0 ? updatedProviders[0] : null);
      }
      
      toast.success(t('providerDeleted'));
    } catch (error) {
      console.error('Failed to delete provider:', error);
      toast.error(t('deleteError'));
    } finally {
      setSaving(false);
      setDeleteDialogState({ open: false, type: null, itemId: null });
    }
  };

  // 确认删除模型
  const confirmDeleteModel = (id: string) => {
    setDeleteDialogState({
      open: true,
      type: 'model',
      itemId: id
    });
  };

  // 处理删除模型
  const handleDeleteModel = async () => {
    const modelId = deleteDialogState.itemId;
    if (!modelId) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/model?id=${modelId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setModels(models.filter(m => m.id !== modelId));
      toast.success(t('modelDeleted'));
    } catch (error) {
      console.error('Failed to delete model:', error);
      
      // 检查是否是由于模型被助手使用而无法删除
      if (error instanceof Error && error.message.includes('使用')) {
        toast.error(t('modelInUse'));
      } else {
        toast.error(t('deleteModelError'));
      }
    } finally {
      setSaving(false);
      setDeleteDialogState({ open: false, type: null, itemId: null });
    }
  };

  // 批量添加模型
  const handleBatchAddModels = async () => {
    if (!selectedProvider) return;
    
    // 这里可以实现批量导入模型的逻辑
    // 例如从文件导入或从API获取可用模型列表
    // 暂时使用模拟数据演示批量添加
    
    const modelsToAdd = [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ];
    
    try {
      setSaving(true);
      const response = await fetch('/api/model', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          models: modelsToAdd
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 重新获取模型列表
      fetchModels(selectedProvider.id);
      toast.success(t('modelsBatchAdded'));
    } catch (error) {
      console.error('Failed to batch add models:', error);
      toast.error(t('batchAddError'));
    } finally {
      setSaving(false);
    }
  };

  // 确认删除对话框状态变更处理
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteDialogState({ open, type: null, itemId: null });
    } else {
      setDeleteDialogState({ ...deleteDialogState, open });
    }
  };

  // 确认删除处理
  const handleConfirmDelete = async () => {
    if (deleteDialogState.type === 'provider') {
      await handleDeleteProvider();
    } else if (deleteDialogState.type === 'model') {
      await handleDeleteModel();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 左侧服务商列表 */}
        <div className="md:col-span-1">
          <ProviderList 
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            onAddProvider={handleAddProvider}
            saving={saving}
          />
        </div>
        
        {/* 右侧配置表单 */}
        <div className="md:col-span-3">
          {selectedProvider ? (
            <ProviderForm 
              provider={selectedProvider}
              models={models}
              modelsModified={modelsModified}
              providerModified={providerModified}
              saving={saving}
              onProviderChange={handleProviderChange}
              onProviderInputBlur={handleProviderInputBlur}
              onSaveProvider={handleSaveProvider}
              onDeleteProvider={confirmDeleteProvider}
              onAddModel={handleAddModel}
              onModelChange={handleModelChange}
              onModelInputBlur={handleModelInputBlur}
              onSaveModel={(model) => saveModel(model, true)} // 添加true参数表示用户主动触发
              onDeleteModel={confirmDeleteModel}
              onBatchAddModels={handleBatchAddModels}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">
                  {providers.length > 0 
                    ? t('selectProviderPrompt')
                    : t('addProviderPrompt')
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 删除确认对话框组件 */}
      <DeleteDialog 
        state={deleteDialogState}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleConfirmDelete}
        saving={saving}
      />
    </div>
  );
}