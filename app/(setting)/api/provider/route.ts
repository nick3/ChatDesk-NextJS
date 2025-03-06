import { auth } from '@/app/(auth)/auth';
import { 
  createProvider, 
  deleteProviderById, 
  getProviderById, 
  getProvidersByUserId, 
  updateProvider 
} from '@/lib/db/queries';

// 获取用户的所有提供商
export async function GET() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const providers = await getProvidersByUserId({ userId: session.user.id });
    return Response.json({ providers }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    return Response.json({ error: '获取服务提供商失败' }, { status: 500 });
  }
}

// 创建新提供商
export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { name, type, apiKey, baseUrl, isCustom } = await request.json();
    
    if (!name || !type) {
      return Response.json({ error: '名称和类型为必填项' }, { status: 400 });
    }

    await createProvider({ 
      name, 
      type, 
      apiKey: apiKey || '', 
      baseUrl: baseUrl || '', 
      isCustom, 
      userId: session.user.id 
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create provider:', error);
    return Response.json({ error: '创建服务提供商失败' }, { status: 500 });
  }
}

// 更新提供商
export async function PUT(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { id, name, type, apiKey, baseUrl, isCustom } = await request.json();
    
    if (!id) {
      return Response.json({ error: '提供商ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的提供商
    const provider = await getProviderById({ id });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '未找到提供商或无权限' }, { status: 404 });
    }

    await updateProvider({ id, name, type, apiKey, baseUrl, isCustom });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update provider:', error);
    return Response.json({ error: '更新服务提供商失败' }, { status: 500 });
  }
}

// 删除提供商
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: '提供商ID为必填项' }, { status: 400 });
    }

    // 检查是否是该用户的提供商
    const provider = await getProviderById({ id });
    
    if (!provider || provider.userId !== session.user.id) {
      return Response.json({ error: '未找到提供商或无权限' }, { status: 404 });
    }

    await deleteProviderById({ id });
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete provider:', error);
    return Response.json({ error: '删除服务提供商失败' }, { status: 500 });
  }
}
