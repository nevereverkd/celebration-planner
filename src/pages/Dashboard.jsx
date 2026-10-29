/**
 * Dashboard.jsx
 * Main event overview with stats, progress rings, and quick actions.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, DollarSign, Users, CheckSquare, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import {
  getEventConfig, formatDate, daysUntil, formatCurrency,
  calcBudgetStats, calcGuestStats, calcChecklistProgress, calcMilestoneProgress,
} from '../utils/helpers'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const navigate            = useNavigate()
  const event               = state.events.find(e => e.id === state.activeEventId)

  if (!event) {
    return (
      <div className={styles.page}>
        <EmptyState
          emoji="🎉"
          title="No Event Yet!"
          description="Create your first event or load a sample celebration to explore all features."
          action={
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/new-event')}>
                <Plus size={18} /> Create Your First Event
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => dispatch({ type: ActionTypes.LOAD_DEMO_DATA })}
              >
                ✨ Load Sample Event
              </button>
            </div>
          }
        />
      </div>
    )
  }

  const cfg       = getEventConfig(event.type)
  const budget    = calcBudgetStats(event)
  const guests    = calcGuestStats(event.guests)
  const checklist = calcChecklistProgress(event.checklist)
  const timeline  = calcMilestoneProgress(event.milestones)
  const days      = daysUntil(event.date)

  const stats = [
    {
      label: 'Budget Used',
      value: formatCurrency(budget.spent),
      sub: `of ${formatCurrency(budget.budget)}`,
      pct: budget.pct,
      color: budget.pct > 90 ? '#ef4444' : budget.pct > 70 ? '#f59e0b' : '#10b981',
      icon: <DollarSign size={20} />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      onClick: () => navigate('/budget'),
    },
    {
      label: 'Guests',
      value: guests.confirmed,
      sub: `confirmed of ${guests.total}`,
      pct: guests.total > 0 ? (guests.confirmed / guests.total) * 100 : 0,
      color: '#3b82f6',
      icon: <Users size={20} />,
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      onClick: () => navigate('/guests'),
    },
    {
      label: 'Checklist',
      value: `${checklist.pct}%`,
      sub: `${checklist.done} of ${checklist.total} done`,
      pct: checklist.pct,
      color: '#8b5cf6',
      icon: <CheckSquare size={20} />,
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      onClick: () => navigate('/checklist'),
    },
    {
      label: 'Milestones',
      value: `${timeline.pct}%`,
      sub: `${timeline.completed} of ${timeline.total} done`,
      pct: timeline.pct,
      color: '#ec4899',
      icon: <TrendingUp size={20} />,
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      onClick: () => navigate('/timeline'),
    },
  ]

  const quickActions = [
    { label: 'Add Expense',    emoji: '💸', path: '/budget',     bg: '#fef3c7' },
    { label: 'Add Vendor',     emoji: '🤝', path: '/vendors',    bg: '#d1fae5' },
    { label: 'Add Guest',      emoji: '👥', path: '/guests',     bg: '#dbeafe' },
    { label: 'AI Ideas',       emoji: '✨', path: '/ai-planner', bg: '#ede9fe' },
  ]

  // Upcoming milestones
  const upcoming = (event.milestones || [])
    .filter(m => !m.completed)
    .sort((a, b) => (a.daysBeforeEvent || 0) - (b.daysBeforeEvent || 0))
    .slice(0, 3)

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero} style={{ background: cfg.gradient }}>
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.heroEmoji}>{cfg.emoji}</div>
            <div>
              <h1 className={styles.heroTitle}>{event.name}</h1>
              <div className={styles.heroMeta}>
                <span className={styles.heroBadge}>{cfg.label}</span>
                {event.venue && <span className={styles.heroVenue}>📍 {event.venue}</span>}
              </div>
              <div className={styles.heroDate}>
                <Calendar size={15} /> {formatDate(event.date)}
              </div>
            </div>
          </div>
          <div className={styles.heroCountdown}>
            {days !== null ? (
              <>
                <div className={styles.countdownNum}>
                  {days > 0 ? days : days === 0 ? '🎉' : Math.abs(days)}
                </div>
                <div className={styles.countdownLabel}>
                  {days > 0 ? 'days to go' : days === 0 ? 'Today!' : 'days ago'}
                </div>
              </>
            ) : (
              <div className={styles.countdownLabel}>Date TBD</div>
            )}
          </div>
        </div>
        <div className={styles.heroWave} aria-hidden="true" />
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <button key={s.label} className={styles.statCard} onClick={s.onClick}>
            <div className={styles.statTop}>
              <div className={styles.statIconWrap} style={{ background: s.gradient }}>
                {s.icon}
              </div>
              <ProgressRing pct={s.pct} size={56} stroke={5} color={s.color} label={`${Math.round(s.pct)}%`} />
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statSub}>{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <div className="section-header">
          <div>
            <div className="section-title">Quick Actions</div>
            <div className="section-subtitle">Jump right in</div>
          </div>
        </div>
        <div className={styles.quickGrid}>
          {quickActions.map(a => (
            <button
              key={a.label}
              className={styles.quickCard}
              onClick={() => navigate(a.path)}
              style={{ background: a.bg }}
            >
              <span className={styles.quickEmoji}>{a.emoji}</span>
              <span className={styles.quickLabel}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        {/* Budget Progress */}
        <div className={styles.card}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <div className="section-title" style={{ fontSize: '1.1rem' }}>💰 Budget Overview</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/budget')}>View All</button>
          </div>
          <div className={styles.budgetBars}>
            <BudgetRow label="Total Budget" amount={budget.budget} max={budget.budget} color="#8b5cf6" />
            <BudgetRow label="Spent" amount={budget.spent} max={budget.budget} color={budget.pct > 90 ? '#ef4444' : '#f59e0b'} />
            <BudgetRow label="Remaining" amount={Math.max(budget.remaining, 0)} max={budget.budget} color="#10b981" />
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className={styles.card}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <div className="section-title" style={{ fontSize: '1.1rem' }}>📅 Upcoming Tasks</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/timeline')}>View All</button>
          </div>
          {upcoming.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcoming.map(m => (
                <div key={m.id} className={styles.milestoneRow}>
                  <div className={styles.milestoneDot} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{m.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{m.description}</div>
                  </div>
                  {m.daysBeforeEvent && (
                    <span className="badge badge-purple">{m.daysBeforeEvent}d before</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🗓️"
              title="No milestones yet"
              description="Use AI Planner to generate a timeline!"
            />
          )}
        </div>

        {/* AI Suggestion Card */}
        <div className={styles.aiCard}>
          <div className={styles.aiCardInner}>
            <div className={styles.aiIcon}><Sparkles size={24} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#4c1d95', marginBottom: '0.25rem' }}>
                AI Planner Ready ✨
              </div>
              <div style={{ fontSize: '0.875rem', color: '#7e22ce', lineHeight: 1.5 }}>
                Get personalized ideas, vendor lists & a full timeline — all powered by Gemini AI.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/ai-planner')}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <Sparkles size={16} /> Open AI Planner
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetRow({ label, amount, max, color }) {
  const pct = max > 0 ? (amount / max) * 100 : 0
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
        <span style={{ color: '#64748b', fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(amount)}</span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

