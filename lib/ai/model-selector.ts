import { cookies } from 'next/headers';
import type { LanguageModel } from 'ai';
import { DEFAULT_MODEL_ID, createCustomLanguageModel, type CustomModelInfo } from './models';

// 返回给调用者使用的模型选择结果
export interface ModelSelectionResult {
  model: LanguageModel;
  isCustomModel: boolean;
  modelId: string;
  customModelInfo?: CustomModelInfo;
}

// 识别成本较低的模型的关键词
const LOW_COST_MODEL_KEYWORDS = ['mini', 'lite', 'small', 'basic', 'turbo'];

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
 * 从自定义模型信息中查找成本最低的模型
 * @param customModelsList 用户配置的自定义模型列表
 * @returns 找到的最低成本模型信息，或undefined
 */
function findLowestCostModel(customModelInfoList: CustomModelInfo[]): CustomModelInfo | undefined {
  // 首先查找名称中包含低成本关键词的模型
  const lowCostModel = customModelInfoList.find(model => 
    isLowCostModel(model.model.name) || isLowCostModel(model.model.modelId)
  );

  // 如果找到则返回，否则默认返回列表中的第一个模型
  return lowCostModel || customModelInfoList[0];
}

/**
 * 获取用户存储在Cookie中的所有自定义模型
 * @returns 自定义模型列表
 */
async function getUserConfiguredModels(): Promise<CustomModelInfo[]> {
  try {
    const cookieStore = await cookies();
    const modelsJson = cookieStore.get('user-configured-models')?.value;
    
    if (!modelsJson) {
      return [];
    }
    
    return JSON.parse(modelsJson);
  } catch (error) {
    console.error('Error parsing user configured models:', error);
    return [];
  }
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
  const selectedModelId = cookieStore.get('chat-model')?.value || DEFAULT_MODEL_ID;
  const isCustomModel = cookieStore.get('chat-model-is-custom')?.value === 'true';

  // 获取用户配置的所有模型
  const userModels = await getUserConfiguredModels();
  
  // 如果没有任何用户配置的模型，返回错误信息
  if (userModels.length === 0) {
    throw new Error('No models configured. Please configure at least one model in settings.');
  }

  // 获取当前选择的模型信息
  let customModelInfo: CustomModelInfo | undefined;

  if (isCustomModel) {
    try {
      const providerInfoJson = cookieStore.get('chat-model-provider')?.value;
      const modelInfoJson = cookieStore.get('chat-model-info')?.value;
      
      if (!providerInfoJson || !modelInfoJson) {
        // 如果当前选择的模型信息不完整，则使用第一个用户配置的模型
        customModelInfo = userModels[0];
      } else {
        const providerInfo = JSON.parse(providerInfoJson);
        const modelInfo = JSON.parse(modelInfoJson);
        
        // 构建自定义模型信息
        customModelInfo = {
          provider: providerInfo,
          model: modelInfo
        };
      }
    } catch (error) {
      console.error('Error parsing custom model information:', error);
      // 出错时使用第一个用户配置的模型
      customModelInfo = userModels[0];
    }
  } else {
    // 如果不是显式选择的自定义模型，但有用户配置的模型，则使用第一个
    customModelInfo = userModels[0];
  }

  // 如果需要低成本模型，尝试找到一个
  if (useLowCostModel && userModels.length > 1) {
    const lowCostModelInfo = findLowestCostModel(userModels);
    if (lowCostModelInfo) {
      customModelInfo = lowCostModelInfo;
    }
  }

  // 确保有模型可用
  if (!customModelInfo) {
    throw new Error('No valid model found. Please check your model configurations in settings.');
  }

  // 创建并返回选择的模型
  try {
    const model = createCustomLanguageModel(customModelInfo);
    return {
      model,
      isCustomModel: true,
      modelId: customModelInfo.model.modelId,
      customModelInfo
    };
  } catch (error) {
    console.error('Error creating language model:', error);
    throw new Error(`Failed to create model: ${(error as Error).message}`);
  }
}