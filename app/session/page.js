'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DualPane from '@/components/DualPane';
import SessionFooter from '@/components/SessionFooter';
import { translate as translateApi, getTranscriptWebSocketUrl, speakTranslation } from '@/lib/api';

const LANGUAGE_NAMES = { en: 'English', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', fr: 'French', hi: 'Hindi', ja: 'Japanese' };

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'en';
  const to = searchParams.get('to') || 'ar';
  const twoWay = searchParams.get('twoWay') === 'true';

  const [speakingLang, setSpeakingLang] = useState(from);
  const [sourceText, setSourceText] = useState('');
  const [interim, setInterim] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [interimTranslation, setInterimTranslation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const [micRequesting, setMicRequesting] = useState(false);
  const [speakTranslationEnabled, setSpeakTranslationEnabled] = useState(false);

  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const timerIdRef = useRef(null);
  const ttsQueueRef = useRef([]);
  const ttsPlayingRef = useRef(false);
  const ttsAudioRef = useRef(null);
  const speakEnabledRef = useRef(speakTranslationEnabled);
  speakEnabledRef.current = speakTranslationEnabled;
  const interimTranslateTimeoutRef = useRef(null);
  const interimSeqRef = useRef(0);

  const closeWs = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
  }, []);

  const stopMic = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (_) {}
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const stopTts = useCallback(() => {
    ttsQueueRef.current = [];
    ttsPlayingRef.current = false;
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.src = '';
      } catch (_) {}
      ttsAudioRef.current = null;
    }
  }, []);

  const processTtsQueue = useCallback(() => {
    if (ttsPlayingRef.current || ttsQueueRef.current.length === 0) return;
    const item = ttsQueueRef.current.shift();
    if (!item) {
      processTtsQueue();
      return;
    }
    ttsPlayingRef.current = true;
    speakTranslation({ text: item.text, language: item.language })
      .then((blob) => {
        // #region agent log
        try { fetch('http://127.0.0.1:7244/ingest/cfc990f1-eed1-486e-a93b-9964f3d2d406', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'session/page.js:ttsBlob', message: 'TTS blob received', data: { blobSize: blob?.size ?? 0, blobType: blob?.type ?? '' }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(() => {}); } catch (_) {}
        // #endregion
        if (!blob || blob.size === 0) {
          ttsPlayingRef.current = false;
          processTtsQueue();
          return;
        }
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        ttsAudioRef.current = audio;
        const cleanup = (source) => {
          // #region agent log
          try { fetch('http://127.0.0.1:7244/ingest/cfc990f1-eed1-486e-a93b-9964f3d2d406', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'session/page.js:ttsCleanup', message: 'TTS cleanup', data: { source }, timestamp: Date.now(), hypothesisId: 'H2_H4' }) }).catch(() => {}); } catch (_) {}
          // #endregion
          URL.revokeObjectURL(url);
          ttsAudioRef.current = null;
          ttsPlayingRef.current = false;
          processTtsQueue();
        };
        audio.addEventListener('ended', () => cleanup('ended'));
        audio.addEventListener('error', (e) => cleanup('error'));
        audio.play().catch(() => cleanup('playRejected'));
      })
      .catch(() => {
        ttsPlayingRef.current = false;
        processTtsQueue();
      });
  }, []);

  const handleSpeakTranslationToggle = useCallback((enabled) => {
    setSpeakTranslationEnabled(enabled);
    if (!enabled) stopTts();
  }, [stopTts]);

  const handleStopSession = useCallback(() => {
    stopTts();
    stopTimer();
    stopMic();
    closeWs();
    setSessionStartTime(null);
    router.push('/');
  }, [router, stopTimer, stopMic, closeWs, stopTts]);

  const effectiveSource = speakingLang;
  const effectiveTarget = speakingLang === from ? to : from;

  const handleSwitchDirection = useCallback(() => {
    setSourceText('');
    setInterim('');
    setTranslationText('');
    setInterimTranslation('');
    if (interimTranslateTimeoutRef.current) {
      clearTimeout(interimTranslateTimeoutRef.current);
      interimTranslateTimeoutRef.current = null;
    }
    setSpeakingLang((prev) => (prev === from ? to : from));
    if (isRecording) {
      stopTimer();
      stopMic();
      closeWs();
      setSessionStartTime(null);
      setIsRecording(false);
    }
  }, [from, to, isRecording, stopTimer, stopMic, closeWs]);

  const handleMicToggle = useCallback(async () => {
    if (isRecording) {
      stopTimer();
      stopMic();
      closeWs();
      setSessionStartTime(null);
      return;
    }

    setError(null);
    setMicRequesting(true);
    try {
      if (navigator.permissions?.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' });
          if (result.state === 'denied') {
            setMicRequesting(false);
            setError('Microphone is blocked for this site. Click the lock or info icon in your browser\'s address bar and set Microphone to Allow, then try again.');
            return;
          }
        } catch (_) {}
      }
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error('Microphone access timed out. The browser may not have shown a prompt. Click the lock or info icon in the address bar and set Microphone to Allow, then try again.')), 10000)
        ),
      ]);
      setMicRequesting(false);
      streamRef.current = stream;

      const targetRate = 16000;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const actualRate = ctx.sampleRate;

      const source = ctx.createMediaStreamSource(stream);
      const bufferSize = 4096;
      const scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = scriptNode;

      const wsUrl = getTranscriptWebSocketUrl(effectiveSource);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const INTERIM_DEBOUNCE_MS = 400;
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setError(msg.error);
            return;
          }
          if (msg.text != null) {
            if (msg.isFinal) {
              if (interimTranslateTimeoutRef.current) {
                clearTimeout(interimTranslateTimeoutRef.current);
                interimTranslateTimeoutRef.current = null;
              }
              setInterimTranslation('');
              setSourceText((prev) => (prev ? `${prev} ${msg.text}` : msg.text).trim());
              setInterim('');
              translateApi({ text: msg.text, sourceLang: effectiveSource, targetLang: effectiveTarget })
                .then((translated) => {
                  setTranslationText((prev) => (prev ? `${prev} ${translated}` : translated).trim());
                  const trimmed = (translated || '').trim();
                  if (speakEnabledRef.current && trimmed) {
                    ttsQueueRef.current.push({ text: trimmed, language: effectiveTarget });
                    processTtsQueue();
                  }
                })
                .catch((err) => setError(err.message));
            } else {
              setInterim(msg.text);
              const interimText = (msg.text || '').trim();
              if (!interimText) {
                setInterimTranslation('');
                if (interimTranslateTimeoutRef.current) {
                  clearTimeout(interimTranslateTimeoutRef.current);
                  interimTranslateTimeoutRef.current = null;
                }
                return;
              }
              if (interimTranslateTimeoutRef.current) {
                clearTimeout(interimTranslateTimeoutRef.current);
              }
              const gen = ++interimSeqRef.current;
              interimTranslateTimeoutRef.current = setTimeout(() => {
                interimTranslateTimeoutRef.current = null;
                translateApi({ text: interimText, sourceLang: effectiveSource, targetLang: effectiveTarget })
                  .then((translated) => {
                    if (gen === interimSeqRef.current) {
                      setInterimTranslation((translated || '').trim());
                    }
                  })
                  .catch(() => {});
              }, INTERIM_DEBOUNCE_MS);
            }
          }
        } catch (_) {}
      };

      let opened = false;
      ws.onerror = () => {
        if (!opened) setError('WebSocket error');
      };
      ws.onclose = (ev) => {
        if (!opened) {
          setIsRecording(false);
          stopMic();
          if (!ev.wasClean) setError('Could not connect to transcription service. Is the backend running on port 8000?');
        }
      };

      ws.binaryType = 'arraybuffer';

      function floatTo16kHzLinear16(inputFloat32) {
        const int16 = new Int16Array(inputFloat32.length);
        for (let i = 0; i < inputFloat32.length; i++) {
          const s = Math.max(-1, Math.min(1, inputFloat32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        const outLength = Math.floor(int16.length * targetRate / actualRate);
        const out = new Int16Array(outLength);
        for (let i = 0; i < outLength; i++) {
          const srcIdx = i * actualRate / targetRate;
          const lo = Math.floor(srcIdx);
          const hi = Math.min(lo + 1, int16.length - 1);
          const frac = srcIdx - lo;
          out[i] = Math.round(int16[lo] * (1 - frac) + int16[hi] * frac);
        }
        return out.buffer;
      }

      scriptNode.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        wsRef.current.send(floatTo16kHzLinear16(input));
      };

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;

      ws.onopen = () => {
        opened = true;
        source.connect(scriptNode);
        scriptNode.connect(gainNode);
        gainNode.connect(ctx.destination);
        setSessionStartTime(Date.now());
        setElapsedSeconds(0);
        timerIdRef.current = setInterval(() => {
          setElapsedSeconds((s) => s + 1);
        }, 1000);
        setIsRecording(true);
      };

      setIsRecording(true);
    } catch (err) {
      setMicRequesting(false);
      setError(err.message || 'Could not access microphone');
    }
  }, [effectiveSource, effectiveTarget, isRecording, stopMic, closeWs, stopTimer, processTtsQueue]);

  useEffect(() => {
    return () => {
      if (interimTranslateTimeoutRef.current) {
        clearTimeout(interimTranslateTimeoutRef.current);
        interimTranslateTimeoutRef.current = null;
      }
      stopTts();
      stopTimer();
      stopMic();
      closeWs();
    };
  }, [stopTimer, stopMic, closeWs, stopTts]);

  const displaySource = [sourceText, interim].filter(Boolean).join(' ');
  const displayTranslation = translationText + (interimTranslation ? ' ' + interimTranslation : '');

  return (
    <div className="flex h-screen flex-col bg-session-gradient">
      {micRequesting && (
        <div className="mx-4 mt-14 animate-fade-in rounded-2xl border border-indigo-200/60 bg-indigo-50/80 backdrop-blur-sm px-4 py-3 text-sm text-indigo-700 shadow-sm dark:border-indigo-800/40 dark:bg-indigo-900/20 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            Requesting microphone access… If no prompt appears, click the lock icon in the address bar.
          </div>
        </div>
      )}
      {error && (
        <div className="mx-4 mt-14 animate-fade-in rounded-2xl border border-amber-200/60 bg-amber-50/80 backdrop-blur-sm px-4 py-3 text-sm text-amber-700 shadow-sm dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden p-4 pt-16">
        <DualPane
          sourceText={displaySource}
          translationText={displayTranslation}
          onCopySource={(text) => navigator.clipboard?.writeText(text)}
          onCopyTranslation={(text) => navigator.clipboard?.writeText(text)}
        />
      </div>
      <SessionFooter
        elapsedSeconds={elapsedSeconds}
        isRecording={isRecording}
        onMicToggle={handleMicToggle}
        onStopSession={handleStopSession}
        sourceName={LANGUAGE_NAMES[effectiveSource] || effectiveSource}
        targetName={LANGUAGE_NAMES[effectiveTarget] || effectiveTarget}
        speakTranslationEnabled={speakTranslationEnabled}
        onSpeakTranslationToggle={handleSpeakTranslationToggle}
        twoWay={twoWay}
        onSwitchDirection={handleSwitchDirection}
        otherLangName={twoWay ? (LANGUAGE_NAMES[effectiveTarget] || effectiveTarget) : undefined}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-session-gradient">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading session…</p>
        </div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
