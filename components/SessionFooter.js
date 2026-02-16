'use client';

export default function SessionFooter({
  elapsedSeconds,
  isRecording,
  onMicToggle,
  onStopSession,
  sourceName,
  targetName,
}) {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${m}:${String(s).padStart(2, '0')}`;

  return (
    <footer className="flex items-center justify-between gap-4 border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {sourceName} → {targetName}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-sm tabular-nums text-zinc-500">{timeStr}</span>
        <button
          type="button"
          onClick={onMicToggle}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label={isRecording ? 'Stop microphone' : 'Start microphone'}
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V21h-2v-5.07z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onStopSession}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Stop session
        </button>
      </div>
    </footer>
  );
}
