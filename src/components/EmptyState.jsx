/**
 * EmptyState.jsx
 * Reusable empty state component with fun illustration.
 */

import React from 'react'

export default function EmptyState({ emoji = '🎈', title, description, action }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-emoji animate-float">{emoji}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-text">{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  )
}

