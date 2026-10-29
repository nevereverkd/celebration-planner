/**
 * Budget.jsx
 * Full budget tracker with expense management, charts, and AI breakdown.
 */

import React, { useState } from 'react'
import { Plus, Trash2, Edit2, TrendingUp, DollarSign, Sparkles, PieChart } from 'lucide-react'
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useApp, ActionTypes } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { formatCurrency, calcBudgetStats } from '../utils/helpers'
import { generateBudgetBreakdown } from '../utils/gemini'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ProgressRing from '../components/ProgressRing'
import styles from './Budget.module.css'

const EXPENSE_CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Music/DJ', 'Décor & Florals',
  'Transportation', 'Entertainment', 'Attire', 'Cake & Desserts',
  'Invitations', 'Hair & Makeup', 'Accommodation', 'Gifts', 'Miscellaneous',
]

const CHART_COLORS = ['#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#06B6D4','#F97316','#14B8A6','#6366F1']

export default function Budget() {
  const { state, dispatch }    = useApp()
  const { toast }              = useToast()
  const event                  = state.events.find(e => e.id === state.activeEventId)
  const [showModal, setShowModal]     = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [aiLoading, setAiLoading]    = useState(false)
  const [aiBreakdown, setAiBreakdown] = useState(null)
  const [form, setForm] = useState({ name: '', amount: '', category: 'Venue', notes: '', paid: false })

  if (!event) return <NeedsEvent />

  const stats = calcBudgetStats(event)

  function openAdd() {
    setEditExpense(null)
    setForm({ name: '', amount: '', category: 'Venue', notes: '', paid: false })
    setShowModal(true)
  }

  function openEdit(expense) {
    setEditExpense(expense)
    setForm({ name: expense.name, amount: expense.amount, category: expense.category, notes: expense.notes || '', paid: expense.paid || false })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.name.trim() || !form.amount || Number(form.amount) <= 0) {
      toast('Please fill in name and a valid amount.', 'error')
      return
    }
    const payload = { ...form, amount: Number(form.amount), eventId: event.id }
    if (editExpense) {
      dispatch({ type: ActionTypes.UPDATE_EXPENSE, payload: { ...payload, id: editExpense.id } })
      toast('Expense updated! 💸', 'success')
    } else {
      dispatch({ type: ActionTypes.ADD_EXPENSE, payload })
      toast('Expense added! 💸', 'success')
    }
    setShowModal(false)
  }

  function handleDelete(id) {
    if (!confirm('Delete this expense?')) return
    dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: { id, eventId: event.id } })
    toast('Expense removed.', 'info')
  }

  async function handleAiBreakdown() {
    if (!event.budget) { toast('Set a budget for your event first!', 'warning'); return }
    setAiLoading(true)
    try {
      const data = await generateBudgetBreakdown(state.apiKey, event)
      setAiBreakdown(data)
      toast('AI budget breakdown generated! 🎯', 'success')
    } catch (err) {
      toast(err.message || 'AI generation failed.', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  // Group expenses by category for chart
  const categoryTotals = (event.expenses || []).reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
    return acc
  }, {})
  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>💰 Budget Tracker</h1>
          <p className="section-subtitle">Track every penny for <strong>{event.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleAiBreakdown} disabled={aiLoading}>
            <Sparkles size={16} /> {aiLoading ? 'Generating…' : 'AI Budget Breakdown'}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        {[
          { label: 'Total Budget', value: formatCurrency(stats.budget), color: '#8b5cf6', emoji: '🎯', bg: 'linear-gradient(135deg,#ede9fe,#faf5ff)' },
          { label: 'Total Spent',  value: formatCurrency(stats.spent),  color: stats.pct > 90 ? '#ef4444' : '#f59e0b', emoji: '💸', bg: 'linear-gradient(135deg,#fef3c7,#fffbeb)' },
          { label: 'Remaining',    value: formatCurrency(Math.max(stats.remaining, 0)), color: '#10b981', emoji: '🏦', bg: 'linear-gradient(135deg,#d1fae5,#ecfdf5)' },
          { label: 'Expenses',     value: event.expenses?.length || 0,  color: '#3b82f6', emoji: '📋', bg: 'linear-gradient(135deg,#dbeafe,#eff6ff)' },
        ].map(s => (
          <div key={s.label} className={styles.summaryCard} style={{ background: s.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, marginTop: '0.25rem', lineHeight: 1 }}>{s.value}</div>
              </div>
              <span style={{ fontSize: '1.75rem' }}>{s.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Progress Bar */}
      <div className={styles.progressCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>Budget Usage</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatCurrency(stats.spent)} of {formatCurrency(stats.budget)}</span>
            <ProgressRing pct={stats.pct} size={48} stroke={5} color={stats.pct > 90 ? '#ef4444' : '#8b5cf6'} label={`${Math.round(stats.pct)}%`} />
          </div>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{
              width: `${stats.pct}%`,
              background: stats.pct > 90 ? 'linear-gradient(135deg,#ef4444,#dc2626)' : stats.pct > 70 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : undefined,
            }}
          />
        </div>
        {stats.pct > 90 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: '#ef4444', fontWeight: 500 }}>
            ⚠️ You've used {Math.round(stats.pct)}% of your budget!
          </div>
        )}
      </div>

      {/* Main Content: Chart + List */}
      <div className={styles.mainGrid}>
        {/* Expense List */}
        <div className={styles.card}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            All Expenses ({event.expenses?.length || 0})
          </h2>
          {!event.expenses?.length ? (
            <EmptyState emoji="💸" title="No expenses yet" description="Add your first expense to start tracking your budget." />
          ) : (
            <div className={styles.expenseList}>
              {event.expenses.map(exp => (
                <div key={exp.id} className={styles.expenseRow}>
                  <div className={styles.expenseCatDot} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b' }}>{exp.name}</span>
                      <span className={`badge ${exp.paid ? 'badge-green' : 'badge-gold'}`}>
                        {exp.paid ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '2px' }}>{exp.category}</div>
                    {exp.notes && <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>"{exp.notes}"</div>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', marginRight: '0.5rem' }}>
                    {formatCurrency(exp.amount)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(exp)} aria-label="Edit expense">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(exp.id)} aria-label="Delete expense" style={{ color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart + AI Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pie Chart */}
          {chartData.length > 0 && (
            <div className={styles.card}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                🥧 Spending by Category
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPie>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          )}

          {/* AI Budget Breakdown */}
          {aiBreakdown && (
            <div className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={18} color="#8b5cf6" />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>AI Recommended Allocation</h2>
              </div>
              {aiBreakdown.map((item, i) => (
                <div key={i} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{item.emoji} {item.category}</span>
                    <span style={{ color: '#64748b' }}>{item.percentage}% · {formatCurrency(item.amount)}</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar" style={{ width: `${item.percentage}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>{item.notes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editExpense ? '✏️ Edit Expense' : '💸 Add Expense'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div className="input-group">
            <label className="label">Expense Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Venue Deposit" maxLength={80} autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="label">Amount (USD) *</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" min={0} />
            </div>
            <div className="input-group">
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label className="label">Notes (optional)</label>
            <input className="input" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes about this expense..." maxLength={200} />
          </div>
          <label className="checkbox-custom">
            <input type="checkbox" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))} />
            <span style={{ fontSize: '0.9375rem', color: '#334155' }}>Mark as paid ✅</span>
          </label>
          <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
            {editExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function NeedsEvent() {
  return <EmptyState emoji="💰" title="No event selected" description="Create or select an event to track budget." />
}

