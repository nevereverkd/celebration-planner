/**
 * App.jsx
 * Root application component with routing and layout.
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Dashboard  from './pages/Dashboard'
import NewEvent   from './pages/NewEvent'
import Budget     from './pages/Budget'
import Timeline   from './pages/Timeline'
import Vendors    from './pages/Vendors'
import Guests     from './pages/Guests'
import Checklist  from './pages/Checklist'
import AiPlanner  from './pages/AiPlanner'
import Settings   from './pages/Settings'
import AuthGate from './components/AuthGate'
import { useApp } from './context/AppContext'

export default function App() {
  const { state } = useApp()
  if (!state.authReady) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#7c3aed' }}>Loading your celebration space…</div>
  if (!state.firebaseUser) return <AuthGate />
  return (
    <div className="page-wrapper">
      {/* New Event is full-page (no sidebar) */}
      <Routes>
        <Route path="/new-event" element={<NewEvent />} />
        <Route
          path="/*"
          element={
            <div className="sidebar-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/"           element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard"  element={<Dashboard />} />
                  <Route path="/budget"     element={<Budget />} />
                  <Route path="/timeline"   element={<Timeline />} />
                  <Route path="/vendors"    element={<Vendors />} />
                  <Route path="/guests"     element={<Guests />} />
                  <Route path="/checklist"  element={<Checklist />} />
                  <Route path="/ai-planner" element={<AiPlanner />} />
                  <Route path="/settings"   element={<Settings />} />
                  <Route path="*"           element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
      <Toast />
    </div>
  )
}

