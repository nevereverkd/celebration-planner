/**
 * Checklist.jsx
 * Smart checklist with categories, priorities, and progress tracking.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { calcChecklistProgress, triggerConfetti } from '../utils/helpers'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ProgressRing from '../components/ProgressRing'
import styles from './Checklist.module.css'

const CHECKLIST_CATEGORIES = [
  { value: 'all',            label: 'All',            emoji: '📋' },
  { value: 'venue',          label: 'Venue',          emoji: '🏛️' },
  { value: 'catering',       label: 'Catering',       emoji: '🍽️' },
  { value: 'entertainment',  label: 'Entertainment',  emoji: '🎵' },
  { value: 'logistics',      label: 'Logistics',      emoji: '🚚' },
  { value: 'communication',  label: 'Communication',  emoji: '📣' },
  { value: 'personal',       label: 'Personal',       emoji: '👗' },
  { value: 'other',          label: 'Other',          emoji: '📦' },
]

// Built-in starter checklists per event type
const STARTER_ITEMS = {
  wedding: [
    { text: 'Book ceremony venue', category: 'venue' },
    { text: 'Book reception venue', category: 'venue' },
    { text: 'Book caterer / choose menu', category: 'catering' },
    { text: 'Order wedding cake', category: 'catering' },
    { text: 'Book photographer & videographer', category: 'entertainment' },
    { text: 'Book DJ / live band', category: 'entertainment' },
    { text: 'Send save-the-dates', category: 'communication' },
    { text: 'Send invitations', category: 'communication' },
    { text: 'Order wedding dress / attire', category: 'personal' },
    { text: 'Arrange floral décor', category: 'logistics' },
    { text: 'Plan honeymoon / post-wedding travel', category: 'logistics' },
    { text: 'Arrange transportation', category: 'logistics' },
  ],
  birthday: [
    { text: 'Choose venue / location', category: 'venue' },
    { text: 'Order birthday cake', category: 'catering' },
    { text: 'Plan menu / food & drinks', category: 'catering' },
    { text: 'Send invitations', category: 'communication' },
    { text: 'Book entertainment', category: 'entertainment' },
    { text: 'Buy decorations', category: 'logistics' },
    { text: 'Organize games / activities', category: 'entertainment' },
    { text: 'Arrange return gifts / favors', category: 'logistics' },
  ],
}

export default function Checklist() {
  const { state, dispatch }       = useApp()
  const { toast }                 = useToast()
  const event                     = state.events.find(e => e.id === state.activeEventId)
  const [showModal, setShowModal]  = useState(false)
  const [catFilter, setCatFilter]  = useState('all')
  const [form, setForm]            = useState({ text: '', category: 'other', priority: 'medium' })

  if (!event) return <EmptyState emoji="✅" title="No event selected" description="Create or select an event first." />

  const checklist = event.checklist || []
  const progress  = calcChecklistProgress(checklist)
  const filtered  = catFilter === 'all' ? checklist : checklist.filter(c => c.category === catFilter)
  const todo      = filtered.filter(c => !c.done)
  const done      = filtered.filter(c => c.done)

  function handleAdd() {
    if (!form.text.trim()) { toast('Please enter a task.', 'error'); return }
    dispatch({ type: ActionTypes.ADD_CHECKLIST_ITEM, payload: { ...form, eventId: event.id } })
    toast('Task added! ✅', 'success')
    setForm(f => ({ ...f, text: '' }))
    setShowModal(false)
  }

  function handleToggle(id) {
    const item = checklist.find(c => c.id === id)
    dispatch({ type: ActionTypes.TOGGLE_CHECKLIST_ITEM, payload: { eventId: event.id, id } })
    if (!item?.done) {
      // Was incomplete, now completing
      const newDone = done.length + 1
      if (newDone === checklist.length) triggerConfetti()
      else toast('Task complete! 🎉', 'success')
    }
  }

  function handleDelete(id) {
    dispatch({ type: ActionTypes.DELETE_CHECKLIST_ITEM, payload: { id, eventId: event.id } })
  }

  function loadStarter() {
    const starter = STARTER_ITEMS[event.type] || STARTER_ITEMS.birthday
    starter.forEach(item => {
      dispatch({ type: ActionTypes.ADD_CHECKLIST_ITEM, payload: { ...item, priority: 'medium', eventId: event.id } })
    })
    toast(`✅ ${starter.length} starter tasks loaded!`, 'success')
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>✅ Event Checklist</h1>
          <p className="section-subtitle">Stay on track for <strong>{event.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {checklist.length === 0 && (
            <button className="btn btn-secondary" onClick={loadStarter}>
              🚀 Load Starter Checklist
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Progress Header */}
      <div className={styles.progressCard}>
        <ProgressRing pct={progress.pct} size={80} stroke={8} color={progress.pct === 100 ? '#10b981' : '#8b5cf6'} label={`${progress.pct}%`} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.375rem', color: '#1e293b' }}>
            {progress.pct === 100 ? '🎉 All Done! Amazing!' : `${progress.done} of ${progress.total} tasks complete`}
          </div>
          <div style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {progress.total - progress.done} tasks remaining
          </div>
          <div className="progress" style={{ marginTop: '0.875rem' }}>
            <div className="progress-bar" style={{ width: `${progress.pct}%`, background: progress.pct === 100 ? 'linear-gradient(135deg,#10b981,#059669)' : undefined }} />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className={styles.filterRow}>
        {CHECKLIST_CATEGORIES.map(c => (
          <button
            key={c.value}
            className={`${styles.filterTab} ${catFilter === c.value ? styles.filterTabActive : ''}`}
            onClick={() => setCatFilter(c.value)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {checklist.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="Checklist is empty!"
          description="Add tasks or load a starter checklist tailored to your event type."
          action={<button className="btn btn-secondary" onClick={loadStarter}>🚀 Load Starter</button>}
        />
      ) : (
        <div className={styles.listWrap}>
          {/* To-do items */}
          {todo.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>To Do ({todo.length})</div>
              {todo.map(item => <CheckItem key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} />)}
            </div>
          )}

          {/* Done items */}
          {done.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel} style={{ color: '#10b981' }}>✅ Completed ({done.length})</div>
              {done.map(item => <CheckItem key={item.id} item={item} onToggle={handleToggle} onDelete={handleDelete} done />)}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="✅ Add Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="input-group">
            <label className="label">Task *</label>
            <input className="input" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="e.g., Book the venue" maxLength={150} autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CHECKLIST_CATEGORIES.filter(c => c.value !== 'all').map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} style={{ width: '100%' }}>Add Task</button>
        </div>
      </Modal>
    </div>
  )
}

function CheckItem({ item, onToggle, onDelete, done }) {
  const catInfo = {
    venue: '🏛️', catering: '🍽️', entertainment: '🎵',
    logistics: '🚚', communication: '📣', personal: '👗', other: '📦',
  }
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

  return (
    <div className={`${styles.checkItem} ${done ? styles.checkItemDone : ''}`}>
      <button
        className={`${styles.checkBox} ${done ? styles.checkBoxDone : ''}`}
        onClick={() => onToggle(item.id)}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done && <Check size={12} />}
      </button>
      <span className={styles.checkEmoji}>{catInfo[item.category] || '📦'}</span>
      <span className={`${styles.checkText} ${done ? styles.checkTextDone : ''}`}>{item.text}</span>
      {item.priority && !done && (
        <div className={styles.priorityDot} style={{ background: priorityColors[item.priority] }} title={`${item.priority} priority`} />
      )}
      <button className="btn btn-ghost btn-sm" onClick={() => onDelete(item.id)} style={{ color: '#cbd5e1', opacity: 0, transition: 'opacity 0.15s' }} aria-label="Delete task">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

