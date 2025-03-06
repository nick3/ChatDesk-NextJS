import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const isCustomModel = cookieStore.get('chat-model-is-custom')?.value === 'true';
  
  // 获取自定义模型信息
  let customModelInfo = null;
  if (isCustomModel) {
    const providerInfo = cookieStore.get('chat-model-provider')?.value;
    const modelInfo = cookieStore.get('chat-model-info')?.value;
    
    if (providerInfo && modelInfo) {
      try {
        customModelInfo = {
          provider: JSON.parse(providerInfo),
          model: JSON.parse(modelInfo)
        };
      } catch (e) {
        console.error('解析自定义模型信息失败', e);
      }
    }
  }
  
  // 如果没有选择模型，使用默认模型
  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  // 如果选择了模型，区分内置模型和自定义模型
  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
        isCustomModel={isCustomModel}
        customModelInfo={customModelInfo}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
