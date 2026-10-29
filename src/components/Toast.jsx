/**
 * Toast.jsx
 * Accessible toast notification component.
 */

import React, { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'

const ICONS = {
  success: <CheckCircle2 size={18} color="#10B981" />,
  error:   <XCircle      size={18} color="#EF4444" />,
  warning: <AlertTriangle size={18} color="#F59E0B" />,
  info:    <Info          size={18} color="#3B82F6" />,
}

const BORDER_COLORS = {
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',
}

function ToastItem({ id, message, toastType = 'success' }) {
  const { dispatch } = useApp()

  const dismiss = () => dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id })

  useEffect(() => {
    const timer = setTimeout(dismiss, 4000)
    return () => clearTimeout(timer)
  }, [id])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`toast ${toastType}`}
      style={{ borderLeftColor: BORDER_COLORS[toastType] }}
    >
      {ICONS[toastType] || ICONS.info}
      <span style={{ flex: 1, fontSize: '0.9rem', color: '#334155' }}>{message}</span>
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', padding: '2px', display: 'flex',
          borderRadius: '4px', transition: 'color 0.15s',
        }}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export default function Toast() {
  const { state } = useApp()

  if (!state.toasts.length) return null

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {state.toasts.map(t => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  )
}

