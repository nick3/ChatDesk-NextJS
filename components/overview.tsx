import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageSquare, Settings, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 创建一个自定义的 MessageIcon 组件，可以接受 className 属性
const MessageIcon = ({ size = 24, className = '' }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
};

export const Overview = () => {
  const t = useTranslations('overview');
  
  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: t('features.chat.title'),
      description: t('features.chat.description')
    },
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: t('features.customize.title'),
      description: t('features.customize.description')
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: t('features.assistants.title'),
      description: t('features.assistants.description')
    }
  ];
  
  return (
    <motion.div
      key="overview"
      className="max-w-4xl mx-auto md:mt-12"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.3 }}
    >
      <div className="rounded-2xl p-8 flex flex-col gap-8 leading-relaxed text-center">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col gap-6 items-center"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <MessageIcon size={40} className="text-background" />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {t('welcome')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('description')}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, staggerChildren: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.2 }}
              className="flex flex-col items-center gap-3 rounded-xl border p-6 hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div className="p-2 rounded-full bg-primary/10">{feature.icon}</div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6"
        >
          <Button size="lg" className="gap-2">
            {t('startButton')} <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
