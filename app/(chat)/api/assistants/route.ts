import { auth } from '@/app/(auth)/auth';
import { getAssistantsByUserId, getModelById } from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    // 获取用户所有的助手
    const assistants = await getAssistantsByUserId({ userId: session.user.id });
    
    // 获取每个助手的完整信息，包括关联的模型信息
    const assistantsWithModels = await Promise.all(
      assistants.map(async (assistant) => {        
        return {
          id: assistant.id,
          name: assistant.name,
          systemPrompt: assistant.systemPrompt,
          temperature: assistant.temperature,
          createdAt: assistant.createdAt,
          updatedAt: assistant.updatedAt
        };
      })
    );
    
    return Response.json(assistantsWithModels, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user assistants:', error);
    return Response.json({ error: '获取助手失败' }, { status: 500 });
  }
}