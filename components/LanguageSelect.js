'use client';

import { useState } from 'react';

export default function LanguageSelect({
  languages,
  source,
  target,
  onSourceChange,
  onTargetChange,
  onSwap,
  langFlags = {},
}) {
  const [swapping, setSwapping] = useState(false);

  const handleSwap = () => {
    setSwapping(true);
    onSwap();
    setTimeout(() => setSwapping(false), 500);
  };

  const selectWrapper =
    'relative group';
  const selectClass =
    'w-full appearance-none rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-sm px-4 py-3 pl-11 pr-10 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 hover:border-indigo-300 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:ring-indigo-400/30 dark:hover:border-indigo-600';
  const chevronClass =
    'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500';

  const getFlag = (code) => langFlags[code] || '🌐';
  const sourceLang = languages.find((l) => l.code === source);
  const targetLang = languages.find((l) => l.code === target);

  return (
    <div className="space-y-3">
      {/* Source label */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
        Speaking
      </label>
      <div className={selectWrapper}>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
          {getFlag(source)}
        </span>
        <select
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          className={selectClass}
          aria-label="Source language"
        >
          {languages.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <div className={chevronClass}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-1">
        <button
          type="button"
          onClick={handleSwap}
          className={`group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-md dark:border-slate-700/40 dark:bg-slate-800 dark:hover:bg-indigo-900/30 dark:hover:border-indigo-600 ${
            swapping ? 'rotate-180' : ''
          }`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, border-color 0.2s, box-shadow 0.2s' }}
          aria-label="Swap languages"
        >
          <svg
            className="h-4.5 w-4.5 text-slate-500 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* Target label */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
        Translating to
      </label>
      <div className={selectWrapper}>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
          {getFlag(target)}
        </span>
        <select
          value={target}
          onChange={(e) => onTargetChange(e.target.value)}
          className={selectClass}
          aria-label="Target language"
        >
          {languages.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <div className={chevronClass}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
