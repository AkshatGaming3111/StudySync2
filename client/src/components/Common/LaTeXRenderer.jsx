import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

export default function LaTeXRenderer({ content = '', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!content) {
      containerRef.current.innerHTML = '';
      return;
    }

    // Format text: escape HTML first
    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    let processed = typeof content === 'string' ? content : String(content);

    // Render Display Math $$...$$ or \[...\]
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return `<div class="text-red-400 font-mono">${escapeHtml(math)}</div>`;
      }
    });

    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return `<div class="text-red-400 font-mono">${escapeHtml(math)}</div>`;
      }
    });

    // Render Inline Math $...$ or \(...\)
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return `<span class="text-red-400 font-mono">${escapeHtml(math)}</span>`;
      }
    });

    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return `<span class="text-red-400 font-mono">${escapeHtml(math)}</span>`;
      }
    });

    // Render Code Blocks ```lang ... ```
    processed = processed.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="my-3 p-3.5 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-xs font-mono border border-gray-800 shadow-inner"><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Render Inline Code `...`
    processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
      return `<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-border text-brand-600 dark:text-brand-400 rounded text-xs font-mono font-semibold">${escapeHtml(code)}</code>`;
    });

    // Render Bold **...**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Render Italic *...*
    processed = processed.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

    // Render Headings
    processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2 flex items-center gap-1.5">$1</h3>');
    processed = processed.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1.5">$1</h4>');

    // Render Linebreaks
    processed = processed.replace(/\n/g, '<br/>');

    // Sanitize with DOMPurify to guarantee protection against XSS
    const cleanHtml = DOMPurify.sanitize(processed, {
      USE_PROFILES: { html: true, mathMl: true, svg: true },
      ADD_TAGS: ['semantics', 'annotation'],
      ADD_ATTR: ['aria-hidden', 'style', 'target', 'rel']
    });

    containerRef.current.innerHTML = cleanHtml;
  }, [content]);

  return <div ref={containerRef} className={`prose-sm leading-relaxed ${className}`} />;
}
