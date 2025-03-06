import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  provider,
  model,
  assistant,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!, { prepare: false });
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database', error);
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database');
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

// 获取用户的所有服务提供商
export async function getProvidersByUserId({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(provider)
      .where(eq(provider.userId, userId))
      .orderBy(asc(provider.name));
  } catch (error) {
    console.error('Failed to get providers by user id from database', error);
    throw error;
  }
}

// 根据ID获取服务提供商
export async function getProviderById({ id }: { id: string }) {
  try {
    const [selectedProvider] = await db
      .select()
      .from(provider)
      .where(eq(provider.id, id));
    return selectedProvider;
  } catch (error) {
    console.error('Failed to get provider by id from database', error);
    throw error;
  }
}

// 创建新的服务提供商
export async function createProvider({
  name,
  type,
  apiKey,
  baseUrl,
  isCustom,
  userId,
}: {
  name: string;
  type: string;
  apiKey: string;
  baseUrl: string;
  isCustom?: boolean;
  userId: string;
}) {
  try {
    return await db.insert(provider).values({
      name,
      type,
      apiKey,
      baseUrl,
      isCustom: isCustom || false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create provider in database', error);
    throw error;
  }
}

// 更新服务提供商
export async function updateProvider({
  id,
  name,
  type,
  apiKey,
  baseUrl,
  isCustom,
}: {
  id: string;
  name?: string;
  type?: string;
  apiKey?: string;
  baseUrl?: string;
  isCustom?: boolean;
}) {
  try {
    const updateData: Partial<typeof provider.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (apiKey !== undefined) updateData.apiKey = apiKey;
    if (baseUrl !== undefined) updateData.baseUrl = baseUrl;
    if (isCustom !== undefined) updateData.isCustom = isCustom;

    return await db
      .update(provider)
      .set(updateData)
      .where(eq(provider.id, id));
  } catch (error) {
    console.error('Failed to update provider in database', error);
    throw error;
  }
}

// 删除服务提供商
export async function deleteProviderById({ id }: { id: string }) {
  try {
    // 首先删除关联的模型
    await db.delete(model).where(eq(model.providerId, id));
    // 然后删除提供商
    return await db.delete(provider).where(eq(provider.id, id));
  } catch (error) {
    console.error('Failed to delete provider from database', error);
    throw error;
  }
}

// 获取指定提供商的所有模型
export async function getModelsByProviderId({ providerId }: { providerId: string }) {
  try {
    return await db
      .select()
      .from(model)
      .where(eq(model.providerId, providerId))
      .orderBy(asc(model.name));
  } catch (error) {
    console.error('Failed to get models by provider id from database', error);
    throw error;
  }
}

// 根据ID获取模型
export async function getModelById({ id }: { id: string }) {
  try {
    const [selectedModel] = await db
      .select()
      .from(model)
      .where(eq(model.id, id));
    return selectedModel;
  } catch (error) {
    console.error('Failed to get model by id from database', error);
    throw error;
  }
}

// 创建新模型
export async function createModel({
  providerId,
  modelId,
  name,
}: {
  providerId: string;
  modelId: string;
  name: string;
}) {
  try {
    const result = await db.insert(model).values({
      providerId,
      modelId,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: model.id });
    
    return result[0]; // 返回第一个结果项，它包含 id 属性
  } catch (error) {
    console.error('Failed to create model in database', error);
    throw error;
  }
}

// 更新模型
export async function updateModel({
  id,
  modelId,
  name,
}: {
  id: string;
  modelId?: string;
  name?: string;
}) {
  try {
    const updateData: Partial<typeof model.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (modelId !== undefined) updateData.modelId = modelId;
    if (name !== undefined) updateData.name = name;

    return await db.update(model).set(updateData).where(eq(model.id, id));
  } catch (error) {
    console.error('Failed to update model in database', error);
    throw error;
  }
}

// 删除模型
export async function deleteModelById({ id }: { id: string }) {
  try {
    // 检查是否有助手使用此模型
    const assistantsUsingModel = await db
      .select({ id: assistant.id })
      .from(assistant)
      .where(eq(assistant.modelId, id));

    // 如果有助手使用此模型则抛出错误
    if (assistantsUsingModel.length > 0) {
      throw new Error('Cannot delete model that is being used by assistants');
    }

    return await db.delete(model).where(eq(model.id, id));
  } catch (error) {
    console.error('Failed to delete model from database', error);
    throw error;
  }
}

// 批量创建模型
export async function createModels({
  models,
}: {
  models: Array<{
    providerId: string;
    modelId: string;
    name: string;
  }>;
}) {
  try {
    const values = models.map((m) => ({
      providerId: m.providerId,
      modelId: m.modelId,
      name: m.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return await db.insert(model).values(values);
  } catch (error) {
    console.error('Failed to create models in database', error);
    throw error;
  }
}

// 获取用户的所有助手
export async function getAssistantsByUserId({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(assistant)
      .where(eq(assistant.userId, userId))
      .orderBy(asc(assistant.name));
  } catch (error) {
    console.error('Failed to get assistants by user id from database', error);
    throw error;
  }
}

// 根据ID获取助手
export async function getAssistantById({ id }: { id: string }) {
  try {
    const [selectedAssistant] = await db
      .select()
      .from(assistant)
      .where(eq(assistant.id, id));
    return selectedAssistant;
  } catch (error) {
    console.error('Failed to get assistant by id from database', error);
    throw error;
  }
}

// 创建新助手
export async function createAssistant({
  name,
  systemPrompt,
  modelId,
  userId,
}: {
  name: string;
  systemPrompt?: string;
  modelId: string;
  userId: string;
}) {
  try {
    return await db.insert(assistant).values({
      name,
      systemPrompt,
      modelId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to create assistant in database', error);
    throw error;
  }
}

// 更新助手
export async function updateAssistant({
  id,
  name,
  systemPrompt,
  modelId,
}: {
  id: string;
  name?: string;
  systemPrompt?: string;
  modelId?: string;
}) {
  try {
    const updateData: Partial<typeof assistant.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (modelId !== undefined) updateData.modelId = modelId;

    return await db.update(assistant).set(updateData).where(eq(assistant.id, id));
  } catch (error) {
    console.error('Failed to update assistant in database', error);
    throw error;
  }
}

// 删除助手
export async function deleteAssistantById({ id }: { id: string }) {
  try {
    return await db.delete(assistant).where(eq(assistant.id, id));
  } catch (error) {
    console.error('Failed to delete assistant from database', error);
    throw error;
  }
}
