'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLanguages } from '@/lib/api';
import LanguageSelect from '@/components/LanguageSelect';

const FALLBACK_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ur', name: 'Urdu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
];

const LANG_FLAGS = {
  en: '🇬🇧', ar: '🇸🇦', ur: '🇵🇰', es: '🇪🇸', fr: '🇫🇷', hi: '🇮🇳', ja: '🇯🇵',
  de: '🇩🇪', zh: '🇨🇳', ko: '🇰🇷', pt: '🇧🇷', ru: '🇷🇺', it: '🇮🇹', tr: '🇹🇷',
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large gradient orbs */}
      <div className="animate-float-slow absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
      <div className="animate-float-reverse absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-600/10" />
      <div className="animate-float absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-pink-300/15 blur-3xl dark:bg-pink-600/8" />

      {/* Floating language bubbles */}
      <div className="animate-float animation-delay-300 absolute top-[12%] left-[8%] flex h-12 w-12 items-center justify-center rounded-2xl glass text-xl shadow-lg">
        Hola
      </div>
      <div className="animate-float-reverse animation-delay-700 absolute top-[18%] right-[10%] flex h-11 w-11 items-center justify-center rounded-2xl glass text-lg shadow-lg">
        مرحبا
      </div>
      <div className="animate-float-slow animation-delay-500 absolute bottom-[22%] left-[12%] flex h-10 w-10 items-center justify-center rounded-2xl glass text-lg shadow-lg">
        你好
      </div>
      <div className="animate-float animation-delay-1000 absolute bottom-[15%] right-[15%] flex h-11 w-11 items-center justify-center rounded-2xl glass text-base shadow-lg font-medium">
        Hi
      </div>
      <div className="animate-float-reverse animation-delay-150 absolute top-[45%] left-[5%] flex h-10 w-10 items-center justify-center rounded-2xl glass text-lg shadow-lg">
        नमस्ते
      </div>
      <div className="animate-float-slow animation-delay-300 absolute top-[50%] right-[6%] flex h-10 w-10 items-center justify-center rounded-2xl glass text-base shadow-lg font-medium">
        Bonjour
      </div>
    </div>
  );
}

const BAR_HEIGHTS = [16, 10, 20, 12, 22, 18, 14, 8, 24, 11, 19, 15];

function WaveformIllustration() {
  return (
    <div className="flex items-end justify-center gap-1 h-10 mb-6 opacity-60">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500 ${
            i % 4 === 0 ? 'animate-wave-1' : i % 4 === 1 ? 'animate-wave-2' : i % 4 === 2 ? 'animate-wave-3' : 'animate-wave-4'
          }`}
          style={{ animationDelay: `${i * 0.08}s`, height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [source, setSource] = useState('en');
  const [target, setTarget] = useState('ar');
  const [twoWay, setTwoWay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getLanguages()
      .then((data) => data.languages && setLanguages(data.languages))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSwap = () => {
    setSource(target);
    setTarget(source);
  };

  const handleStart = () => {
    const params = new URLSearchParams({ from: source, to: target });
    if (twoWay) params.set('twoWay', 'true');
    router.push(`/session?${params.toString()}`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-mesh-gradient p-6 pt-20 overflow-hidden">
      <FloatingOrbs />

      <main
        className={`relative z-10 w-full max-w-lg transition-all duration-700 ${
          mounted ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-xl shadow-indigo-500/5 dark:shadow-indigo-500/5">
          <WaveformIllustration />

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">Live Translation</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Speak naturally, translate instantly. Break language barriers in real-time.
            </p>
          </div>

          {/* Language selector */}
          <div className={`transition-all duration-500 ${mounted ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : (
              <LanguageSelect
                languages={languages}
                source={source}
                target={target}
                onSourceChange={setSource}
                onTargetChange={setTarget}
                onSwap={handleSwap}
                langFlags={LANG_FLAGS}
              />
            )}
          </div>

          {/* Two-way toggle */}
          <div className={`mt-6 transition-all duration-500 ${mounted ? 'animate-fade-in animation-delay-500' : 'opacity-0'}`}>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 py-3 dark:border-slate-700/40 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Two-way translation
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Switch speaking direction mid-session
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={twoWay}
                onClick={() => setTwoWay((v) => !v)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-all duration-300 ${
                  twoWay
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 mt-1 ${
                    twoWay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <div className={`mt-8 transition-all duration-500 ${mounted ? 'animate-fade-in animation-delay-700' : 'opacity-0'}`}>
            <button
              type="button"
              onClick={handleStart}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] animate-gradient"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V21h-2v-5.07z" />
                </svg>
                Start Translating
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </div>

          {/* Info badges */}
          <div className={`mt-6 flex flex-wrap items-center justify-center gap-2 transition-all duration-500 ${mounted ? 'animate-fade-in animation-delay-1000' : 'opacity-0'}`}>
            {[
              { icon: '⚡', text: 'Real-time' },
              { icon: '🎤', text: 'Voice input' },
              { icon: '🔊', text: 'TTS output' },
            ].map((badge) => (
              <span
                key={badge.text}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
              >
                <span>{badge.icon}</span>
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
