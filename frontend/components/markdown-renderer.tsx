"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[]}
      components={{
        wrapper: ({ children }) => (
          <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            {children}
          </div>
        ),
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
        ),
        p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4" />,
        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4" />,
        li: ({ node, ...props }) => <li {...props} className="mb-1" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mb-3 mt-5" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold mb-3 mt-4" />,
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" />
          ) : (
            <code {...props} className="block bg-muted p-2 rounded-md text-sm overflow-x-auto" />
          ),
        pre: ({ node, ...props }) => <pre {...props} className="bg-muted p-4 rounded-md overflow-x-auto mb-4" />,
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-muted pl-4 italic mb-4" />
        ),
      }}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
        ),
        p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6 mb-4" />,
        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6 mb-4" />,
        li: ({ node, ...props }) => <li {...props} className="mb-1" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold mb-4 mt-6" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mb-3 mt-5" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold mb-3 mt-4" />,
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" />
          ) : (
            <code {...props} className="block bg-muted p-2 rounded-md text-sm overflow-x-auto" />
          ),
        pre: ({ node, ...props }) => <pre {...props} className="bg-muted p-4 rounded-md overflow-x-auto mb-4" />,
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-muted pl-4 italic mb-4" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
