'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { Github, Globe, X, Mail, Heart, Coffee } from "lucide-react";
import Link from "next/link";
import { packageInfo } from '@/lib/constants';

export default function SupportPage() {
  const t = useTranslations('support');
  
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 项目信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('projectInfo')}</CardTitle>
            <CardDescription>{t('aboutProject')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('name')}</span>
              <span>ChatDesk</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('version')}</span>
              <Badge variant="secondary" className="text-xs">v{packageInfo.version}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('license')}</span>
              <span>MIT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('copyright')}</span>
              <span>© {currentYear} ChatDesk</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="https://github.com/yourusername/chatdesk" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                {t('viewOnGithub')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* 作者信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('authorInfo')}</CardTitle>
            <CardDescription>{t('aboutAuthor')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('developer')}</span>
                <span>Nick</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex flex-col gap-3">
                <span className="font-medium">{t('contact')}</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1 h-4 w-4" />
                      GitHub
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
                      <X className="mr-1 h-4 w-4" />
                      X
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="mailto:your.email@example.com">
                      <Mail className="mr-1 h-4 w-4" />
                      Email
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" asChild>
                    <Link href="https://yourwebsite.com" target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-1 h-4 w-4" />
                      Website
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href="https://buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer">
                <Coffee className="mr-2 h-4 w-4" />
                {t('supportProject')}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* 帮助链接和资源 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('helpResources')}</CardTitle>
          <CardDescription>{t('usefulLinks')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Button variant="outline" className="justify-start" asChild>
            <Link href="https://github.com/yourusername/chatdesk/issues" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              {t('reportIssue')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="https://github.com/yourusername/chatdesk/wiki" target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              {t('documentation')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="https://github.com/yourusername/chatdesk/discussions" target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2 h-4 w-4" />
              {t('community')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="mailto:support@example.com">
              <Mail className="mr-2 h-4 w-4" />
              {t('contactSupport')}
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>{t('thankYou')}</p>
      </div>
    </div>
  );
}
