import { auth } from '@/app/(auth)/auth';
import { getModelsByProviderId, getProvidersByUserId } from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    // 获取用户所有的服务提供商
    const providers = await getProvidersByUserId({ userId: session.user.id });
    
    // 获取所有提供商的所有模型
    const userModels = [];
    
    for (const provider of providers) {
      const models = await getModelsByProviderId({ providerId: provider.id });
      
      // 将每个模型与其提供商关联
      for (const model of models) {
        userModels.push({
          id: model.id,
          modelId: model.modelId,
          name: model.name,
          provider: {
            id: provider.id,
            name: provider.name,
            type: provider.type,
            apiKey: provider.apiKey,
            baseUrl: provider.baseUrl
          }
        });
      }
    }
    
    return Response.json({ models: userModels }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user models:', error);
    return Response.json({ error: '获取模型失败' }, { status: 500 });
  }
}