import React from 'react';

/**
 * Lightweight, zero-dependency Markdown renderer for chat & assistant responses.
 * Formats: **bold**, *italic*, ~~strikethrough~~, `code`, - bullet lists, and paragraphs.
 */
export default function MarkdownText({ content, className = '' }) {
  if (!content) return null;

  const lines = String(content).split('\n');

  const formatInline = (text) => {
    // Regex splits into delimiters while preserving matches
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`)/g);

    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return (
          <strong key={i} className="font-semibold text-[#202923]">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        return (
          <em key={i} className="italic text-[#6B746E]">
            {token.slice(1, -1)}
          </em>
        );
      }
      if (token.startsWith('~~') && token.endsWith('~~') && token.length >= 4) {
        return (
          <del key={i} className="line-through text-[#8C958E]">
            {token.slice(2, -2)}
          </del>
        );
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return (
          <code key={i} className="font-mono bg-[#EAEDE7] px-1.5 py-0.5 rounded text-[11px] text-[#234E42]">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5 text-xs text-[#6B746E]">
              <span className="text-[#347A52] font-bold">•</span>
              <span>{formatInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return (
          <p key={idx} className="text-xs text-[#6B746E]">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}
