/**
 * Sidebar.jsx
 * Premium navigation sidebar with event switcher and nav links.
 */

import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, DollarSign, Users, CheckSquare,
  Sparkles, Settings, ChevronDown, Plus, MapPin, Menu, X, Cloud
} from 'lucide-react'
import { useApp, ActionTypes } from '../context/AppContext'
import { getEventConfig, daysUntil } from '../utils/helpers'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',  emoji: '🏠' },
  { to: '/budget',     icon: DollarSign,      label: 'Budget',     emoji: '💰' },
  { to: '/timeline',   icon: Calendar,        label: 'Timeline',   emoji: '📅' },
  { to: '/vendors',    icon: MapPin,          label: 'Vendors',    emoji: '🤝' },
  { to: '/guests',     icon: Users,           label: 'Guests',     emoji: '👥' },
  { to: '/checklist',  icon: CheckSquare,     label: 'Checklist',  emoji: '✅' },
  { to: '/ai-planner', icon: Sparkles,        label: 'AI Planner', emoji: '✨' },
]

export default function Sidebar() {
  const { state, dispatch, triggerCloudSync } = useApp()
  const navigate                              = useNavigate()
  const [collapsed, setCollapsed]             = useState(false)
  const [eventPickerOpen, setEventPickerOpen]   = useState(false)
  const [mobileOpen, setMobileOpen]             = useState(false)

  const activeEvent = state.events.find(e => e.id === state.activeEventId)
  const cfg         = activeEvent ? getEventConfig(activeEvent.type) : null
  const days        = activeEvent ? daysUntil(activeEvent.date) : null

  function selectEvent(id) {
    dispatch({ type: ActionTypes.SET_ACTIVE, payload: id })
    setEventPickerOpen(false)
    navigate('/dashboard')
  }

  function createEvent() {
    navigate('/new-event')
    setEventPickerOpen(false)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>🎉</div>
        {!collapsed && (
          <div>
            <div className={styles.logoText}>CelebrateAI</div>
            <div className={styles.logoSub}>Event Planner</div>
          </div>
        )}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Active Event Picker */}
      <div className={styles.eventPicker}>
        {activeEvent ? (
          <button
            className={styles.eventPickerBtn}
            onClick={() => setEventPickerOpen(o => !o)}
            aria-expanded={eventPickerOpen}
          >
            <span className={styles.eventPickerEmoji}>{cfg?.emoji}</span>
            {!collapsed && (
              <>
                <div className={styles.eventPickerInfo}>
                  <span className={styles.eventPickerName}>{activeEvent.name}</span>
                  {days !== null && (
                    <span className={styles.eventPickerDays}>
                      {days > 0 ? `${days}d away` : days === 0 ? 'Today! 🎉' : 'Past event'}
                    </span>
                  )}
                </div>
                <ChevronDown size={14} className={eventPickerOpen ? styles.chevronOpen : ''} />
              </>
            )}
          </button>
        ) : (
          <button className={styles.createFirstBtn} onClick={createEvent}>
            <Plus size={16} />
            {!collapsed && <span>Create Event</span>}
          </button>
        )}

        {/* Dropdown */}
        {eventPickerOpen && !collapsed && (
          <div className={styles.eventDropdown}>
            <div className={styles.eventDropdownHeader}>Your Events</div>
            {state.events.map(ev => {
              const evCfg = getEventConfig(ev.type)
              return (
                <button
                  key={ev.id}
                  className={`${styles.eventDropdownItem} ${ev.id === state.activeEventId ? styles.activeDropItem : ''}`}
                  onClick={() => selectEvent(ev.id)}
                >
                  <span>{evCfg.emoji}</span>
                  <span className={styles.eventDropdownName}>{ev.name}</span>
                </button>
              )
            })}
            <button className={styles.eventDropdownNew} onClick={createEvent}>
              <Plus size={14} />
              <span>New Event</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className={styles.nav} aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <span className={styles.navIcon}><Icon size={19} /></span>
            {!collapsed && <span className={styles.navLabel}>{label}</span>}
            {!collapsed && <span className={styles.navEmoji}>{emoji}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={styles.sidebarBottom}>
        {!collapsed && (
          <button
            className={styles.cloudSyncBtn}
            onClick={triggerCloudSync}
            title={state.lastCloudSync ? `Last synced at ${state.lastCloudSync}` : 'Click to sync with Firebase Cloud'}
          >
            <span style={{ fontSize: '1.05rem' }}>🔥</span>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Firebase Cloud
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: state.cloudSyncStatus === 'synced' ? '#10b981' : state.cloudSyncStatus === 'syncing' ? '#fbbf24' : '#94a3b8',
                  display: 'inline-block'
                }} />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {state.cloudSyncStatus === 'syncing' ? 'Syncing...' : state.lastCloudSync ? `Synced ${state.lastCloudSync}` : 'Click to sync'}
              </div>
            </div>
            <Cloud size={14} color="#fef08a" style={{ opacity: 0.8 }} />
          </button>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
          onClick={() => setMobileOpen(false)}
        >
          <span className={styles.navIcon}><Settings size={19} /></span>
          {!collapsed && <span className={styles.navLabel}>Settings</span>}
        </NavLink>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.mobileTrigger}
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className={styles.desktopSidebar}>{sidebarContent}</div>

      {/* Mobile drawer */}
      <div className={`${styles.mobileSidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {sidebarContent}
      </div>
    </>
  )
}

