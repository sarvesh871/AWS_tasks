import { useCountUp } from '../hooks/useCountUp.js'

export default function AnimatedCounter({ value, formatter }) {
  const animated = useCountUp(value)
  const display = formatter ? formatter(animated) : animated.toLocaleString()
  return <span className="animated-counter">{display}</span>
}
