import { cookies } from 'next/headers';
import { notFound, } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_MODEL_ID } from '@/lib/ai/models';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });
  
  if (!chat) {
    notFound();
  }
  
  const session = await auth();
  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }
    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }
  
  const messagesFromDb = await getMessagesByChatId({
    id,
  });
  
  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');
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
  //   redirect('/settings/models');
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
  
  if (!chatModelFromCookie) {
    // 如果没有选择模型，使用第一个用户配置的模型
    const firstModelId = userModels.length > 0 
      ? userModels[0].model.modelId 
      : DEFAULT_MODEL_ID;
      
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={firstModelId}
          selectedVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          isCustomModel={true}
          customModelInfo={userModels[0]}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }
  
  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
        isCustomModel={isCustomModel}
        customModelInfo={customModelInfo}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
