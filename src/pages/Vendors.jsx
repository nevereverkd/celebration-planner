/**
 * Vendors.jsx
 * Vendor management with status tracking and AI checklist generation.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Edit2, Sparkles, Phone, Mail, Globe, DollarSign } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { VENDOR_CATEGORIES, VENDOR_STATUS, formatCurrency } from '../utils/helpers'
import { generateVendorChecklist } from '../utils/gemini'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import styles from './Vendors.module.css'

export default function Vendors() {
  const { state, dispatch }       = useApp()
  const { toast }                 = useToast()
  const event                     = state.events.find(e => e.id === state.activeEventId)
  const [showModal, setShowModal]  = useState(false)
  const [editItem, setEditItem]    = useState(null)
  const [aiLoading, setAiLoading]  = useState(false)
  const [aiChecklist, setAiChecklist] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({ name: '', category: 'venue', status: 'researching', contactName: '', phone: '', email: '', website: '', quote: '', notes: '' })

  if (!event) return <EmptyState emoji="🤝" title="No event selected" description="Create or select an event first." />

  const vendors = event.vendors || []
  const filtered = filterStatus === 'all' ? vendors : vendors.filter(v => v.status === filterStatus)

  const bookedCount     = vendors.filter(v => v.status === 'booked').length
  const totalQuoted     = vendors.reduce((s, v) => s + (Number(v.quote) || 0), 0)

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', category: 'venue', status: 'researching', contactName: '', phone: '', email: '', website: '', quote: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(v) {
    setEditItem(v)
    setForm({ name: v.name, category: v.category, status: v.status, contactName: v.contactName || '', phone: v.phone || '', email: v.email || '', website: v.website || '', quote: v.quote || '', notes: v.notes || '' })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim()) { toast('Please enter a vendor name.', 'error'); return }
    const payload = { ...form, quote: form.quote ? Number(form.quote) : null, eventId: event.id }
    if (editItem) {
      dispatch({ type: ActionTypes.UPDATE_VENDOR, payload: { ...payload, id: editItem.id } })
      toast('Vendor updated! 🤝', 'success')
    } else {
      dispatch({ type: ActionTypes.ADD_VENDOR, payload })
      toast('Vendor added! 🤝', 'success')
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (!confirm('Delete this vendor?')) return
    dispatch({ type: ActionTypes.DELETE_VENDOR, payload: { id, eventId: event.id } })
    toast('Vendor removed.', 'info')
  }

  async function handleAiChecklist() {
    setAiLoading(true)
    try {
      const data = await generateVendorChecklist(state.apiKey, event)
      setAiChecklist(data)
      toast('AI vendor checklist generated! ✅', 'success')
    } catch (err) {
      toast(err.message || 'AI generation failed.', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  const catMap = Object.fromEntries(VENDOR_CATEGORIES.map(c => [c.value, c]))

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>🤝 Vendor Manager</h1>
          <p className="section-subtitle">Manage all vendors for <strong>{event.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleAiChecklist} disabled={aiLoading}>
            <Sparkles size={16} /> {aiLoading ? 'Generating…' : 'AI Vendor Checklist'}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Vendors', value: vendors.length, emoji: '📋' },
          { label: 'Booked',        value: bookedCount,    emoji: '✅' },
          { label: 'Total Quoted',  value: formatCurrency(totalQuoted), emoji: '💰' },
          { label: 'Remaining',     value: vendors.length - bookedCount, emoji: '⏳' },
        ].map(s => (
          <div key={s.label} className={styles.statChip}>
            <span>{s.emoji}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className={styles.filterRow}>
        {['all', ...Object.keys(VENDOR_STATUS)].map(s => (
          <button
            key={s}
            className={`${styles.filterTab} ${filterStatus === s ? styles.filterTabActive : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'All' : VENDOR_STATUS[s].label}
            <span className={styles.filterCount}>
              {s === 'all' ? vendors.length : vendors.filter(v => v.status === s).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Vendor Cards */}
        <div>
          {filtered.length === 0 ? (
            <EmptyState emoji="🤝" title="No vendors yet" description="Add your first vendor or let AI suggest a complete list." action={<button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add Vendor</button>} />
          ) : (
            <div className={styles.vendorGrid}>
              {filtered.map(v => {
                const cat = catMap[v.category]
                const status = VENDOR_STATUS[v.status] || VENDOR_STATUS.researching
                return (
                  <div key={v.id} className={styles.vendorCard}>
                    <div className={styles.vendorCardTop}>
                      <div className={styles.vendorCatIcon}>{cat?.emoji || '📦'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{v.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{cat?.label || v.category}</div>
                      </div>
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                    </div>

                    <div className={styles.vendorDetails}>
                      {v.contactName && <Detail icon={<span>👤</span>} text={v.contactName} />}
                      {v.phone && <Detail icon={<Phone size={13} />} text={v.phone} href={`tel:${v.phone}`} />}
                      {v.email && <Detail icon={<Mail size={13} />} text={v.email} href={`mailto:${v.email}`} />}
                      {v.website && <Detail icon={<Globe size={13} />} text={v.website} href={v.website.startsWith('http') ? v.website : `https://${v.website}`} />}
                      {v.quote && <Detail icon={<DollarSign size={13} />} text={formatCurrency(v.quote)} />}
                    </div>

                    {v.notes && <div style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic', padding: '0 0 0.5rem', lineHeight: 1.5 }}>"{v.notes}"</div>}

                    <div className={styles.vendorActions}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)} style={{ flex: 1 }}><Edit2 size={13} /> Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(v.id)} style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Checklist Panel */}
        {aiChecklist && (
          <div className={styles.aiPanel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={18} color="#8b5cf6" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>AI Vendor Checklist</h2>
            </div>
            {aiChecklist.map((cat, i) => (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>
                  {cat.emoji} {cat.category}
                </div>
                {cat.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>
                    <span>•</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? '✏️ Edit Vendor' : '🤝 Add Vendor'} maxWidth="620px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label className="label">Vendor / Business Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Perfect Moments Photography" autoFocus maxLength={100} />
          </div>
          <div className="input-group">
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {VENDOR_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(VENDOR_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Contact Name</label>
            <input className="input" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder="e.g., Jane Smith" maxLength={80} />
          </div>
          <div className="input-group">
            <label className="label">Quote Amount</label>
            <input className="input" type="number" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="0" min={0} />
          </div>
          <div className="input-group">
            <label className="label">Phone</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 123-4567" maxLength={20} />
          </div>
          <div className="input-group">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" maxLength={100} />
          </div>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label className="label">Website</label>
            <input className="input" type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://www.vendorsite.com" maxLength={200} />
          </div>
          <div className="input-group" style={{ gridColumn: '1/-1' }}>
            <label className="label">Notes</label>
            <textarea className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this vendor..." rows={2} maxLength={300} />
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ gridColumn: '1/-1', width: '100%' }}>
            {editItem ? 'Update Vendor' : 'Add Vendor'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Detail({ icon, text, href }) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: href ? '#3b82f6' : '#64748b' }}>
      <span style={{ color: '#94a3b8', flexShrink: 0 }}>{icon}</span>
      <span style={{ wordBreak: 'break-all' }}>{text}</span>
    </div>
  )
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{content}</a>
    : content
}

