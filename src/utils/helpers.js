/**
 * helpers.js
 * Utility helper functions used across the application.
 */

import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'

/* ── Currency Formatting ────────────────────────────────────── */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0)
}

/* ── Date Formatting ────────────────────────────────────────── */
export function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr) {
  if (!dateStr) return 'TBD'
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    return differenceInDays(parseISO(dateStr), new Date())
  } catch {
    return null
  }
}

export function timeFromNow(dateStr) {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return ''
  }
}

/* ── Budget Calculations ─────────────────────────────────────── */
export function calcBudgetStats(event) {
  const budget   = event?.budget || 0
  const expenses = event?.expenses || []
  const spent    = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const remaining = budget - spent
  const pct       = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  return { budget, spent, remaining, pct }
}

/* ── Guest Stats ─────────────────────────────────────────────── */
export function calcGuestStats(guests = []) {
  const total    = guests.length
  const confirmed = guests.filter(g => g.rsvp === 'confirmed').length
  const declined  = guests.filter(g => g.rsvp === 'declined').length
  const pending   = guests.filter(g => g.rsvp === 'pending').length
  return { total, confirmed, declined, pending }
}

/* ── Checklist Progress ──────────────────────────────────────── */
export function calcChecklistProgress(checklist = []) {
  const total = checklist.length
  const done  = checklist.filter(c => c.done).length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, pct }
}

/* ── Milestone Progress ──────────────────────────────────────── */
export function calcMilestoneProgress(milestones = []) {
  const total     = milestones.length
  const completed = milestones.filter(m => m.completed).length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, pct }
}

/* ── Event Type Config ────────────────────────────────────────── */
export const EVENT_TYPES = {
  wedding: {
    label:    'Wedding',
    emoji:    '💍',
    gradient: 'linear-gradient(135deg, #e879f9, #a855f7)',
    color:    '#a855f7',
    bg:       '#faf5ff',
  },
  birthday: {
    label:    'Birthday',
    emoji:    '🎂',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color:    '#f59e0b',
    bg:       '#fffbeb',
  },
  corporate: {
    label:    'Corporate',
    emoji:    '🏢',
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color:    '#3b82f6',
    bg:       '#eff6ff',
  },
  community: {
    label:    'Community',
    emoji:    '🌟',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    color:    '#10b981',
    bg:       '#ecfdf5',
  },
  graduation: {
    label:    'Graduation',
    emoji:    '🎓',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color:    '#8b5cf6',
    bg:       '#f5f3ff',
  },
  anniversary: {
    label:    'Anniversary',
    emoji:    '💑',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    color:    '#ec4899',
    bg:       '#fdf2f8',
  },
  baby_shower: {
    label:    'Baby Shower',
    emoji:    '👶',
    gradient: 'linear-gradient(135deg, #60a5fa, #34d399)',
    color:    '#60a5fa',
    bg:       '#eff6ff',
  },
  holiday: {
    label:    'Holiday Party',
    emoji:    '🎄',
    gradient: 'linear-gradient(135deg, #ef4444, #16a34a)',
    color:    '#ef4444',
    bg:       '#fef2f2',
  },
}

export function getEventConfig(type) {
  return EVENT_TYPES[type] || EVENT_TYPES.birthday
}

/* ── Priority Colors ──────────────────────────────────────────── */
export const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: '#fee2e2', badge: 'badge-red'   },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7', badge: 'badge-gold'  },
  low:    { label: 'Low',    color: '#10b981', bg: '#d1fae5', badge: 'badge-green' },
}

/* ── Vendor Categories ───────────────────────────────────────── */
export const VENDOR_CATEGORIES = [
  { value: 'venue',        label: 'Venue',          emoji: '🏛️' },
  { value: 'catering',     label: 'Catering',       emoji: '🍽️' },
  { value: 'photography',  label: 'Photography',    emoji: '📸' },
  { value: 'music',        label: 'Music/DJ',       emoji: '🎵' },
  { value: 'decor',        label: 'Décor & Floral', emoji: '💐' },
  { value: 'transport',    label: 'Transportation', emoji: '🚌' },
  { value: 'entertainment',label: 'Entertainment',  emoji: '🎭' },
  { value: 'cake',         label: 'Cake & Desserts',emoji: '🎂' },
  { value: 'officiant',    label: 'Officiant',      emoji: '📜' },
  { value: 'hair_makeup',  label: 'Hair & Makeup',  emoji: '💄' },
  { value: 'other',        label: 'Other',          emoji: '📦' },
]

/* ── Vendor Status ────────────────────────────────────────────── */
export const VENDOR_STATUS = {
  researching: { label: 'Researching', badge: 'badge-blue'   },
  contacted:   { label: 'Contacted',   badge: 'badge-purple' },
  quoted:      { label: 'Quoted',      badge: 'badge-gold'   },
  booked:      { label: 'Booked',      badge: 'badge-green'  },
  cancelled:   { label: 'Cancelled',   badge: 'badge-red'    },
}

/* ── Confetti Animation ──────────────────────────────────────── */
export function triggerConfetti(element) {
  const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div')
    confetti.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 6}px;
      height: ${Math.random() * 10 + 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: ${Math.random() * 100}vw;
      top: -20px;
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${Math.random() * 2 + 1.5}s linear ${Math.random() * 0.5}s forwards;
    `
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3500)
  }
}

/* ── Sanitize text (XSS prevention) ─────────────────────────── */
export function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/[<>&"']/g, ch => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[ch]))
}

/* ── Clamp number ─────────────────────────────────────────────── */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/* ── Generate avatar initials ─────────────────────────────────── */
export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── Avatar color based on name ──────────────────────────────── */
const AVATAR_COLORS = ['#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#06B6D4']
export function getAvatarColor(name = '') {
  const idx = name.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

