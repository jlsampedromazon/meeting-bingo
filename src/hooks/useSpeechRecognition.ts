import { useCallback, useEffect, useRef, useState } from 'react'
import type { SpeechRecognitionState } from '../types'

const SpeechRecognitionCtor: SpeechRecognitionConstructor | undefined =
  typeof window !== 'undefined'
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition
    : undefined

/** Errors after which we must NOT auto-restart (would spin a denied mic). */
const FATAL_ERRORS = new Set(['not-allowed', 'service-not-allowed'])

const MAX_BACKOFF_MS = 2000
const BASE_BACKOFF_MS = 300

interface Options {
  /** Called with each NEW final transcript chunk (not the accumulation). */
  onResult?: (finalChunk: string) => void
  lang?: string
}

export interface UseSpeechRecognition extends SpeechRecognitionState {
  /** Begin listening (sets the wantListening intent). */
  start: () => void
  /** Stop listening (clears the intent — no auto-restart after this). */
  stop: () => void
  /** Clear the accumulated transcript. */
  reset: () => void
}

/**
 * Web Speech API wrapper with a SAFE auto-restart (plan §8.8):
 * `onend → start()` is gated behind a `wantListening` ref + a fatal-error flag
 * + exponential backoff, so a denied or repeatedly-erroring mic never
 * spin-restarts. All event handlers read refs (never stale-closure state).
 */
export function useSpeechRecognition(options: Options = {}): UseSpeechRecognition {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionCtor,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  })

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const wantListeningRef = useRef(false)
  const fatalRef = useRef(false)
  const attemptsRef = useRef(0)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the latest onResult without re-creating the recognition instance,
  // so the result callback is never a stale closure.
  const onResultRef = useRef<Options['onResult']>(options.onResult)
  useEffect(() => {
    onResultRef.current = options.onResult
  }, [options.onResult])

  useEffect(() => {
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = options.lang ?? 'en-US'

    recognition.onstart = () => {
      attemptsRef.current = 0
      setState((prev) => ({ ...prev, isListening: true, error: null }))
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) final += result[0].transcript
        else interim += result[0].transcript
      }
      attemptsRef.current = 0 // healthy stream
      setState((prev) => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }))
      if (final) onResultRef.current?.(final)
    }

    recognition.onerror = (event) => {
      if (FATAL_ERRORS.has(event.error)) {
        fatalRef.current = true
        wantListeningRef.current = false // never restart a denied mic
      }
      setState((prev) => ({ ...prev, error: event.error, isListening: false }))
    }

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }))
      if (!wantListeningRef.current || fatalRef.current) return
      // Backoff so a flapping mic can't busy-loop.
      const delay = Math.min(BASE_BACKOFF_MS * 2 ** attemptsRef.current, MAX_BACKOFF_MS)
      attemptsRef.current += 1
      restartTimerRef.current = setTimeout(() => {
        if (!wantListeningRef.current || fatalRef.current) return
        try {
          recognition.start()
        } catch {
          // Already started — ignore.
        }
      }, delay)
    }

    recognitionRef.current = recognition

    return () => {
      wantListeningRef.current = false
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.stop()
      } catch {
        // Not running — ignore.
      }
      recognitionRef.current = null
    }
  }, [options.lang])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    wantListeningRef.current = true
    fatalRef.current = false
    attemptsRef.current = 0
    setState((prev) => ({ ...prev, error: null }))
    try {
      recognitionRef.current.start()
    } catch {
      // Already started — ignore.
    }
  }, [])

  const stop = useCallback(() => {
    wantListeningRef.current = false
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    setState((prev) => ({ ...prev, isListening: false }))
    try {
      recognitionRef.current?.stop()
    } catch {
      // Not running — ignore.
    }
  }, [])

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: '', interimTranscript: '' }))
  }, [])

  return { ...state, start, stop, reset }
}
