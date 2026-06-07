'use client'

import { useRef, useEffect, useCallback } from 'react'

type AutoResizeTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxHeight?: number
  onEnterSend?: () => void
}

export default function AutoResizeTextarea({
  maxHeight,
  onEnterSend,
  className = '',
  onChange,
  onKeyDown,
  ...props
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const minHeightRef = useRef<number | null>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const next = Math.max(el.scrollHeight, minHeightRef.current ?? 0)
    if (maxHeight !== undefined && next > maxHeight) {
      el.style.height = `${maxHeight}px`
      el.style.overflowY = 'auto'
    } else {
      el.style.height = `${next}px`
      el.style.overflowY = 'hidden'
    }
  }, [maxHeight])

  // mount: capture rows-based initial height as minimum, then resize
  useEffect(() => {
    if (ref.current && minHeightRef.current === null) {
      minHeightRef.current = ref.current.offsetHeight
    }
    resize()
  }, [resize])

  // resize whenever value changes (controlled input)
  useEffect(() => {
    resize()
  }, [props.value, resize])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e)
    resize()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onEnterSend && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onEnterSend()
    }
    onKeyDown?.(e)
  }

  return (
    <textarea
      ref={ref}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={`resize-none ${className}`}
      {...props}
    />
  )
}
