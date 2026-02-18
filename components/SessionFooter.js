'use client';

function AudioWaveform({ active }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full bg-white/80 ${
            i % 4 === 0 ? 'animate-wave-1' : i % 4 === 1 ? 'animate-wave-2' : i % 4 === 2 ? 'animate-wave-3' : 'animate-wave-4'
          }`}
          style={{ height: '4px' }}
        />
      ))}
    </div>
  );
}

export default function SessionFooter({
  elapsedSeconds,
  isRecording,
  onMicToggle,
  onStopSession,
  sourceName,
  targetName,
  speakTranslationEnabled = false,
  onSpeakTranslationToggle,
  twoWay = false,
  onSwitchDirection,
  otherLangName,
}) {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${m}:${String(s).padStart(2, '0')}`;

  return (
    <footer className="glass-subtle animate-slide-in-bottom border-t border-slate-200/40 dark:border-slate-700/30 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Language info + controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Language pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 px-3.5 py-1.5 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-700/30">
            {isRecording && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {sourceName}
            </span>
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {targetName}
            </span>
          </div>

          {/* Switch direction button */}
          {twoWay && typeof onSwitchDirection === 'function' && (
            <button
              type="button"
              onClick={onSwitchDirection}
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md active:scale-95 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300"
            >
              <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {otherLangName ? `Speak ${otherLangName}` : 'Switch'}
            </button>
          )}

          {/* Speak toggle */}
          {typeof onSpeakTranslationToggle === 'function' && (
            <label className="group flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={speakTranslationEnabled}
                  onChange={(e) => onSpeakTranslationToggle(e.target.checked)}
                  className="peer sr-only"
                />
                <div className={`h-4 w-7 rounded-full transition-colors duration-200 ${
                  speakTranslationEnabled
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                  <div className={`h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                    speakTranslationEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8l4.2-3.15A.5.5 0 0111.5 6v12a.5.5 0 01-.8.4L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z" />
              </svg>
              TTS
            </label>
          )}
        </div>

        {/* Right: Timer + Mic + Stop */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 dark:bg-slate-800/50">
            <div className={`h-1.5 w-1.5 rounded-full transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-sm tabular-nums font-semibold text-slate-600 dark:text-slate-400">
              {timeStr}
            </span>
          </div>

          {/* Mic button */}
          <div className="relative">
            {isRecording && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse-ring" />
                <span className="absolute inset-0 rounded-full bg-red-500/15 animate-pulse-ring-slow" />
              </>
            )}
            <button
              type="button"
              onClick={onMicToggle}
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-90 ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-red-500/30'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500 shadow-indigo-500/30'
              } dark:focus:ring-offset-slate-900`}
              aria-label={isRecording ? 'Stop microphone' : 'Start microphone'}
            >
              {isRecording ? (
                <AudioWaveform active />
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V21h-2v-5.07z" />
                </svg>
              )}
            </button>
          </div>

          {/* Stop session */}
          <button
            type="button"
            onClick={onStopSession}
            className="rounded-xl border border-slate-200/60 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 hover:shadow-md active:scale-95 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-400"
          >
            Stop session
          </button>
        </div>
      </div>
    </footer>
  );
}
