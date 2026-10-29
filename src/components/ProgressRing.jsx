/**
 * ProgressRing.jsx
 * Animated SVG circular progress indicator.
 */

import React from 'react'

export default function ProgressRing({ pct = 0, size = 80, stroke = 7, color = '#8B5CF6', label }) {
  const radius      = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset        = circumference - (pct / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      {/* Center label */}
      {label !== undefined && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontSize: size < 70 ? '0.7rem' : '0.875rem',
          fontWeight: 700,
          color: '#1e293b',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

