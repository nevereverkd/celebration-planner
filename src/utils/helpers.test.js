/**
 * helpers.test.js
 * Comprehensive unit tests using Node's native test runner (node:test & node:assert).
 */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcBudgetStats,
  calcGuestStats,
  calcChecklistProgress,
  calcMilestoneProgress,
  formatCurrency,
  getEventConfig,
  sanitizeText,
  getInitials,
  getAvatarColor,
  clamp,
} from './helpers.js'

describe('Budget Calculations', () => {
  test('calculates correct spent and remaining amounts', () => {
    const event = {
      budget: 10000,
      expenses: [
        { amount: 3000 },
        { amount: 2500 },
        { amount: 500 },
      ],
    }
    const stats = calcBudgetStats(event)
    assert.equal(stats.budget, 10000)
    assert.equal(stats.spent, 6000)
    assert.equal(stats.remaining, 4000)
    assert.equal(stats.pct, 60)
  })

  test('handles zero budget and empty expenses without dividing by zero', () => {
    const stats = calcBudgetStats({ budget: 0, expenses: [] })
    assert.equal(stats.spent, 0)
    assert.equal(stats.remaining, 0)
    assert.equal(stats.pct, 0)
  })

  test('clamps percentage to 100 when over budget', () => {
    const event = {
      budget: 5000,
      expenses: [{ amount: 7000 }],
    }
    const stats = calcBudgetStats(event)
    assert.equal(stats.spent, 7000)
    assert.equal(stats.remaining, -2000)
    assert.equal(stats.pct, 100)
  })
})

describe('Guest Stats', () => {
  test('counts RSVP statuses accurately', () => {
    const guests = [
      { rsvp: 'confirmed' },
      { rsvp: 'confirmed' },
      { rsvp: 'declined' },
      { rsvp: 'pending' },
    ]
    const stats = calcGuestStats(guests)
    assert.equal(stats.total, 4)
    assert.equal(stats.confirmed, 2)
    assert.equal(stats.declined, 1)
    assert.equal(stats.pending, 1)
  })

  test('handles empty guest list gracefully', () => {
    const stats = calcGuestStats([])
    assert.equal(stats.total, 0)
    assert.equal(stats.confirmed, 0)
    assert.equal(stats.declined, 0)
    assert.equal(stats.pending, 0)
  })
})

describe('Checklist & Milestone Progress', () => {
  test('calculates checklist percentage accurately', () => {
    const items = [
      { done: true },
      { done: true },
      { done: false },
      { done: false },
    ]
    const progress = calcChecklistProgress(items)
    assert.equal(progress.total, 4)
    assert.equal(progress.done, 2)
    assert.equal(progress.pct, 50)
  })

  test('calculates milestone progress accurately', () => {
    const milestones = [
      { completed: true },
      { completed: true },
      { completed: true },
    ]
    const progress = calcMilestoneProgress(milestones)
    assert.equal(progress.total, 3)
    assert.equal(progress.completed, 3)
    assert.equal(progress.pct, 100)
  })
})

describe('Security & Text Sanitization', () => {
  test('escapes HTML special characters to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script>&foo=\'bar\''
    const sanitized = sanitizeText(malicious)
    assert.ok(!sanitized.includes('<script>'))
    assert.ok(sanitized.includes('&lt;script&gt;'))
    assert.ok(sanitized.includes('&quot;xss&quot;'))
    assert.ok(sanitized.includes('&#39;bar&#39;'))
  })

  test('handles non-string values safely', () => {
    assert.equal(sanitizeText(null), '')
    assert.equal(sanitizeText(undefined), '')
    assert.equal(sanitizeText(12345), '')
  })
})

describe('Formatting & Utility Functions', () => {
  test('formatCurrency formats USD correctly', () => {
    const formatted = formatCurrency(25000, 'USD')
    assert.ok(formatted.includes('25,000'))
  })

  test('getEventConfig returns proper configuration for known and unknown types', () => {
    const wedding = getEventConfig('wedding')
    assert.equal(wedding.label, 'Wedding')
    assert.equal(wedding.emoji, '💍')

    const unknown = getEventConfig('unknown_random_type')
    assert.ok(unknown.label)
  })

  test('getInitials extracts up to 2 uppercase initials', () => {
    assert.equal(getInitials('Sophia Bennett'), 'SB')
    assert.equal(getInitials('Julian'), 'J')
    assert.equal(getInitials('Lucas Alexander Miller'), 'LA')
    assert.equal(getInitials(''), '')
  })

  test('getAvatarColor returns a deterministic color from name', () => {
    const c1 = getAvatarColor('Elena')
    const c2 = getAvatarColor('Elena')
    assert.equal(c1, c2)
  })

  test('clamp bounds values properly', () => {
    assert.equal(clamp(50, 0, 100), 50)
    assert.equal(clamp(-10, 0, 100), 0)
    assert.equal(clamp(150, 0, 100), 100)
  })
})

