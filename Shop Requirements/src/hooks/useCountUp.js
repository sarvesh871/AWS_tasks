import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const to = Number(target) || 0
    const from = fromRef.current
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (to - from) * eased)
      setValue(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}
