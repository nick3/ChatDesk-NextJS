import { redirect } from 'next/navigation';
import { navigationItemsConfig } from './nav-items';

export default function SettingsPage() {
  // 使用共享配置中的第一个导航项
  redirect(navigationItemsConfig[0].href);
}