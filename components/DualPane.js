'use client';

export default function DualPane({ sourceText, translationText, onCopySource }) {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden md:grid-cols-2">
      <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <span className="text-sm font-medium text-zinc-500">Source</span>
          {onCopySource && (
            <button
              type="button"
              onClick={() => onCopySource(sourceText)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Copy source"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-zinc-900 dark:text-zinc-100">
          {sourceText || <span className="text-zinc-400">Transcript will appear here…</span>}
        </div>
      </div>
      <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <span className="text-sm font-medium text-zinc-500">Translation</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-zinc-900 dark:text-zinc-100">
          {translationText || <span className="text-zinc-400">Translation will appear here…</span>}
        </div>
      </div>
    </div>
  );
}
