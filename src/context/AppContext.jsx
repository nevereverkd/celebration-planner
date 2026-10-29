/**
 * AppContext.jsx
 * Global application state management using React Context + useReducer.
 * Persists state to localStorage and synchronizes with Firebase Cloud Firestore.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import {
  auth,
  syncEventsToCloud,
  loadEventsFromCloud,
  onAuthStateChanged,
} from '../utils/firebase'

/* ── Sample Demo Event ──────────────────────────────────────── */
const DEMO_EVENT_ID = 'demo-event-wedding-2026'

const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 75)
const demoDateStr = futureDate.toISOString().split('T')[0]

const DEFAULT_DEMO_EVENT = {
  id: DEMO_EVENT_ID,
  createdAt: new Date().toISOString(),
  name: "Sophia & Liam's Vineyard Wedding",
  type: 'wedding',
  date: demoDateStr,
  venue: 'Napa Valley Vista Estate, California',
  description: 'An enchanting sunset celebration overlooking the vineyards with live acoustic music and farm-to-table dining.',
  theme: 'Bohemian Elegance & Warm Neutrals',
  budget: 38000,
  guestCount: 120,
  expenses: [
    { id: 'exp-1', name: 'Estate Venue Rental & Lawn', category: 'Venue', amount: 12500, paid: true, notes: 'Includes 12hr access, bridal suite & cleanup' },
    { id: 'exp-2', name: 'Artisan Farm-to-Table Catering', category: 'Catering', amount: 9800, paid: true, notes: 'Includes 3-course plated dinner and passed hors d’oeuvres' },
    { id: 'exp-3', name: 'Golden Hour Photography & Video', category: 'Photography', amount: 4200, paid: true, notes: 'Two shooters, 8 hours, aerial drone coverage' },
    { id: 'exp-4', name: 'Floral Arches & Table Centerpieces', category: 'Décor & Florals', amount: 2800, paid: false, notes: 'Pampas grass, ivory roses, and olive branches' },
    { id: 'exp-5', name: 'Live Acoustic Duo & Evening DJ', category: 'Music/DJ', amount: 2100, paid: false, notes: 'Ceremony acoustic + 5hr reception party mix' },
    { id: 'exp-6', name: 'Bespoke Tiered Lemon Berry Cake', category: 'Cake & Desserts', amount: 750, paid: false, notes: 'Vanilla sponge, raspberry compote & buttercream' },
  ],
  vendors: [
    { id: 'ven-1', name: 'Napa Vista Estate', category: 'venue', status: 'booked', contactName: 'Elena Rostova', phone: '+1 (707) 555-0142', email: 'events@napavista.com', website: 'https://napavista.com', quote: 12500, notes: 'Site manager on-site all day. Rehearsal Friday 4pm.' },
    { id: 'ven-2', name: 'Heirloom Table Catering', category: 'catering', status: 'booked', contactName: 'Chef Marcus Vance', phone: '+1 (415) 555-8831', email: 'marcus@heirloomtable.com', quote: 9800, notes: 'Menu locked. Vegetarian & GF alternatives confirmed.' },
    { id: 'ven-3', name: 'Lumière Photo Studios', category: 'photography', status: 'booked', contactName: 'Chloe Bennett', phone: '+1 (510) 555-3290', email: 'chloe@lumierephoto.com', quote: 4200, notes: 'Sunset timeline coordinated for 6:45 PM.' },
    { id: 'ven-4', name: 'Wildflower & Twig Florals', category: 'decor', status: 'quoted', contactName: 'Maya Lin', phone: '+1 (707) 555-7744', email: 'maya@wildflowertwig.com', quote: 2800, notes: 'Waiting for sample centerpiece mockups on Tuesday.' },
  ],
  milestones: [
    { id: 'ms-1', title: 'Lock Down Dream Venue', description: 'Tour finalists, review terms, and sign venue agreement.', daysBeforeEvent: 180, category: 'booking', priority: 'high', completed: true },
    { id: 'ms-2', title: 'Hire Primary Photographer & Videographer', description: 'Confirm portfolio alignment and reserve date.', daysBeforeEvent: 150, category: 'booking', priority: 'high', completed: true },
    { id: 'ms-3', title: 'Send Save-the-Date Announcements', description: 'Digital postcards and wedding website live.', daysBeforeEvent: 120, category: 'communication', priority: 'medium', completed: true },
    { id: 'ms-4', title: 'Tasting & Menu Finalization', description: 'Select wine pairings and entrée choices with caterer.', daysBeforeEvent: 60, category: 'design', priority: 'high', completed: false },
    { id: 'ms-5', title: 'Floral Arch & Centerpiece Mockup Review', description: 'Review sample tablescape with florist.', daysBeforeEvent: 45, category: 'design', priority: 'medium', completed: false },
    { id: 'ms-6', title: 'Final RSVP Deadline & Seating Chart', description: 'Confirm exact headcounts and print table assignments.', daysBeforeEvent: 21, category: 'communication', priority: 'high', completed: false },
    { id: 'ms-7', title: 'Rehearsal Walkthrough & Welcome Drinks', description: 'Walk through ceremony cues and logistics.', daysBeforeEvent: 1, category: 'final', priority: 'high', completed: false },
    { id: 'ms-8', title: 'The Big Celebration Day! 🎉', description: 'Vendor coordination, ceremony, reception & dancing.', daysBeforeEvent: 0, category: 'final', priority: 'high', completed: false },
  ],
  guests: [
    { id: 'gst-1', name: 'Charlotte Dubois', email: 'charlotte@example.com', phone: '+1 555 101', rsvp: 'confirmed', meal: 'Standard', table: '1', plusOne: true },
    { id: 'gst-2', name: 'Dr. Julian Thorne', email: 'j.thorne@example.org', phone: '+1 555 102', rsvp: 'confirmed', meal: 'Vegetarian', table: '1', plusOne: false },
    { id: 'gst-3', name: 'Amara Patel', email: 'amara.p@example.com', phone: '+1 555 103', rsvp: 'confirmed', meal: 'Vegan', table: '2', plusOne: true },
    { id: 'gst-4', name: 'Lucas & Mia Miller', email: 'lucas.m@example.com', phone: '+1 555 104', rsvp: 'confirmed', meal: 'Standard', table: '2', plusOne: true },
    { id: 'gst-5', name: 'Oliver Sterling', email: 'oliver.s@example.net', phone: '+1 555 105', rsvp: 'pending', meal: 'No Preference', table: '3', plusOne: false },
    { id: 'gst-6', name: 'Hannah Wright', email: 'hannah.w@example.com', phone: '+1 555 106', rsvp: 'declined', meal: 'Gluten-Free', table: '', plusOne: false },
  ],
  checklist: [
    { id: 'chk-1', text: 'Secure vineyard event permit', category: 'venue', priority: 'high', done: true },
    { id: 'chk-2', text: 'Approve custom calligraphy stationery draft', category: 'communication', priority: 'medium', done: true },
    { id: 'chk-3', text: 'Book acoustic ceremony guitarist', category: 'entertainment', priority: 'medium', done: true },
    { id: 'chk-4', text: 'Order personalized wooden guestbook & Polaroid film', category: 'personal', priority: 'medium', done: false },
    { id: 'chk-5', text: 'Confirm shuttle bus schedule between hotels and venue', category: 'logistics', priority: 'high', done: false },
    { id: 'chk-6', text: 'Finalize golden-hour timeline with Chloe (Photographer)', category: 'logistics', priority: 'high', done: false },
  ],
}

/* ── Initial State ──────────────────────────────────────────── */
const initialState = {
  events: [DEFAULT_DEMO_EVENT],
  activeEventId: DEMO_EVENT_ID,
  apiKey: '',
  theme: 'light',
  toasts: [],
  firebaseUser: null,
  authReady: false,
  cloudSyncStatus: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
  lastCloudSync: null,
  settings: {
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
  },
}

/* ── Action Types ───────────────────────────────────────────── */
export const ActionTypes = {
  // Events
  ADD_EVENT:      'ADD_EVENT',
  UPDATE_EVENT:   'UPDATE_EVENT',
  DELETE_EVENT:   'DELETE_EVENT',
  SET_ACTIVE:     'SET_ACTIVE',
  SET_EVENTS:     'SET_EVENTS',
  LOAD_DEMO_DATA: 'LOAD_DEMO_DATA',
  RESET_DATA:     'RESET_DATA',

  // Budget
  ADD_EXPENSE:    'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',

  // Vendors
  ADD_VENDOR:    'ADD_VENDOR',
  UPDATE_VENDOR: 'UPDATE_VENDOR',
  DELETE_VENDOR: 'DELETE_VENDOR',

  // Timeline
  ADD_MILESTONE:    'ADD_MILESTONE',
  UPDATE_MILESTONE: 'UPDATE_MILESTONE',
  DELETE_MILESTONE: 'DELETE_MILESTONE',
  TOGGLE_MILESTONE: 'TOGGLE_MILESTONE',

  // Guests
  ADD_GUEST:    'ADD_GUEST',
  UPDATE_GUEST: 'UPDATE_GUEST',
  DELETE_GUEST: 'DELETE_GUEST',

  // Checklist
  ADD_CHECKLIST_ITEM:    'ADD_CHECKLIST_ITEM',
  TOGGLE_CHECKLIST_ITEM: 'TOGGLE_CHECKLIST_ITEM',
  DELETE_CHECKLIST_ITEM: 'DELETE_CHECKLIST_ITEM',

  // Firebase & Settings
  SET_FIREBASE_USER: 'SET_FIREBASE_USER',
  SET_CLOUD_STATUS:  'SET_CLOUD_STATUS',
  SET_API_KEY:       'SET_API_KEY',
  ADD_TOAST:         'ADD_TOAST',
  REMOVE_TOAST:      'REMOVE_TOAST',
}

/* ── Reducer ────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {

    /* Events */
    case ActionTypes.ADD_EVENT: {
      const newEvent = {
        id: crypto.randomUUID ? crypto.randomUUID() : `event-${Date.now()}`,
        createdAt: new Date().toISOString(),
        expenses: [],
        vendors: [],
        milestones: [],
        guests: [],
        checklist: [],
        ideas: [],
        ...action.payload,
      }
      return {
        ...state,
        events: [...state.events, newEvent],
        activeEventId: newEvent.id,
      }
    }

    case ActionTypes.UPDATE_EVENT: {
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload } : e
        ),
      }
    }

    case ActionTypes.DELETE_EVENT: {
      const remaining = state.events.filter(e => e.id !== action.payload)
      return {
        ...state,
        events: remaining,
        activeEventId: remaining.length > 0 ? remaining[0].id : null,
      }
    }

    case ActionTypes.SET_ACTIVE:
      return { ...state, activeEventId: action.payload }

    case ActionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
        activeEventId: action.payload.length > 0 ? action.payload[0].id : null,
      }

    case ActionTypes.LOAD_DEMO_DATA:
      return {
        ...state,
        events: [DEFAULT_DEMO_EVENT],
        activeEventId: DEMO_EVENT_ID,
      }

    case ActionTypes.RESET_DATA:
      return {
        ...initialState,
        firebaseUser: state.firebaseUser,
        authReady: state.authReady,
        events: [],
        activeEventId: null,
      }

    /* Budget */
    case ActionTypes.ADD_EXPENSE:
    case ActionTypes.UPDATE_EXPENSE:
    case ActionTypes.DELETE_EXPENSE:
      return updateEventField(state, action.payload.eventId, 'expenses', action)

    /* Vendors */
    case ActionTypes.ADD_VENDOR:
    case ActionTypes.UPDATE_VENDOR:
    case ActionTypes.DELETE_VENDOR:
      return updateEventField(state, action.payload.eventId, 'vendors', action)

    /* Milestones */
    case ActionTypes.ADD_MILESTONE:
    case ActionTypes.UPDATE_MILESTONE:
    case ActionTypes.DELETE_MILESTONE:
      return updateEventField(state, action.payload.eventId, 'milestones', action)

    case ActionTypes.TOGGLE_MILESTONE: {
      const { eventId, id } = action.payload
      return updateEventArray(state, eventId, 'milestones', ms =>
        ms.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
      )
    }

    /* Guests */
    case ActionTypes.ADD_GUEST:
    case ActionTypes.UPDATE_GUEST:
    case ActionTypes.DELETE_GUEST:
      return updateEventField(state, action.payload.eventId, 'guests', action)

    /* Checklist */
    case ActionTypes.ADD_CHECKLIST_ITEM:
    case ActionTypes.DELETE_CHECKLIST_ITEM:
      return updateEventField(state, action.payload.eventId, 'checklist', action)

    case ActionTypes.TOGGLE_CHECKLIST_ITEM: {
      const { eventId, id } = action.payload
      return updateEventArray(state, eventId, 'checklist', items =>
        items.map(item => item.id === id ? { ...item, done: !item.done } : item)
      )
    }

    /* Firebase & Settings */
    case ActionTypes.SET_FIREBASE_USER:
      return { ...state, firebaseUser: action.payload, authReady: true }

    case ActionTypes.SET_CLOUD_STATUS:
      return {
        ...state,
        cloudSyncStatus: action.payload.status || state.cloudSyncStatus,
        lastCloudSync: action.payload.lastSynced || state.lastCloudSync,
      }

    case ActionTypes.SET_API_KEY:
      return { ...state, apiKey: action.payload }

    /* Toasts */
    case ActionTypes.ADD_TOAST:
      return { ...state, toasts: [...state.toasts, { id: crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}`, ...action.payload }] }

    case ActionTypes.REMOVE_TOAST:
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }

    default:
      return state
  }
}

/* ── Helper: Update nested event field ──────────────────────── */
function updateEventField(state, eventId, field, action) {
  return {
    ...state,
    events: state.events.map(event => {
      if (event.id !== eventId) return event

      const { type, payload } = action
      let updated = [...(event[field] || [])]

      if (type.startsWith('ADD_')) {
        const newItem = {
          id: crypto.randomUUID ? crypto.randomUUID() : `${field}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          createdAt: new Date().toISOString(),
          ...payload,
        }
        updated = [...updated, newItem]
      } else if (type.startsWith('UPDATE_')) {
        updated = updated.map(item => item.id === payload.id ? { ...item, ...payload } : item)
      } else if (type.startsWith('DELETE_')) {
        updated = updated.filter(item => item.id !== payload.id)
      }

      return { ...event, [field]: updated }
    }),
  }
}

function updateEventArray(state, eventId, field, updater) {
  return {
    ...state,
    events: state.events.map(event =>
      event.id === eventId
        ? { ...event, [field]: updater(event[field] || []) }
        : event
    ),
  }
}

/* ── Context ────────────────────────────────────────────────── */
const AppContext = createContext(null)

const STORAGE_KEY = uid => `celebrateai_state_v1_${uid}`

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const cloudLoadedForUid = useRef(null)

  // Persist to localStorage (excluding transient toasts & volatile states)
  useEffect(() => {
    const { toasts, firebaseUser, authReady, cloudSyncStatus, lastCloudSync, ...persistable } = state
    if (!firebaseUser?.uid) return
    try {
      localStorage.setItem(STORAGE_KEY(firebaseUser.uid), JSON.stringify(persistable))
    } catch (err) {
      console.warn('Could not persist state to localStorage:', err)
    }
  }, [state])

  // Monitor Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      dispatch({
        type: ActionTypes.SET_FIREBASE_USER,
        payload: user ? { uid: user.uid, isAnonymous: user.isAnonymous, email: user.email } : null,
      })
      if (user) {
        let accountEvents = [DEFAULT_DEMO_EVENT]
        try {
          const stored = localStorage.getItem(STORAGE_KEY(user.uid))
          const parsed = stored ? JSON.parse(stored) : null
          if (Array.isArray(parsed?.events)) accountEvents = parsed.events
        } catch {
          // Start with the sample planner if this account's local cache is unavailable.
        }
        dispatch({ type: ActionTypes.SET_EVENTS, payload: accountEvents })
      }
    })
    return () => unsubscribe()
  }, [])

  // Convenience: get active event
  const activeEvent = state.events.find(e => e.id === state.activeEventId) || state.events[0] || null

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `toast-${Date.now()}`
    dispatch({ type: ActionTypes.ADD_TOAST, payload: { message, toastType: type } })
    setTimeout(() => dispatch({ type: ActionTypes.REMOVE_TOAST, payload: id }), 4000)
  }, [])

  // Cloud Sync to Firebase Firestore
  const triggerCloudSync = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'syncing' } })
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Could not authenticate with Firebase')
      await syncEventsToCloud(user.uid, state.events)
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'synced', lastSynced: now } })
      showToast('☁️ Synced celebrations to Firebase Firestore!', 'success')
      return true
    } catch (err) {
      dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'error' } })
      showToast(`Cloud Sync: ${err.message || 'Offline'}`, 'warning')
      return false
    }
  }, [state.events, showToast])

  // Cloud Restore from Firebase Firestore
  const triggerCloudLoad = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'syncing' } })
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Could not connect to Firebase')
      const cloudEvents = await loadEventsFromCloud(user.uid)
      if (cloudEvents && cloudEvents.length > 0) {
        dispatch({ type: ActionTypes.SET_EVENTS, payload: cloudEvents })
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'synced', lastSynced: now } })
        showToast(`☁️ Loaded ${cloudEvents.length} celebration(s) from Firebase!`, 'success')
      } else {
        // First time: sync current local data to Firestore
        await syncEventsToCloud(user.uid, state.events)
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'synced', lastSynced: now } })
        showToast('First-time sync complete in Firebase!', 'success')
      }
    } catch (err) {
      dispatch({ type: ActionTypes.SET_CLOUD_STATUS, payload: { status: 'error' } })
      showToast(`Cloud load failed: ${err.message || 'Error'}`, 'error')
    }
  }, [state.events, showToast])

  useEffect(() => {
    const uid = state.firebaseUser?.uid
    if (!uid) {
      cloudLoadedForUid.current = null
      return
    }
    if (cloudLoadedForUid.current === uid) return
    cloudLoadedForUid.current = uid
    triggerCloudLoad()
  }, [state.firebaseUser?.uid, triggerCloudLoad])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        activeEvent,
        showToast,
        triggerCloudSync,
        triggerCloudLoad,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/* ── Custom Hook ────────────────────────────────────────────── */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
