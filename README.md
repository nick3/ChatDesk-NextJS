<p align="center">
  <img alt="ChatDesk - 现代化AI对话平台" src="app/(chat)/opengraph-image.png">
  <h1 align="center">ChatDesk</h1>
</p>

<p align="center">
  基于Next.js和Vercel AI SDK构建的现代化AI对话平台，让你的AI助手体验更加个性化。
</p>

<p align="center">
  <a href="#主要功能"><strong>主要功能</strong></a> ·
  <a href="#技术栈"><strong>技术栈</strong></a> ·
  <a href="#模型提供商"><strong>模型提供商</strong></a> ·
  <a href="#部署你自己的版本"><strong>部署指南</strong></a> ·
  <a href="#本地开发"><strong>本地开发</strong></a>
</p>
<br/>

## 主要功能

- **多AI助手管理**
  - 创建和管理多个AI助手，每个助手都有自己的名称和特色
  - 为每个AI助手自定义系统提示词，打造专属对话体验
  - 在界面中快速切换不同的AI助手

- **AI服务提供商配置**
  - 支持配置多种大语言模型服务提供商
  - 自定义API端点、API密钥和模型参数
  - 灵活选择不同的模型以满足不同场景需求

- **对话历史记录**
  - 自动保存所有与AI助手的对话内容
  - 轻松回顾和管理历史会话
  - 支持对话内容的导出和分享

- **界面个性化**
  - 支持亮色/暗色模式切换
  - 现代化、高质感的UI设计
  - 动态交互效果提升用户体验

- **多语言支持**
  - 内置多国语言界面
  - 基于next-intl的完善国际化方案

## 技术栈

- **前端**
  - [Next.js](https://nextjs.org) App Router
    - 先进的路由系统，提供无缝导航和优秀性能
    - React Server Components (RSCs)和Server Actions实现服务端渲染
  - [TailwindCSS](https://tailwindcss.com)和[RadixUI](https://radix-ui.com)
    - 现代化的UI组件和样式系统
    - 可访问性优先的设计原则
  - [Framer Motion](https://www.framer.com/motion/)
    - 流畅的动画和交互效果
    - 提升用户界面体验

- **AI集成**
  - [Vercel AI SDK](https://sdk.vercel.ai/docs)
    - 统一的API接口，支持文本生成、结构化对象和工具调用
    - 丰富的React Hooks用于构建动态聊天和生成式用户界面
    - 支持OpenAI、Anthropic、Mistral、Fireworks等多种模型提供商

- **数据持久化**
  - [Drizzle ORM](https://orm.drizzle.team)配合PostgreSQL
    - 类型安全的数据库查询
    - 高性能的数据操作
  - [Vercel Postgres](https://vercel.com/storage/postgres)
    - 用于存储对话历史和用户配置
  - [Vercel Blob](https://vercel.com/storage/blob)
    - 高效的文件存储方案

- **认证与安全**
  - [NextAuth.js](https://github.com/nextauthjs/next-auth)
    - 简单而安全的认证系统
    - 支持多种认证提供商

## 模型提供商

ChatDesk支持多种AI模型提供商，包括但不限于：

- [OpenAI](https://openai.com) - GPT-4, GPT-4o, GPT-3.5等
- [Anthropic](https://anthropic.com) - Claude系列模型
- [Mistral AI](https://mistral.ai) - Mistral系列模型
- [Fireworks AI](https://fireworks.ai) - 多种高性能模型
- 自定义兼容OpenAI API的服务提供商

只需简单配置即可切换不同的模型提供商，满足不同的应用场景和预算需求。

## 部署你自己的版本

你可以使用Vercel一键部署ChatDesk：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fchatdesk&env=AUTH_SECRET,OPENAI_API_KEY&envDescription=查看环境变量配置说明&demo-title=ChatDesk&demo-description=现代化的AI对话平台，支持多AI助手和多种模型提供商&stores=[{%22type%22:%22postgres%22},{%22type%22:%22blob%22}])

## 本地开发

在本地运行ChatDesk，你需要配置环境变量（参考`.env.example`文件）。建议使用[Vercel环境变量](https://vercel.com/docs/projects/environment-variables)进行管理，但简单的`.env`文件也可以满足需求。

> 注意：请不要提交你的`.env`文件，这会泄露你的API密钥和其他敏感信息。

1. 安装Vercel CLI: `pnpm install -g vercel`
2. 关联本地实例与Vercel和GitHub账号: `vercel link`
3. 下载环境变量: `vercel env pull`

```bash
pnpm install
pnpm dev
```

现在你的应用应该已经在[localhost:3000](http://localhost:3000/)上运行了。

## 数据库操作

ChatDesk使用Drizzle ORM管理数据库，提供了以下命令简化数据库操作：

```bash
# 生成迁移文件
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 启动Drizzle Studio查看和编辑数据
pnpm db:studio

# 将本地模式推送到数据库
pnpm db:push

# 从数据库拉取模式
pnpm db:pull

# 检查模式变更
pnpm db:check
```

## 贡献指南

欢迎为ChatDesk贡献代码或提出建议！请遵循以下步骤：

1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参阅[LICENSE](LICENSE)文件。
