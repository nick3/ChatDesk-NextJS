'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Upload, Save, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner'; // 更改为使用 sonner 的 toast

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export default function ProfileSettings() {
  const t = useTranslations('settings.profile');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
  
  // 模拟用户数据 - 实际应用中应该从API获取
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/placeholder-avatar.jpg'
  });

  // 个人信息表单验证
  const profileFormSchema = z.object({
    name: z.string().min(2, {
      message: t('nameMinLength'),
    }).max(30, {
      message: t('nameMaxLength'),
    }),
  });

  // 密码修改表单验证
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, {
      message: t('passwordMinLength'),
    }),
    newPassword: z.string().min(6, {
      message: t('passwordMinLength'),
    }),
    confirmPassword: z.string().min(6, {
      message: t('passwordMinLength'),
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('passwordMismatch'),
    path: ["confirmPassword"],
  });
  
  // 个人信息表单
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData.name,
    },
  });

  // 密码表单
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // 保存个人信息
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      setIsLoading(true);
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 更新本地用户数据
      setUserData(prev => ({
        ...prev,
        name: values.name
      }));
      
      // 使用sonner的toast
      toast.success(t('profileUpdated'), {
        description: t('profileUpdatedDesc'),
      });
    } catch (error) {
      // 使用sonner的toast显示错误
      toast.error(t('errorTitle'), {
        description: t('errorDesc'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 修改密码
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsLoading(true);
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 使用sonner的toast
      toast.success(t('passwordUpdated'), {
        description: t('passwordUpdatedDesc'),
      });
      
      passwordForm.reset();
      setIsPasswordDialogOpen(false);
    } catch (error) {
      // 使用sonner的toast显示错误
      toast.error(t('errorTitle'), {
        description: t('errorDesc'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = () => {
    // 实际项目中应该实现文件上传逻辑
    toast.info(t('featureNotAvailable'), {
      description: t('featureNotAvailableDesc')
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      
      <Separator />
      
      {/* 头像设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('avatar')}</CardTitle>
          <CardDescription>
            {t('avatarDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <Avatar className="size-24">
            <AvatarImage src={userData.avatar} alt={userData.name} />
            <AvatarFallback className="text-xl">
              {userData.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleAvatarUpload}
              className="flex gap-2 items-center"
            >
              <Upload className="size-4" />
              {t('uploadAvatar')}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              {t('avatarRequirements')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* 个人信息设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo')}</CardTitle>
          <CardDescription>
            {t('personalInfoDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('namePlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input 
                    value={userData.email}
                    disabled
                    readOnly
                  />
                </FormControl>
                <FormDescription>
                  {t('emailCannotChange')}
                </FormDescription>
              </FormItem>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading || !profileForm.formState.isDirty}
                  className="flex gap-2"
                >
                  {isLoading && <Loader2 className="size-4 animate-spin" />}
                  <Save className="size-4" />
                  {t('saveChanges')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* 密码设置 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('security')}</CardTitle>
          <CardDescription>
            {t('securityDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="flex gap-2"
              >
                <Key className="size-4" />
                {t('changePassword')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('changePassword')}</DialogTitle>
                <DialogDescription>
                  {t('changePasswordDesc')}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('currentPassword')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newPassword')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsPasswordDialogOpen(false)}
                    >
                      {t('cancel')}
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading && <Loader2 className="size-4 animate-spin" />}
                      {t('updatePassword')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
