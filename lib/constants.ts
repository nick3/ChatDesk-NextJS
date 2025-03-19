/**
 * 应用程序全局常量配置
 */

// 项目信息 - 直接导入 package.json
// 注意: 这种方式需要在 tsconfig.json 中配置 "resolveJsonModule": true
import pkg from '../package.json';

// 项目基本信息
export const packageInfo = {
  name: 'ChatDesk', // 用于显示的应用名称
  internalName: pkg.name, // 包名称
  version: pkg.version,
  description: pkg.description || '基于AI的智能聊天助手',
};

// 应用全局设置
export const appConfig = {
  githubRepo: 'https://github.com/yourusername/chatdesk',
  officialWebsite: 'https://chatdesk.example.com',
  supportEmail: 'support@example.com',
};

// 开发者信息
export const developerInfo = {
  name: 'Nick',
  github: 'https://github.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
  email: 'your.email@example.com',
  website: 'https://yourwebsite.com',
  buyMeACoffee: 'https://buymeacoffee.com/yourusername',
};
