'use client';

export default function LanguageSelect({ languages, source, target, onSourceChange, onTargetChange, onSwap }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={source}
        onChange={(e) => onSourceChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Source language"
      >
        {languages.map(({ code, name }) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSwap}
        className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
        aria-label="Swap languages"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
      <select
        value={target}
        onChange={(e) => onTargetChange(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Target language"
      >
        {languages.map(({ code, name }) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </div>
  );
}
