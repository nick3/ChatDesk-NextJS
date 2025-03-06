import { cookies } from 'next/headers';
import { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { myProvider } from './models';

// 自定义模型信息类型
export interface CustomModelInfo {
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

// 返回给调用者使用的模型选择结果
export interface ModelSelectionResult {
  model: LanguageModel;
  isCustomModel: boolean;
  modelId: string;
  customModelInfo?: CustomModelInfo;
}

// 识别成本较低的模型的关键词
const LOW_COST_MODEL_KEYWORDS = ['lite', 'mini', 'small', 'basic', 'turbo', 'pro', 'max'];

/**
 * 检测模型名称是否包含低成本关键词
 * @param modelName 模型名称
 * @returns 是否为低成本模型
 */
function isLowCostModel(modelName: string): boolean {
  return LOW_COST_MODEL_KEYWORDS.some(keyword => 
    modelName.toLowerCase().includes(keyword.toLowerCase()));
}

/**
 * 从自定义模型列表中查找成本最低的模型
 * @param customModelsList 用户配置的自定义模型列表
 * @returns 找到的最低成本模型信息，或undefined
 */
function findLowestCostCustomModel(customModelsList: CustomModelInfo[]): CustomModelInfo | undefined {
  // 首先查找名称中包含低成本关键词的模型
  const lowCostModel = customModelsList.find(model => 
    isLowCostModel(model.model.name) || isLowCostModel(model.model.modelId)
  );

  // 如果找到则返回，否则默认返回列表中的第一个模型
  return lowCostModel || customModelsList[0];
}

/**
 * 根据当前用户选择的模型配置，返回相应的语言模型
 * @param options 选项配置
 * @param options.useLowCostModel 是否优先使用低成本模型(适用于生成标题等简单任务)
 * @returns 选定的模型结果
 */
export async function getSelectedLanguageModel({
  useLowCostModel = false,
}: {
  useLowCostModel?: boolean;
} = {}): Promise<ModelSelectionResult> {
  // 获取cookie中存储的模型选择信息
  const cookieStore = await cookies();
  const selectedModelId = cookieStore.get('chat-model')?.value || 'chat-model-small';
  const isCustomModel = cookieStore.get('chat-model-is-custom')?.value === 'true';

  // 如果是使用自定义模型
  if (isCustomModel) {
    try {
      const providerInfoJson = cookieStore.get('chat-model-provider')?.value;
      const modelInfoJson = cookieStore.get('chat-model-info')?.value;
      
      if (!providerInfoJson || !modelInfoJson) {
        // 自定义模型信息不完整，回退到默认模型
        return {
          model: myProvider.languageModel('chat-model-small') as unknown as LanguageModel,
          isCustomModel: false,
          modelId: 'chat-model-small'
        };
      }
      
      const providerInfo = JSON.parse(providerInfoJson);
      const modelInfo = JSON.parse(modelInfoJson);
      
      // 构建自定义模型信息
      const customModelInfo: CustomModelInfo = {
        provider: providerInfo,
        model: modelInfo
      };
      
      // 创建自定义模型实例
      let customModel;
      
      // 根据提供商类型选择不同的调用方式
      switch (providerInfo.type) {
        case 'openai':
          const openai = createOpenAI({
            apiKey: providerInfo.apiKey,
            baseURL: providerInfo.baseUrl || undefined
          });
          customModel = openai(modelInfo.modelId);
          break;
        case 'anthropic':
          const anthropic = createAnthropic({
            apiKey: providerInfo.apiKey,
            baseURL: providerInfo.baseUrl || undefined
          });
          customModel = anthropic(modelInfo.modelId);
          break;
        case 'mistral':
          const mistral = createMistral({
            apiKey: providerInfo.apiKey,
            baseURL: providerInfo.baseUrl || undefined
          });
          customModel = mistral(modelInfo.modelId);
          break;
        default:
          const customProvider = createOpenAICompatible({
            name: providerInfo.name,
            apiKey: providerInfo.apiKey,
            baseURL: providerInfo.baseUrl
          });
          customModel = customProvider(modelInfo.modelId);
      }
      
      return {
        model: customModel as unknown as LanguageModel,
        isCustomModel: true,
        modelId: selectedModelId,
        customModelInfo
      };
    } catch (error) {
      console.error('Error parsing custom model information:', error);
      // 出错时回退到默认模型
      return {
        model: myProvider.languageModel('chat-model-small') as unknown as LanguageModel,
        isCustomModel: false,
        modelId: 'chat-model-small'
      };
    }
  } else {
    // 使用内置模型
    // 如果需要低成本模型且当前选择的不是低成本模型
    if (useLowCostModel && selectedModelId === 'chat-model-large') {
      // 对于内置模型，我们知道chat-model-small是更低成本的选项
      return {
        model: myProvider.languageModel('chat-model-small') as unknown as LanguageModel,
        isCustomModel: false,
        modelId: 'chat-model-small'
      };
    }
    
    // 如果是用于标题生成，统一使用title-model
    if (useLowCostModel && selectedModelId !== 'title-model') {
      return {
        model: myProvider.languageModel('title-model') as unknown as LanguageModel,
        isCustomModel: false,
        modelId: 'title-model'
      };
    }
    
    // 否则使用用户选择的模型
    return {
      model: myProvider.languageModel(selectedModelId) as unknown as LanguageModel,
      isCustomModel: false,
      modelId: selectedModelId
    };
  }
}