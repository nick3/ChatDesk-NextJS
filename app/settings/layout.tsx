'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, User, Shield, Laptop, Brain, LifeBuoy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { navigationItemsConfig } from './nav-items';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

// 图标映射对象
const IconMap = {
  User,
  Shield,
  Brain,
  Laptop,
  LifeBuoy
};

// 使用配置构建包含 React 组件的导航项
export const navigationItems = navigationItemsConfig.map(item => ({
  ...item,
  icon: React.createElement(IconMap[item.icon as keyof typeof IconMap], { className: "mr-2 h-4 w-4" })
}));

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('settings');

  // 处理关闭按钮点击，返回到主应用
  const handleClose = () => {
    // 返回到主应用页面，而不是上一个设置子页面
    router.push('/');
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* 标题和导航区域整合在一行 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b">
        {/* 标题区域（左侧） */}
        <div className="flex items-center mb-4 sm:mb-0">
          <Settings className="mr-2 size-6" />
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        
        {/* 导航区域（中间） */}
        <nav className="grow flex justify-center">
          <div className="flex flex-wrap justify-center gap-1.5">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span>{t(item.title)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {/* 关闭按钮（右侧） */}
        <div className="ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="size-9"
            aria-label={t('close')}
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>
      
      {/* 内容区域 - 全宽 */}
      <div className="w-full">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
