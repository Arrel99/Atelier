'use client'

import { useEffect, useRef } from 'react'

// Represents one slot dot state
type DotState = 'filled' | 'empty' | 'pulse'

const GRID_COLS = 8
const GRID_ROWS = 5
const TOTAL = GRID_COLS * GRID_ROWS

// Static layout — deterministic so it's the same on every render
const DOT_STATES: DotState[] = Array.from({ length: TOTAL }, (_, i) => {
  if ([2, 3, 5, 9, 10, 13, 18, 21, 25, 27, 30, 33].includes(i)) return 'filled'
  if ([7, 15, 22].includes(i)) return 'pulse'
  return 'empty'
})

export default function HeroSlotGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Stagger animation on mount
  useEffect(() => {
    const dots = containerRef.current?.querySelectorAll<HTMLElement>('[data-dot]')
    if (!dots) return
    dots.forEach((dot, i) => {
      dot.style.transitionDelay = `${i * 18}ms`
      dot.style.opacity = dot.dataset.opacity ?? '1'
    })
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="select-none"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gap: '10px',
        width: '100%',
        maxWidth: 320,
      }}
    >
      {DOT_STATES.map((state, i) => (
        <Dot key={i} state={state} index={i} />
      ))}
    </div>
  )
}

function Dot({ state, index }: { state: DotState; index: number }) {
  const base = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    transition: 'opacity 0.4s ease',
    transitionDelay: `${index * 18}ms`,
  }

  if (state === 'filled') {
    return (
      <div
        data-dot
        data-opacity="1"
        style={{
          ...base,
          background: '#87CEEB',
          opacity: 0,
        }}
      />
    )
  }

  if (state === 'pulse') {
    return (
      <div
        data-dot
        data-opacity="0.6"
        style={{
          ...base,
          background: '#87CEEB',
          opacity: 0,
          animation: 'slotPulse 2.4s ease-in-out infinite',
          animationDelay: `${index * 0.3}s`,
        }}
      />
    )
  }

  // empty
  return (
    <div
      data-dot
      data-opacity="0.15"
      style={{
        ...base,
        background: 'hsl(197 30% 12%)',
        opacity: 0,
      }}
    />
  )
}
