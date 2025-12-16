"use client";

import ReactMarkdown from "react-markdown";
import { Copy, Download, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

/* ---------- Code Block ---------- */

function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeText = String(children).replace(/\n$/, "").trim();

  const lines = codeText.split("\n");

  const isSingleLine = lines.length === 1;
  const isShort = codeText.length < 60;

  const hasProgrammingKeywords = /\b(for|while|if|else|return|class|struct|def|function)\b/.test(codeText);
  const hasBraces = /[{};]/.test(codeText);

  const looksLikeMathOrDP =
    /^[a-zA-Z0-9_\[\]\(\)\.\,\s\-\+\*\=<>!&|:]+$/.test(codeText);

  const shouldInline =
    inline ||
    (isSingleLine && isShort && looksLikeMathOrDP && !hasProgrammingKeywords && !hasBraces);

  /* ---------- INLINE CODE (FINAL FIX) ---------- */
  if (shouldInline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-black/70 text-green-300 font-mono text-sm">
        {codeText}
      </code>
    );
  }

  /* ---------- REAL CODE BLOCK ---------- */
  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-neutral-800 bg-[#282c34]">
      <div className="flex items-center justify-between px-4 py-2 text-xs bg-neutral-900 border-b border-neutral-800 text-neutral-400">
        <span className="uppercase tracking-wide">
          {match?.[1] || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-neutral-700 hover:border-green-600 hover:text-green-300 transition"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <SyntaxHighlighter
        language={match?.[1] || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "#282c34",
          fontSize: "0.85rem",
        }}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
}

/* ---------- Result Section ---------- */

export default function ResultSection({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(data.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mt-12 border border-neutral-800 rounded-xl bg-neutral-900 overflow-hidden">

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-300">
          Generated Document
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-neutral-700 hover:border-green-600 hover:text-green-300 transition"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy all"}
          </button>

          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-neutral-800 text-neutral-500 cursor-not-allowed"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Document Canvas */}
      <div className="px-6 py-8 flex justify-center">
        <article className="w-full max-w-3xl text-neutral-200 leading-relaxed">
          <ReactMarkdown
            components={{
              h1: (props) => (
                <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />
              ),
              h2: (props) => (
                <h2 className="text-2xl font-semibold text-white mt-6 mb-3" {...props} />
              ),
              h3: (props) => (
                <h3 className="text-xl font-semibold text-white mt-5 mb-2" {...props} />
              ),
              p: (props) => (
                <p className="mb-4 leading-7 text-neutral-200" {...props} />
              ),
              ul: (props) => (
                <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />
              ),
              ol: (props) => (
                <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />
              ),
              blockquote: (props) => (
                <blockquote className="border-l-4 border-green-600 pl-4 italic text-neutral-300 my-6" {...props} />
              ),
              code: CodeBlock,
            }}
          >
            {data.answer}
          </ReactMarkdown>
        </article>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-neutral-800 text-[11px] text-neutral-500">
        AI-generated content • Review before publishing
      </div>
    </section>
  );
}
