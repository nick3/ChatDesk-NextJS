'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'motion/react';
import { Markdown } from './markdown';
import { useTranslations } from 'next-intl';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
  reasoningStartTime?: number; // New prop for tracking when reasoning started
}

export function MessageReasoning({
  isLoading,
  reasoning,
  reasoningStartTime,
}: MessageReasoningProps) {
  const t = useTranslations('reasoning');
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for tracking reasoning duration
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (isLoading && reasoningStartTime) {
      // When loading, update elapsed time every second
      intervalId = setInterval(() => {
        const timeNow = Date.now();
        const elapsed = Math.floor((timeNow - reasoningStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (!isLoading && reasoningStartTime) {
      // When loading completes, calculate final elapsed time
      const finalElapsed = Math.floor((Date.now() - reasoningStartTime) / 1000);
      setElapsedTime(finalElapsed);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, reasoningStartTime]);

  // Format elapsed time as "X seconds" or "X minutes Y seconds"
  const formatElapsedTime = () => {
    if (elapsedTime < 60) {
      return t('secondsCount', { count: elapsedTime });
    } else {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      return t('minutesAndSeconds', { minutes, seconds });
    }
  };

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">{t('reasoning')}</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
          {reasoningStartTime && (
            <div className="text-zinc-500 text-sm">
              {formatElapsedTime()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">
            {reasoningStartTime 
              ? t('reasonedFor', { time: formatElapsedTime() })
              : t('reasoned')}
          </div>
          <button
            type="button"
            className="cursor-pointer p-0 bg-transparent border-0 flex items-center"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            aria-label={isExpanded ? t('collapseReasoning') : t('expandReasoning')}
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
