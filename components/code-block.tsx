'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Check, Copy } from 'lucide-react';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  inline,
  className,
  children,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm" {...props}>{children}</code>;
  }

  return (
    <div className="relative group my-4">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 transition-colors duration-200"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || 'text'}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          borderRadius: '0.375rem',
          padding: '1rem',
          margin: 0,
          fontSize: '0.875rem',
        }}
        showLineNumbers={!inline && code.split('\n').length > 1}
        wrapLines={true}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
