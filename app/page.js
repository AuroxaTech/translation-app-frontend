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
];

export default function SetupPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [source, setSource] = useState('en');
  const [target, setTarget] = useState('ar');
  const [twoWay, setTwoWay] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    router.push(`/session?from=${encodeURIComponent(source)}&to=${encodeURIComponent(target)}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <main className="w-full max-w-lg space-y-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Live Translation</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Choose languages and start talking.</p>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading languages…</p>
        ) : (
          <LanguageSelect
            languages={languages}
            source={source}
            target={target}
            onSourceChange={setSource}
            onTargetChange={setTarget}
            onSwap={handleSwap}
          />
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Two-way translation</span>
          <button
            type="button"
            role="switch"
            aria-checked={twoWay}
            onClick={() => setTwoWay((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${twoWay ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${twoWay ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Press and start talking
        </button>
      </main>
    </div>
  );
}
