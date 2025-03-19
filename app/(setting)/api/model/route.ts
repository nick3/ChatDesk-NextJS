import { auth } from '@/app/(auth)/auth';
import { 
  createModel, 
  deleteModelById, 
  getModelById, 
  getModelsByProviderId, 
  getProviderById, 
  updateModel,
  createModels 
} from '@/lib/db/queries';

// 获取特定提供商的所有模型
export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return Response.json({ error: '提供商ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的提供商
    const provider = await getProviderById({ id: providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '未找到提供商或无权限' }, { status: 404 });
    }

    const models = await getModelsByProviderId({ providerId });
    return Response.json({ models }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return Response.json({ error: '获取模型失败' }, { status: 500 });
  }
}

// 创建新模型
export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { providerId, modelId, name } = await request.json();
    
    if (!providerId || !modelId || !name) {
      return Response.json({ error: '提供商ID、模型ID和名称为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的提供商
    const provider = await getProviderById({ id: providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '未找到提供商或无权限' }, { status: 404 });
    }

    // 创建模型并获取结果
    const newModel = await createModel({ providerId, modelId, name });
    
    // 返回包含ID的响应
    return Response.json({ success: true, id: newModel.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to create model:', error);
    return Response.json({ error: '创建模型失败' }, { status: 500 });
  }
}

// 批量创建模型
export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { providerId, models } = await request.json();
    
    if (!providerId || !models || !Array.isArray(models) || models.length === 0) {
      return Response.json({ error: '提供商ID和模型数组为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的提供商
    const provider = await getProviderById({ id: providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '未找到提供商或无权限' }, { status: 404 });
    }

    const modelsToCreate = models.map(model => ({
      providerId,
      modelId: model.id,
      name: model.name
    }));

    await createModels({ models: modelsToCreate });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to batch create models:', error);
    return Response.json({ error: '批量创建模型失败' }, { status: 500 });
  }
}

// 更新模型
export async function PUT(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { id, modelId, name } = await request.json();
    
    if (!id) {
      return Response.json({ error: '模型ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的模型
    const model = await getModelById({ id });
    
    if (!model) {
      return Response.json({ error: '未找到模型' }, { status: 404 });
    }

    // 检查提供商归属
    const provider = await getProviderById({ id: model.providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '无权限修改此模型' }, { status: 403 });
    }

    await updateModel({ id, modelId, name });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update model:', error);
    return Response.json({ error: '更新模型失败' }, { status: 500 });
  }
}

// 删除模型
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: '模型ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的模型
    const model = await getModelById({ id });
    
    if (!model) {
      return Response.json({ error: '未找到模型' }, { status: 404 });
    }

    // 检查提供商归属
    const provider = await getProviderById({ id: model.providerId });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '无权限删除此模型' }, { status: 403 });
    }

    await deleteModelById({ id });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('being used by assistants')) {
      return Response.json({ error: '该模型正在被助手使用，无法删除' }, { status: 400 });
    }
    
    console.error('Failed to delete model:', error);
    return Response.json({ error: '删除模型失败' }, { status: 500 });
  }
}