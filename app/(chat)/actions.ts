'use server';

import { generateText, type Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { getSelectedLanguageModel } from '@/lib/ai/model-selector';

// 更新模型保存函数，支持保存自定义模型信息
export async function saveChatModelAsCookie({
  modelId,
  isCustom = false,
  providerInfo = null,
  modelInfo = null
}: {
  modelId: string;
  isCustom?: boolean;
  providerInfo?: {
    id: string;
    name: string;
    type: string;
    apiKey: string;
    baseUrl: string;
  } | null;
  modelInfo?: {
    modelId: string;
    name: string;
  } | null;
}) {
  const cookieStore = await cookies();
  
  // 保存模型ID
  cookieStore.set('chat-model', modelId);
  
  // 保存是否为自定义模型
  cookieStore.set('chat-model-is-custom', String(isCustom));
  
  // 如果是自定义模型，额外保存提供商和模型详细信息
  if (isCustom && providerInfo && modelInfo) {
    cookieStore.set('chat-model-provider', JSON.stringify(providerInfo));
    cookieStore.set('chat-model-info', JSON.stringify(modelInfo));
  } else {
    // 如果不是自定义模型，清除之前可能存在的自定义模型信息
    cookieStore.delete('chat-model-provider');
    cookieStore.delete('chat-model-info');
  }
}

export async function generateTitleFromUserMessage({
  message,
  selectedModelId,
}: {
  message: Message;
  selectedModelId: string;
}) {
  // 使用模型选择器获取低成本模型用于生成标题
  const { model } = await getSelectedLanguageModel({ useLowCostModel: true });
  
  const { text: title } = await generateText({
    model,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
