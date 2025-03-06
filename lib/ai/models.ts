import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  LanguageModel,
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  // ImageGenerationModel,
} from 'ai';

// 默认模型ID，仅在没有用户配置的情况下使用
export const DEFAULT_MODEL_ID: string = 'default-model';

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

/**
 * 创建用户配置的语言模型
 * @param modelInfo 自定义模型信息
 * @returns 语言模型实例
 */
export function createCustomLanguageModel(modelInfo: CustomModelInfo): LanguageModel {
  const { provider, model } = modelInfo;
  
  switch (provider.type) {
    case 'openai':
      const openai = createOpenAI({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl || undefined
      });
      return openai(model.modelId);
    case 'anthropic':
      const anthropic = createAnthropic({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl || undefined
      });
      return anthropic(model.modelId) as LanguageModel;
    case 'mistral':
      const mistral = createMistral({
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl || undefined
      });
      return mistral(model.modelId) as LanguageModel;
    // case 'reasoning':
    //   // 创建一个带有推理能力的模型
    //   const baseProvider = createOpenAICompatible({
    //     name: provider.name,
    //     apiKey: provider.apiKey,
    //     baseURL: provider.baseUrl
    //   });
    //   return wrapLanguageModel({
    //     model: baseProvider(model.modelId),
    //     middleware: extractReasoningMiddleware({ tagName: 'think' }),
    //   });
    default:
      // 默认使用OpenAI兼容接口
      const customProvider = createOpenAICompatible({
        name: provider.name,
        apiKey: provider.apiKey,
        baseURL: provider.baseUrl
      });
      return customProvider(model.modelId) as LanguageModel;
  }
}

// /**
//  * 创建用户配置的图像模型
//  * @param modelInfo 自定义模型信息
//  * @returns 图像生成模型实例
//  */
// export function createCustomImageModel(modelInfo: CustomModelInfo): ImageGenerationModel {
//   const { provider, model } = modelInfo;
  
//   if (provider.type === 'openai') {
//     const openaiClient = openai({
//       apiKey: provider.apiKey,
//       baseURL: provider.baseUrl || undefined
//     });
//     return openaiClient.image(model.modelId);
//   }
  
//   // 默认使用OpenAI兼容接口
//   const customProvider = createOpenAICompatible({
//     name: provider.name,
//     apiKey: provider.apiKey,
//     baseURL: provider.baseUrl
//   });
//   return customProvider.image(model.modelId);
// }

// 用于存储用户配置的模型信息的接口
export interface ChatModel {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  providerInfo?: CustomModelInfo['provider'];
  modelInfo?: CustomModelInfo['model'];
}
