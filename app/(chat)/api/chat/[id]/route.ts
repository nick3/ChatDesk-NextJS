import { auth } from '@/app/(auth)/auth';
import { getChatById, updateChat } from '@/lib/db/queries';

// 注意：PUT 函数需要接收 params 参数
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, assistantId }: { title?: string; assistantId?: string } = await request.json();

  if (!id || (!title && !assistantId)) {
    return new Response('Bad Request', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });
    if (!chat) {
      return new Response('Chat not found', { status: 200 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await updateChat({
      id,
      title,
      assistantId,
    });

    return new Response('Chat updated', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
