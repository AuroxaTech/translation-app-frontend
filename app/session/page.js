'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DualPane from '@/components/DualPane';
import SessionFooter from '@/components/SessionFooter';
import { translate as translateApi, getTranscriptWebSocketUrl } from '@/lib/api';

const LANGUAGE_NAMES = { en: 'English', ar: 'Arabic', ur: 'Urdu', es: 'Spanish', fr: 'French', hi: 'Hindi' };

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'en';
  const to = searchParams.get('to') || 'ar';

  const [sourceText, setSourceText] = useState('');
  const [interim, setInterim] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const [micRequesting, setMicRequesting] = useState(false);

  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const timerIdRef = useRef(null);

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

  const handleStopSession = useCallback(() => {
    stopTimer();
    stopMic();
    closeWs();
    setSessionStartTime(null);
    router.push('/');
  }, [router, stopTimer, stopMic, closeWs]);

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

      const wsUrl = getTranscriptWebSocketUrl(from);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setError(msg.error);
            return;
          }
          if (msg.text != null) {
            if (msg.isFinal) {
              setSourceText((prev) => (prev ? `${prev} ${msg.text}` : msg.text).trim());
              setInterim('');
              translateApi({ text: msg.text, sourceLang: from, targetLang: to })
                .then((translated) => {
                  setTranslationText((prev) => (prev ? `${prev} ${translated}` : translated).trim());
                })
                .catch((err) => setError(err.message));
            } else {
              setInterim(msg.text);
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
  }, [from, to, isRecording, stopMic, closeWs, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      stopMic();
      closeWs();
    };
  }, [stopTimer, stopMic, closeWs]);

  const displaySource = [sourceText, interim].filter(Boolean).join(' ');

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {micRequesting && (
        <div className="bg-blue-50 px-4 py-2 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          Requesting microphone access… If no prompt appears, click the lock or info icon in the address bar and set Microphone to Allow.
        </div>
      )}
      {error && (
        <div className="bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-hidden p-4">
        <DualPane
          sourceText={displaySource}
          translationText={translationText}
          onCopySource={(text) => navigator.clipboard?.writeText(text)}
        />
      </div>
      <SessionFooter
        elapsedSeconds={elapsedSeconds}
        isRecording={isRecording}
        onMicToggle={handleMicToggle}
        onStopSession={handleStopSession}
        sourceName={LANGUAGE_NAMES[from] || from}
        targetName={LANGUAGE_NAMES[to] || to}
      />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
      <SessionContent />
    </Suspense>
  );
}
