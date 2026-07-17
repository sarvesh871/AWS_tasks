import { useState, useCallback, useRef } from 'react'

let idCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++idCounter
      setToasts((current) => [...current, { id, message, type }])
      timers.current[id] = setTimeout(() => removeToast(id), duration)
      return id
    },
    [removeToast]
  )

  return { toasts, showToast, removeToast }
}
