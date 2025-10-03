import { useEffect, useRef, useState } from "react"

/**
 * Live countdown that triggers onTimeout ONCE per deadline.
 * Resets automatically when deadlineISO changes.
 */
export function useCountdown(deadlineISO?: string | null, onTimeout?: () => void) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const firedForDeadline = useRef<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!deadlineISO) {
      setRemaining(null)
      firedForDeadline.current = null
      return
    }

    // reset “fired” flag for the new deadline
    firedForDeadline.current = null
    const deadlineMs = Date.parse(deadlineISO)

    const tick = () => {
      const now = Date.now()
      const secs = Math.max(0, Math.ceil((deadlineMs - now) / 1000))
      setRemaining(secs)

      // fire exactly once for this deadline
      if (secs <= 0 && firedForDeadline.current !== deadlineISO) {
        firedForDeadline.current = deadlineISO
        onTimeout?.()
      }
    }

    tick() // immediate
    intervalRef.current = window.setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [deadlineISO, onTimeout])

  return remaining
}
