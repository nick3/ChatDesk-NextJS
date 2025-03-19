// 模型服务商接口定义
export interface LLMProvider {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  baseUrl: string;
  isCustom?: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 模型接口定义
export interface LLMModel {
  id: string;        // 客户端UUID
  dbId?: string;     // 数据库ID，新创建的模型没有这个字段
  providerId: string;
  modelId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 删除对话框状态类型
export interface DeleteDialogState {
  open: boolean;
  type: 'provider' | 'model' | null;
  itemId: string | null;
}