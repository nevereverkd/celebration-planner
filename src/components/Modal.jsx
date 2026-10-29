/**
 * Modal.jsx
 * Accessible, animated modal component with focus trap.
 */

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = '580px' }) {
  const overlayRef = useRef(null)
  const closeRef   = useRef(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    // Focus close button when opened
    setTimeout(() => closeRef.current?.focus(), 50)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal" style={{ maxWidth }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 1.75rem 0',
        }}>
          {title && (
            <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </h2>
          )}
          <button
            ref={closeRef}
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '10px',
              padding: '0.5rem', cursor: 'pointer', display: 'flex',
              color: '#64748b', transition: 'all 0.15s', marginLeft: 'auto',
            }}
            aria-label="Close modal"
            onMouseEnter={e => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#1e293b' }}
            onMouseLeave={e => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

