/**
 * Guests.jsx
 * Guest list manager with RSVP tracking and stats.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Users, Check, X, Clock, Search } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { calcGuestStats, getInitials, getAvatarColor } from '../utils/helpers'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import styles from './Guests.module.css'

const RSVP_OPTIONS = [
  { value: 'pending',   label: 'Pending',   emoji: '⏳', badge: 'badge-gold'  },
  { value: 'confirmed', label: 'Confirmed', emoji: '✅', badge: 'badge-green' },
  { value: 'declined',  label: 'Declined',  emoji: '❌', badge: 'badge-red'   },
]

const MEAL_OPTIONS = ['Standard', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Kids Meal', 'No Preference']

export default function Guests() {
  const { state, dispatch }       = useApp()
  const { toast }                 = useToast()
  const event                     = state.events.find(e => e.id === state.activeEventId)
  const [showModal, setShowModal]  = useState(false)
  const [editItem, setEditItem]    = useState(null)
  const [filter, setFilter]        = useState('all')
  const [search, setSearch]        = useState('')
  const [form, setForm]            = useState({ name: '', email: '', phone: '', rsvp: 'pending', meal: 'No Preference', table: '', notes: '', plusOne: false })

  if (!event) return <EmptyState emoji="👥" title="No event selected" />

  const guests  = event.guests || []
  const stats   = calcGuestStats(guests)

  const filtered = guests
    .filter(g => filter === 'all' || g.rsvp === filter)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase()))

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', email: '', phone: '', rsvp: 'pending', meal: 'No Preference', table: '', notes: '', plusOne: false })
    setShowModal(true)
  }

  function openEdit(g) {
    setEditItem(g)
    setForm({ name: g.name, email: g.email || '', phone: g.phone || '', rsvp: g.rsvp, meal: g.meal || 'No Preference', table: g.table || '', notes: g.notes || '', plusOne: g.plusOne || false })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) { toast('Guest name is required.', 'error'); return }
    const payload = { ...form, eventId: event.id }
    if (editItem) {
      dispatch({ type: ActionTypes.UPDATE_GUEST, payload: { ...payload, id: editItem.id } })
      toast('Guest updated! 👥', 'success')
    } else {
      dispatch({ type: ActionTypes.ADD_GUEST, payload })
      toast('Guest added! 🎉', 'success')
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (!confirm('Remove this guest?')) return
    dispatch({ type: ActionTypes.DELETE_GUEST, payload: { id, eventId: event.id } })
    toast('Guest removed.', 'info')
  }

  function quickRsvp(id, rsvp) {
    dispatch({ type: ActionTypes.UPDATE_GUEST, payload: { id, rsvp, eventId: event.id } })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>👥 Guest Manager</h1>
          <p className="section-subtitle">Manage attendees for <strong>{event.name}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Guest
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label: 'Total',     value: stats.total,     emoji: '👥', bg: '#ede9fe', color: '#7e22ce' },
          { label: 'Confirmed', value: stats.confirmed, emoji: '✅', bg: '#d1fae5', color: '#065f46' },
          { label: 'Pending',   value: stats.pending,   emoji: '⏳', bg: '#fef3c7', color: '#92400e' },
          { label: 'Declined',  value: stats.declined,  emoji: '❌', bg: '#fee2e2', color: '#991b1b' },
        ].map(s => (
          <div key={s.label} className={styles.statCard} style={{ background: s.bg }}>
            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RSVP progress bar */}
      {stats.total > 0 && (
        <div className={styles.rsvpBar}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ fontWeight: 600 }}>Response Rate</span>
            <span style={{ color: '#64748b' }}>{Math.round(((stats.confirmed + stats.declined) / stats.total) * 100)}%</span>
          </div>
          <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${(stats.confirmed / stats.total) * 100}%`, background: '#10b981', transition: 'width 0.5s ease' }} />
            <div style={{ width: `${(stats.declined / stats.total) * 100}%`, background: '#ef4444', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Confirmed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> Declined</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'inline-block' }} /> Pending</span>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      <div className={styles.controls}>
        <div className={styles.filterRow}>
          {['all', 'confirmed', 'pending', 'declined'].map(f => (
            <button
              key={f}
              className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${stats.total})` : `${RSVP_OPTIONS.find(r => r.value === f)?.emoji} ${f.charAt(0).toUpperCase() + f.slice(1)} (${stats[f]})`}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Guest List */}
      {filtered.length === 0 ? (
        <EmptyState emoji="🎈" title={guests.length === 0 ? "No guests yet!" : "No results"} description={guests.length === 0 ? "Start building your guest list!" : "Try a different filter or search."} action={guests.length === 0 ? <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add First Guest</button> : null} />
      ) : (
        <div className={styles.guestGrid}>
          {filtered.map(g => {
            const rsvp = RSVP_OPTIONS.find(r => r.value === g.rsvp)
            const avatarColor = getAvatarColor(g.name)
            return (
              <div key={g.id} className={styles.guestCard}>
                <div className={styles.guestTop}>
                  <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}>
                    {getInitials(g.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>{g.name}</div>
                    {g.email && <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{g.email}</div>}
                  </div>
                  <span className={`badge ${rsvp?.badge}`}>{rsvp?.emoji} {rsvp?.label}</span>
                </div>

                {/* Quick details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem 0' }}>
                  {g.meal && g.meal !== 'No Preference' && <span className="chip">🍽️ {g.meal}</span>}
                  {g.table && <span className="chip">🪑 Table {g.table}</span>}
                  {g.plusOne && <span className="chip">+1</span>}
                  {g.phone && <span className="chip">📞 {g.phone}</span>}
                </div>

                {/* Quick RSVP buttons */}
                <div className={styles.rsvpBtns}>
                  <button className={`${styles.rsvpBtn} ${g.rsvp === 'confirmed' ? styles.rsvpConfirmed : ''}`} onClick={() => quickRsvp(g.id, 'confirmed')} title="Confirm"><Check size={13} /></button>
                  <button className={`${styles.rsvpBtn} ${g.rsvp === 'declined' ? styles.rsvpDeclined : ''}`}  onClick={() => quickRsvp(g.id, 'declined')} title="Decline"><X size={13} /></button>
                  <button className={`${styles.rsvpBtn} ${g.rsvp === 'pending' ? styles.rsvpPending : ''}`}   onClick={() => quickRsvp(g.id, 'pending')} title="Set Pending"><Clock size={13} /></button>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)} aria-label="Edit"><Edit2 size={13} /></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(g.id)} style={{ color: '#ef4444' }} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? '✏️ Edit Guest' : '🎉 Add Guest'} maxWidth="560px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Sarah Johnson" autoFocus maxLength={80} />
          </div>
          <div className="input-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="sarah@email.com" maxLength={100} />
          </div>
          <div className="input-group">
            <label className="label">Phone</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 0000" maxLength={20} />
          </div>
          <div className="input-group">
            <label className="label">RSVP Status</label>
            <select className="input" value={form.rsvp} onChange={e => setForm(f => ({ ...f, rsvp: e.target.value }))}>
              {RSVP_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Meal Preference</label>
            <select className="input" value={form.meal} onChange={e => setForm(f => ({ ...f, meal: e.target.value }))}>
              {MEAL_OPTIONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Table #</label>
            <input className="input" value={form.table} onChange={e => setForm(f => ({ ...f, table: e.target.value }))} placeholder="e.g., 5" maxLength={10} />
          </div>
          <div className="input-group">
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special notes..." maxLength={200} />
          </div>
          <label className="checkbox-custom" style={{ alignSelf: 'center' }}>
            <input type="checkbox" checked={form.plusOne} onChange={e => setForm(f => ({ ...f, plusOne: e.target.checked }))} />
            <span style={{ fontSize: '0.9375rem', color: '#334155' }}>Bringing a +1</span>
          </label>
          <button className="btn btn-primary" onClick={handleSave} style={{ gridColumn: '1/-1', width: '100%' }}>
            {editItem ? 'Update Guest' : 'Add Guest'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

