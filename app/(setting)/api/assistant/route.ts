import { auth } from '@/app/(auth)/auth';
import { 
  createAssistant, 
  deleteAssistantById, 
  getAssistantById, 
  getAssistantsByUserId, 
  getModelById,
  getProviderById,
  updateAssistant 
} from '@/lib/db/queries';

// 获取用户的所有助手
export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const assistants = await getAssistantsByUserId({ userId: session.user.id });
    return Response.json({ assistants }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch assistants:', error);
    return Response.json({ error: '获取助手失败' }, { status: 500 });
  }
}

// 创建新助手
export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { name, systemPrompt, modelId } = await request.json();
    
    if (!name || !modelId) {
      return Response.json({ error: '名称和模型ID为必填项' }, { status: 400 });
    }

    // 验证模型ID是否有效并属于用户
    const model = await getModelById({ id: modelId });
    
    if (!model) {
      return Response.json({ error: '未找到指定模型' }, { status: 404 });
    }
    
    const provider = await getProviderById({ id: model.providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '无权限使用此模型' }, { status: 403 });
    }

    await createAssistant({ 
      name, 
      systemPrompt, 
      modelId, 
      userId: session.user.id 
    });
    
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create assistant:', error);
    return Response.json({ error: '创建助手失败' }, { status: 500 });
  }
}

// 更新助手
export async function PUT(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { id, name, systemPrompt, modelId } = await request.json();
    
    if (!id) {
      return Response.json({ error: '助手ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的助手
    const assistant = await getAssistantById({ id });
    
    if (!assistant || assistant.userId !== session.user.id) {
      return Response.json({ error: '未找到助手或无权限' }, { status: 404 });
    }

    // 如果更新了模型ID，需要验证模型是否有效且属于用户
    if (modelId && modelId !== assistant.modelId) {
      const model = await getModelById({ id: modelId });
      
      if (!model) {
        return Response.json({ error: '未找到指定模型' }, { status: 404 });
      }
      
      const provider = await getProviderById({ id: model.providerId });
      
      if (!provider || provider.userId !== session.user.id) {
        return Response.json({ error: '无权限使用此模型' }, { status: 403 });
      }
    }

    await updateAssistant({ id, name, systemPrompt, modelId });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update assistant:', error);
    return Response.json({ error: '更新助手失败' }, { status: 500 });
  }
}

// 删除助手
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: '助手ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的助手
    const assistant = await getAssistantById({ id });
    
    if (!assistant || assistant.userId !== session.user.id) {
      return Response.json({ error: '未找到助手或无权限' }, { status: 404 });
    }

    await deleteAssistantById({ id });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete assistant:', error);
    return Response.json({ error: '删除助手失败' }, { status: 500 });
  }
}
