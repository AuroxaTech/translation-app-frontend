const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getLanguages() {
  const res = await fetch(`${BASE}/api/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function translate({ text, sourceLang, targetLang }) {
  const res = await fetch(`${BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang, targetLang }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || 'Translation failed');
  }
  const data = await res.json();
  return data.translatedText;
}

export async function speakTranslation({ text, language }) {
  const res = await fetch(`${BASE}/api/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  });
  if (res.status === 503 || res.status >= 500) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'TTS unavailable');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Speak request failed');
  }
  return res.blob();
}

export function getTranscriptWebSocketUrl(sourceLang) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = new URL('/api/transcript/live', base);
  url.protocol = base.startsWith('https') ? 'wss' : 'ws';
  const deepgramLang = sourceLang === 'en' ? 'en-US' : sourceLang;
  url.searchParams.set('language', deepgramLang);
  url.searchParams.set('encoding', 'linear16');
  url.searchParams.set('sample_rate', '16000');
  return url.toString();
}
