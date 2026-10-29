/**
 * firebase.js
 * Firebase initialization, Cloud Firestore synchronization, Authentication,
 * and Analytics for CelebrateAI.
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyASs7eyEaKvYsRlqEoQ7BX7uwPTs3BoU9s",
  authDomain: "event-manage-app-147a1.firebaseapp.com",
  projectId: "event-manage-app-147a1",
  storageBucket: "event-manage-app-147a1.firebasestorage.app",
  messagingSenderId: "532566669814",
  appId: "1:532566669814:web:aff5a56ecf04eac9adafd7",
  measurementId: "G-QH2LNXX1WZ",
}

// Initialize Firebase safely (prevent multiple instances in HMR/re-renders)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Firestore & Auth instances
export const db = getFirestore(app)
export const auth = getAuth(app)

// Safe Analytics initialization (only in supported browser environments)
export let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  }).catch(() => {
    // Graceful fallback for non-browser or disabled environments
  })
}

/**
 * Log analytics event safely without throwing
 */
export function logCelebrationEvent(eventName, params = {}) {
  try {
    if (analytics && typeof window !== 'undefined') {
      import('firebase/analytics').then(({ logEvent }) => {
        logEvent(analytics, eventName, params)
      })
    }
  } catch (err) {
    // Non-blocking analytics logging
  }
}

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged }

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

/**
 * Sync entire events state to Firestore under user document
 * @param {string} userId - User UID
 * @param {Array} events - All celebration events
 */
export async function syncEventsToCloud(userId, events) {
  if (!userId) return false
  try {
    const userDocRef = doc(db, 'user_celebrations', userId)
    await setDoc(userDocRef, {
      events,
      updatedAt: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
    }, { merge: true })
    logCelebrationEvent('events_synced_cloud', { count: events.length })
    return true
  } catch (err) {
    console.error('Failed to sync events to Cloud Firestore:', err)
    throw err
  }
}

/**
 * Fetch events from Cloud Firestore
 * @param {string} userId - User UID
 */
export async function loadEventsFromCloud(userId) {
  if (!userId) return null
  try {
    const userDocRef = doc(db, 'user_celebrations', userId)
    const snap = await getDoc(userDocRef)
    if (snap.exists()) {
      return snap.data().events || []
    }
    return null
  } catch (err) {
    console.error('Failed to load events from Cloud Firestore:', err)
    throw err
  }
}

export async function deleteEventsFromCloud(userId) {
  if (!userId) throw new Error('You must be signed in to delete cloud data.')
  await deleteDoc(doc(db, 'user_celebrations', userId))
}

/**
 * Subscribe to real-time updates for a user's celebrations
 */
export function subscribeToCloudEvents(userId, onUpdate, onError) {
  if (!userId) return () => {}
  const userDocRef = doc(db, 'user_celebrations', userId)
  return onSnapshot(
    userDocRef,
    docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        onUpdate(data.events || [])
      }
    },
    err => {
      if (onError) onError(err)
      console.warn('Firestore real-time subscription error:', err)
    }
  )
}

