/**
 * Settings.jsx
 * App settings: API key, event management, preferences.
 */

import React, { useState } from 'react'
import { Key, Trash2, Eye, EyeOff, Save, AlertTriangle, Info, Cloud, Database, RefreshCw, LogOut } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { getEventConfig, formatDate, formatCurrency, calcBudgetStats } from '../utils/helpers'
import { deleteEventsFromCloud, firebaseConfig, signOut } from '../utils/firebase'
import styles from './Settings.module.css'

export default function Settings() {
  const { state, dispatch, triggerCloudSync, triggerCloudLoad } = useApp()
  const { toast }                                               = useToast()
  const [apiKey, setApiKey]                                     = useState(state.apiKey || '')
  const [showKey, setShowKey]                                   = useState(false)
  const [deleteConfirm, setDeleteConfirm]                       = useState(null)
  const [syncing, setSyncing]                                   = useState(false)

  function saveApiKey() {
    const trimmed = apiKey.trim()
    if (!trimmed) { toast('Please enter a valid API key.', 'error'); return }
    dispatch({ type: ActionTypes.SET_API_KEY, payload: trimmed })
    toast('API key saved! ✅', 'success')
  }

  function handleDeleteEvent(id) {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }
    dispatch({ type: ActionTypes.DELETE_EVENT, payload: id })
    setDeleteConfirm(null)
    toast('Event deleted.', 'info')
  }

  function clearApiKey() {
    setApiKey('')
    dispatch({ type: ActionTypes.SET_API_KEY, payload: '' })
    toast('API key cleared.', 'info')
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>⚙️ Settings</h1>
        <p className="section-subtitle">Configure your CelebrateAI experience</p>
      </div>

      <div className={styles.grid}>
        {/* API Key Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <Key size={20} color="white" />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Gemini API Key</h2>
              <p className={styles.cardDesc}>Required for AI-powered planning features</p>
            </div>
          </div>

          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '12px', padding: '0.875rem', marginBottom: '1.25rem',
            display: 'flex', gap: '0.625rem', fontSize: '0.875rem', color: '#1e40af',
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              Get your free API key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                aistudio.google.com
              </a>
              . Your key is saved in this browser and sent directly to Google when you use AI. Do not use a shared device.
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="label">API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIza..."
                maxLength={200}
                style={{ paddingRight: '3rem' }}
              />
              <button
                onClick={() => setShowKey(s => !s)}
                style={{
                  position: 'absolute', right: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex',
                }}
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={saveApiKey} style={{ flex: 1 }}>
              <Save size={16} /> Save API Key
            </button>
            {state.apiKey && (
              <button className="btn btn-ghost" onClick={clearApiKey} style={{ color: '#ef4444' }}>
                Clear
              </button>
            )}
          </div>

          {state.apiKey ? (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#10b981', fontWeight: 500 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              API key configured — AI features are active!
            </div>
          ) : (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#7e22ce', fontWeight: 500 }}>
              ✨ Add a Gemini API key to enable live AI. Firebase keys are not Gemini keys.
            </div>
          )}
        </div>

        {/* Firebase Cloud Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <span style={{ fontSize: '1.25rem' }}>🔥</span>
            </div>
            <div>
              <h2 className={styles.cardTitle}>Firebase Cloud Sync</h2>
              <p className={styles.cardDesc}>Cloud Firestore & Analytics Integration</p>
            </div>
          </div>

          <div className={styles.aboutGrid} style={{ marginBottom: '1.25rem' }}>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Project ID</span>
              <span className={styles.aboutValue}>{firebaseConfig.projectId}</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Firestore Sync</span>
              <span className={styles.aboutValue} style={{ color: '#7c3aed' }}>{state.firebaseUser ? 'Connected' : 'Sign in required'}</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>Analytics ID</span>
              <span className={styles.aboutValue}>{firebaseConfig.measurementId}</span>
            </div>
            <div className={styles.aboutRow}>
              <span className={styles.aboutLabel}>User ID</span>
              <span className={styles.aboutValue} style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                {state.firebaseUser?.uid ? `${state.firebaseUser.uid.slice(0, 14)}...` : 'Connecting...'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={async () => {
                setSyncing(true)
                await triggerCloudSync()
                setSyncing(false)
              }}
              disabled={syncing}
              style={{ flex: 1, minWidth: '150px' }}
            >
              <Cloud size={16} /> {syncing ? 'Syncing...' : 'Sync to Cloud'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={async () => {
                setSyncing(true)
                await triggerCloudLoad()
                setSyncing(false)
              }}
              disabled={syncing}
              style={{ flex: 1, minWidth: '150px' }}
            >
              <RefreshCw size={16} /> Restore from Cloud
            </button>
          </div>

          {state.lastCloudSync && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
              Last synchronized: <strong>{state.lastCloudSync}</strong>
            </div>
          )}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #eee8f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ fontSize: '.875rem', color: '#64748b' }}>{state.firebaseUser?.email || 'Signed in account'}</span>
            <button className="btn btn-ghost" onClick={() => signOut()}><LogOut size={15} /> Sign out</button>
          </div>
        </div>

        {/* About Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <span style={{ fontSize: '1.25rem' }}>🎉</span>
            </div>
            <div>
              <h2 className={styles.cardTitle}>About CelebrateAI</h2>
              <p className={styles.cardDesc}>Your premium AI event planning companion</p>
            </div>
          </div>

          <div className={styles.aboutGrid}>
            {[
              { label: 'Version',    value: '1.0.0' },
              { label: 'AI Model',   value: 'Gemini 2.0 Flash' },
              { label: 'Events',     value: state.events.length },
              { label: 'Storage',    value: 'Local Browser' },
            ].map(r => (
              <div key={r.label} className={styles.aboutRow}>
                <span className={styles.aboutLabel}>{r.label}</span>
                <span className={styles.aboutValue}>{r.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'linear-gradient(135deg, #faf5ff, #fce7f3)', borderRadius: '12px', fontSize: '0.8125rem', color: '#7e22ce', lineHeight: 1.6 }}>
            ✨ Planner data is stored in this browser and can be synced to your private Firebase account. AI features send prompts to Google when enabled.
          </div>
        </div>

        {/* Data & Privacy */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <AlertTriangle size={20} color="white" />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Data & Privacy</h2>
              <p className={styles.cardDesc}>Manage your stored data</p>
            </div>
          </div>

          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '0.875rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#991b1b' }}>
            <strong>⚠️ Warning:</strong> Clearing data deletes this account’s planner data from this browser and its Firebase document. This cannot be undone.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                dispatch({ type: ActionTypes.LOAD_DEMO_DATA })
                toast('✨ Sample Celebration loaded!', 'success')
              }}
            >
              🎉 Load Demo Event
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
                  try {
                    if (state.firebaseUser?.uid) {
                      localStorage.removeItem(`celebrateai_state_v1_${state.firebaseUser.uid}`)
                      await deleteEventsFromCloud(state.firebaseUser.uid)
                    }
                    dispatch({ type: ActionTypes.RESET_DATA })
                    toast('Your planner data was deleted.', 'info')
                  } catch {
                    toast('Could not delete cloud data. Please try again.', 'error')
                  }
                }
              }}
            >
              <Trash2 size={16} /> Clear All App Data
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
          <h2 className={styles.cardTitle} style={{ marginBottom: '1.25rem' }}>📋 Manage Events ({state.events.length})</h2>
          {state.events.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.9rem' }}>
              No events created yet. Create your first event to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {state.events.map(ev => {
                const cfg    = getEventConfig(ev.type)
                const budget = calcBudgetStats(ev)
                return (
                  <div key={ev.id} className={styles.eventRow}>
                    <div className={styles.eventRowLeft}>
                      <span style={{ fontSize: '1.625rem' }}>{cfg.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9375rem' }}>
                          {ev.name}
                          {ev.id === state.activeEventId && <span className="badge badge-purple" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>Active</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          {cfg.label} · {formatDate(ev.date)} · Budget: {formatCurrency(budget.budget)} · {ev.guests?.length || 0} guests
                        </div>
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${deleteConfirm === ev.id ? 'btn-danger' : 'btn-ghost'}`}
                      onClick={() => handleDeleteEvent(ev.id)}
                      style={{ flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                      {deleteConfirm === ev.id ? 'Confirm Delete' : 'Delete'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

