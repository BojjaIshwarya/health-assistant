import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface FormattedChatMessageProps {
  content: string;
  isUser: boolean;
}

// Helper to render inline formatting: bold (**text**), italics (*text*), and code (`code`)
function renderInlineFormatted(text: string, isUser: boolean): React.ReactNode {
  // Pattern to match **bold**, *italic*, or `code`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={isUser ? 'font-bold text-white' : 'font-semibold text-slate-900'}
        >
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic">
          {italicText}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            isUser ? 'bg-teal-700/60 text-white' : 'bg-slate-200/80 text-slate-800'
          }`}
        >
          {codeText}
        </code>
      );
    }
    return part;
  });
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({ content, isUser }) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  // Parse structured sections from bot message
  const rawLines = content.split('\n');

  // Group lines into blocks: headings, lists, alerts, standard paragraphs
  interface Block {
    type: 'heading' | 'alert' | 'bullet-list' | 'numbered-list' | 'paragraph';
    items?: string[];
    text?: string;
    level?: number;
  }

  const blocks: Block[] = [];
  let currentList: { type: 'bullet-list' | 'numbered-list'; items: string[] } | null = null;

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) {
      flushList();
      continue;
    }

    // Alert Callout (Emergency / Caution / Warning)
    if (
      line.startsWith('⚠️') ||
      line.startsWith('🚨') ||
      line.toLowerCase().startsWith('warning:') ||
      line.toLowerCase().startsWith('emergency:') ||
      line.toLowerCase().startsWith('alert:') ||
      line.includes('EMERGENCY ASSISTANCE')
    ) {
      flushList();
      blocks.push({
        type: 'alert',
        text: line.replace(/^(⚠️|🚨)\s*/, ''),
      });
      continue;
    }

    // Headings (###, ##, #)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    // Bullet points (•, *, -)
    const bulletMatch = line.match(/^([•\*\-])\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet-list') {
        flushList();
        currentList = { type: 'bullet-list', items: [] };
      }
      currentList.items.push(bulletMatch[2]);
      continue;
    }

    // Numbered lists (1. , 2. )
    const numberedMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'numbered-list') {
        flushList();
        currentList = { type: 'numbered-list', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      continue;
    }

    // Standalone bold line acting as a pseudo-heading (e.g. **When to see a doctor:**)
    if (line.startsWith('**') && (line.endsWith('**') || line.endsWith('**:')) && line.length < 80) {
      flushList();
      const cleanHeading = line.replace(/^\*\*|\*\*[:]?$/g, '');
      blocks.push({
        type: 'heading',
        level: 3,
        text: cleanHeading,
      });
      continue;
    }

    // Regular paragraph line
    flushList();
    blocks.push({
      type: 'paragraph',
      text: line,
    });
  }
  flushList();

  return (
    <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'heading') {
          return (
            <div key={idx} className="pt-2 first:pt-0">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                <span className="w-1.5 h-3.5 bg-teal-500 rounded-full inline-block shrink-0" />
                {renderInlineFormatted(block.text || '', false)}
              </h4>
            </div>
          );
        }

        if (block.type === 'alert') {
          const isSevere = block.text?.toLowerCase().includes('emergency') || block.text?.toLowerCase().includes('108') || block.text?.toLowerCase().includes('112');
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-2.5 my-2 ${
                isSevere
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {isSevere ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed font-medium">
                {renderInlineFormatted(block.text || '', false)}
              </div>
            </div>
          );
        }

        if (block.type === 'bullet-list' && block.items) {
          return (
            <ul key={idx} className="space-y-1.5 pl-1 my-1.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                  <span className="flex-1">{renderInlineFormatted(item, false)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'numbered-list' && block.items) {
          return (
            <ol key={idx} className="space-y-1.5 pl-1 my-1.5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {itemIdx + 1}
                  </span>
                  <span className="flex-1">{renderInlineFormatted(item, false)}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {renderInlineFormatted(block.text || '', false)}
          </p>
        );
      })}
    </div>
  );
};
