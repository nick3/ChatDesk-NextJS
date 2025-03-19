import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const isCustomModel = cookieStore.get('chat-model-is-custom')?.value === 'true';
  
  // 获取用户配置的模型列表
  const userModelsJson = cookieStore.get('user-configured-models')?.value;
  let userModels = [];
  
  if (userModelsJson) {
    try {
      userModels = JSON.parse(userModelsJson);
    } catch (e) {
      console.error('解析用户配置模型列表失败', e);
    }
  }
  
  // // 如果没有配置任何模型，重定向到设置页面
  // if (userModels.length === 0) {
  //   redirect('/settings/llm');
  // }
  
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
  
  // 如果没有选择模型，使用第一个可用的模型ID
  if (!modelIdFromCookie) {
    const firstModelId = userModels.length > 0 
      ? userModels[0].model.modelId 
      : DEFAULT_MODEL_ID;
      
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={firstModelId}
          selectedVisibilityType="private"
          isReadonly={false}
          isCustomModel={true}
          customModelInfo={userModels.length > 0 ? userModels[0] : null}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }
  
  // 如果选择了模型，使用选择的模型
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
