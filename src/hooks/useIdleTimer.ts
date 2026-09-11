import { useCallback, useEffect, useRef, useState } from 'react'

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
] as const

interface UseIdleTimerOptions {
  /** Milliseconds of inactivity before the warning fires. */
  warningAfterMs: number
  /** Additional milliseconds after the warning before onIdle fires. */
  countdownMs: number
  /** Called once the full idle period (warning + countdown) elapses. */
  onIdle: () => void
  /** Set false to disable tracking entirely (e.g. no active session). */
  enabled?: boolean
}

interface UseIdleTimerResult {
  /** True once warningAfterMs of inactivity has elapsed. */
  isWarning: boolean
  /** Seconds remaining in the countdown, only meaningful while isWarning. */
  secondsRemaining: number
  /** Resets the idle clock, as if the user just interacted. */
  reset: () => void
}

export function useIdleTimer({
  warningAfterMs,
  countdownMs,
  onIdle,
  enabled = true,
}: UseIdleTimerOptions): UseIdleTimerResult {
  const [isWarning, setIsWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(countdownMs / 1000)
  )

  const warningTimeoutRef = useRef<number | undefined>(undefined)
  const idleTimeoutRef = useRef<number | undefined>(undefined)
  const intervalRef = useRef<number | undefined>(undefined)

  const clearTimers = useCallback(() => {
    window.clearTimeout(warningTimeoutRef.current)
    window.clearTimeout(idleTimeoutRef.current)
    window.clearInterval(intervalRef.current)
  }, [])

  // Pure side-effect: (re)schedules the warning/idle timers. Deliberately
  // contains no setState call of its own outside the async timer callbacks,
  // so it's safe to call directly from an effect body.
  const startTimers = useCallback(() => {
    clearTimers()
    if (!enabled) return

    warningTimeoutRef.current = window.setTimeout(() => {
      setIsWarning(true)

      const countdownStart = Date.now()
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - countdownStart
        const remaining = Math.max(0, Math.ceil((countdownMs - elapsed) / 1000))
        setSecondsRemaining(remaining)
      }, 1000)

      idleTimeoutRef.current = window.setTimeout(() => {
        window.clearInterval(intervalRef.current)
        onIdle()
      }, countdownMs)
    }, warningAfterMs)
  }, [clearTimers, countdownMs, enabled, onIdle, warningAfterMs])

  // Public reset: clears visible warning state AND restarts timers. Only
  // ever called from event handlers (the activity listener below, or a
  // "Stay signed in" button click) — never directly from an effect body —
  // so its synchronous setState calls are fine.
  const reset = useCallback(() => {
    setIsWarning(false)
    setSecondsRemaining(Math.ceil(countdownMs / 1000))
    startTimers()
  }, [countdownMs, startTimers])

  useEffect(() => {
    // Only schedules timers; no setState call happens synchronously here —
    // isWarning/secondsRemaining already start at their correct defaults.
    startTimers()

    if (!enabled) return

    // Only resets on activity while NOT already warning — once the warning
    // is showing, only the explicit "stay signed in" action (reset()) should
    // clear it, not incidental mouse movement the user didn't intend as a
    // response to the dialog.
    const handleActivity = () => {
      if (!isWarning) reset()
    }

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    )

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      )
    }

    // isWarning, reset, and startTimers are intentionally excluded. Re-running
    // this effect on every identity/state change would tear down and
    // reattach listeners on every timer tick or activity event, defeating
    // the timer. Only enabled changing should reinitialize tracking.
  }, [enabled])

  return { isWarning, secondsRemaining, reset }
}
