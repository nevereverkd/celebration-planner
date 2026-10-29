/**
 * NewEvent.jsx
 * Multi-step event creation wizard with premium UI.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { EVENT_TYPES } from '../utils/helpers'
import styles from './NewEvent.module.css'

const STEPS = ['Event Type', 'Basic Info', 'Budget & Guests', 'Confirm']

const INITIAL_FORM = {
  type: '',
  name: '',
  date: '',
  venue: '',
  description: '',
  theme: '',
  budget: '',
  guestCount: '',
}

export default function NewEvent() {
  const { dispatch }   = useApp()
  const navigate       = useNavigate()
  const { toast }      = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  function canNext() {
    if (step === 0) return !!form.type
    if (step === 1) return form.name.trim().length >= 2 && !!form.date
    if (step === 2) return Number(form.budget) > 0 && Number(form.guestCount) > 0
    return true
  }

  function handleCreate() {
    dispatch({
      type: ActionTypes.ADD_EVENT,
      payload: {
        ...form,
        budget:     Number(form.budget),
        guestCount: Number(form.guestCount),
      },
    })
    toast(`🎉 "${form.name}" created! Let's start planning!`, 'success')
    navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgDeco} aria-hidden="true">
        <div className={styles.bgBlob1} />
        <div className={styles.bgBlob2} />
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            style={{ color: '#64748b' }}
          >
            <ArrowLeft size={16} /> {step === 0 ? 'Back' : 'Previous'}
          </button>
          <div className={styles.stepIndicator}>
            {STEPS.map((s, i) => (
              <div key={i} className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step label */}
        <div className={styles.stepLabel}>
          <span className={styles.stepNum}>Step {step + 1} of {STEPS.length}</span>
          <h1 className={styles.stepTitle}>{STEPS[step]}</h1>
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          {step === 0 && <StepType form={form} update={update} />}
          {step === 1 && <StepInfo form={form} update={update} />}
          {step === 2 && <StepBudget form={form} update={update} />}
          {step === 3 && <StepConfirm form={form} />}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              style={{ width: '100%' }}
            >
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCreate}
              style={{ width: '100%', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
            >
              <Sparkles size={18} /> Create My Event!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Step 1: Event Type ──────────────────────────────────────── */
function StepType({ form, update }) {
  return (
    <div className={styles.typeGrid}>
      {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
        <button
          key={key}
          className={`${styles.typeCard} ${form.type === key ? styles.typeCardActive : ''}`}
          onClick={() => update('type', key)}
          aria-pressed={form.type === key}
        >
          <span className={styles.typeEmoji}>{cfg.emoji}</span>
          <span className={styles.typeLabel}>{cfg.label}</span>
          {form.type === key && (
            <div className={styles.typeCheck}><Check size={12} /></div>
          )}
        </button>
      ))}
    </div>
  )
}

/* ── Step 2: Basic Info ──────────────────────────────────────── */
function StepInfo({ form, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="input-group">
        <label className="label">Event Name *</label>
        <input
          className="input"
          type="text"
          placeholder={`e.g., "Sarah & John's Wedding"`}
          value={form.name}
          onChange={e => update('name', e.target.value)}
          maxLength={80}
          autoFocus
        />
      </div>
      <div className="input-group">
        <label className="label">Event Date *</label>
        <input
          className="input"
          type="date"
          value={form.date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => update('date', e.target.value)}
        />
      </div>
      <div className="input-group">
        <label className="label">Venue / Location</label>
        <input
          className="input"
          type="text"
          placeholder="e.g., The Grand Ballroom, NYC"
          value={form.venue}
          onChange={e => update('venue', e.target.value)}
          maxLength={100}
        />
      </div>
      <div className="input-group">
        <label className="label">Theme / Style</label>
        <input
          className="input"
          type="text"
          placeholder="e.g., Rustic, Modern, Tropical, Vintage..."
          value={form.theme}
          onChange={e => update('theme', e.target.value)}
          maxLength={60}
        />
      </div>
      <div className="input-group">
        <label className="label">Description / Notes</label>
        <textarea
          className="input"
          placeholder="Any special requirements, ideas, or notes..."
          value={form.description}
          onChange={e => update('description', e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>
    </div>
  )
}

/* ── Step 3: Budget & Guests ──────────────────────────────────── */
function StepBudget({ form, update }) {
  const budgetPresets = [5000, 10000, 25000, 50000, 100000]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="input-group">
        <label className="label">Total Budget (USD) *</label>
        <input
          className="input"
          type="number"
          placeholder="e.g., 25000"
          value={form.budget}
          onChange={e => update('budget', e.target.value)}
          min={0}
          max={10000000}
        />
        {/* Quick presets */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {budgetPresets.map(b => (
            <button
              key={b}
              type="button"
              className="chip chip-removable"
              onClick={() => update('budget', b)}
              style={Number(form.budget) === b ? { background: '#ede9fe', borderColor: '#8b5cf6', color: '#7e22ce' } : {}}
            >
              ${b.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label className="label">Expected Guest Count *</label>
        <input
          className="input"
          type="number"
          placeholder="e.g., 150"
          value={form.guestCount}
          onChange={e => update('guestCount', e.target.value)}
          min={1}
          max={100000}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {[20, 50, 100, 200, 500].map(g => (
            <button
              key={g}
              type="button"
              className="chip chip-removable"
              onClick={() => update('guestCount', g)}
              style={Number(form.guestCount) === g ? { background: '#ede9fe', borderColor: '#8b5cf6', color: '#7e22ce' } : {}}
            >
              {g} guests
            </button>
          ))}
        </div>
      </div>

      {form.budget && form.guestCount && (
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff, #fce7f3)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '14px',
          padding: '1rem',
          fontSize: '0.9rem',
          color: '#6b21a8',
        }}>
          💡 That's approximately <strong>${Math.round(Number(form.budget) / Number(form.guestCount)).toLocaleString()}</strong> per guest — {Number(form.budget) / Number(form.guestCount) > 200 ? 'a premium experience! 🌟' : 'great for a memorable event! 🎉'}
        </div>
      )}
    </div>
  )
}

/* ── Step 4: Confirm ─────────────────────────────────────────── */
function StepConfirm({ form }) {
  const cfg = EVENT_TYPES[form.type]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        background: `linear-gradient(135deg, ${cfg.bg}, white)`,
        borderRadius: '16px',
        padding: '1.5rem',
        border: `1px solid ${cfg.color}30`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{cfg.emoji}</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {form.name}
        </h2>
        <span className="badge badge-purple">{cfg.label}</span>
      </div>

      {[
        { label: '📅 Date',   value: new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: '📍 Venue',  value: form.venue || 'TBD' },
        { label: '🎨 Theme',  value: form.theme || 'TBD' },
        { label: '💰 Budget', value: `$${Number(form.budget).toLocaleString()}` },
        { label: '👥 Guests', value: `${Number(form.guestCount).toLocaleString()} guests` },
      ].map(row => (
        <div key={row.label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: '#f8fafc',
          borderRadius: '10px',
          fontSize: '0.9375rem',
        }}>
          <span style={{ color: '#64748b' }}>{row.label}</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{row.value}</span>
        </div>
      ))}

      <div style={{
        background: 'linear-gradient(135deg, #ede9fe, #fce7f3)',
        borderRadius: '12px',
        padding: '1rem',
        fontSize: '0.875rem',
        color: '#7e22ce',
        textAlign: 'center',
      }}>
        ✨ Ready to make magic? Your AI planner will help you every step of the way!
      </div>
    </div>
  )
}

