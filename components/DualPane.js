'use client';

function EmptyStateIllustration({ type }) {
  if (type === 'source') {
    return (
      <div className="flex flex-col items-center justify-center py-8 opacity-50">
        <div className="relative mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100/80 dark:bg-indigo-900/20">
            <svg className="h-8 w-8 text-indigo-400 dark:text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Waiting for speech...
        </p>
        <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
          Tap the microphone to begin
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 opacity-50">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100/80 dark:bg-purple-900/20">
        <svg className="h-8 w-8 text-purple-400 dark:text-purple-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
        Translation appears here
      </p>
      <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
        Words will be translated in real-time
      </p>
    </div>
  );
}

function CopyButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 hover:scale-110 active:scale-95 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
      aria-label="Copy text"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  );
}

export default function DualPane({ sourceText, translationText, onCopySource, onCopyTranslation }) {
  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-hidden md:grid-cols-2">
      {/* Source pane */}
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200/40 dark:border-slate-700/40 dark:bg-slate-900/60 dark:hover:border-indigo-800/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Source
            </span>
          </div>
          {onCopySource && sourceText && <CopyButton onClick={() => onCopySource(sourceText)} />}
        </div>
        <div className="custom-scrollbar min-h-[8rem] flex-1 overflow-y-auto p-5">
          {sourceText ? (
            <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200 animate-fade-in">
              {sourceText}
            </p>
          ) : (
            <EmptyStateIllustration type="source" />
          )}
        </div>
      </div>

      {/* Translation pane */}
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200/40 dark:border-slate-700/40 dark:bg-slate-900/60 dark:hover:border-purple-800/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Translation
            </span>
          </div>
          {onCopyTranslation && translationText && (
            <CopyButton onClick={() => onCopyTranslation(translationText)} />
          )}
        </div>
        <div className="custom-scrollbar min-h-[8rem] flex-1 overflow-y-auto p-5">
          {translationText ? (
            <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200 animate-fade-in">
              {translationText}
            </p>
          ) : (
            <EmptyStateIllustration type="translation" />
          )}
        </div>
      </div>
    </div>
  );
}
