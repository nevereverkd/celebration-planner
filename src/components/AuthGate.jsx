import React, { useState } from 'react'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithGoogle } from '../utils/firebase'

function readableError(error) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'That email and password combination was not recognized.',
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'auth/network-request-failed': 'Check your internet connection and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
    'auth/unauthorized-domain': 'This site is not enabled for Firebase sign-in yet. Add its domain in Firebase Authentication settings.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled for this Firebase project yet.',
    'auth/account-exists-with-different-credential': 'An account already uses this email. Sign in with your existing method first.',
  }
  return messages[error.code] || 'We could not complete that request. Please try again.'
}

export default function AuthGate() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(email.trim())
        setMessage('Password reset link sent. Check your inbox.')
      } else if (mode === 'signup') {
        await createUserWithEmailAndPassword(email.trim(), password)
      } else {
        await signInWithEmailAndPassword(email.trim(), password)
      }
    } catch (error) {
      setMessage(readableError(error))
    } finally {
      setBusy(false)
    }
  }

  async function continueWithGoogle() {
    setMessage('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      setMessage(readableError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, .9fr)', background: '#fbf8ff' }}>
      <section style={{ padding: 'clamp(2rem, 7vw, 7rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(145deg, #5b21b6, #9333ea 55%, #ec4899)', color: 'white' }}>
        <div style={{ fontSize: '2rem' }} aria-hidden="true">🎉</div>
        <p style={{ letterSpacing: '.14em', textTransform: 'uppercase', fontSize: '.75rem', fontWeight: 700, opacity: .8 }}>CelebrateAI</p>
        <h1 style={{ color: 'white', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05, margin: '1rem 0' }}>Make room for the moments that matter.</h1>
        <p style={{ maxWidth: 460, lineHeight: 1.7, opacity: .88 }}>Plan your celebration with one calm, beautiful place for guests, budgets, vendors, and every little detail.</p>
      </section>
      <section style={{ display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <form onSubmit={submit} style={{ width: 'min(100%, 420px)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', background: 'white', borderRadius: 24, boxShadow: '0 24px 80px #4c1d9518', border: '1px solid #eee8f5' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}</h2>
          <p style={{ color: '#64748b', lineHeight: 1.6, margin: '.65rem 0 1.75rem' }}>{mode === 'signup' ? 'Your plans stay private to your account and sync across devices.' : mode === 'reset' ? 'We’ll email you a secure password reset link.' : 'Sign in to pick up where your plans left off.'}</p>
          {mode !== 'reset' && <>
            <button type="button" className="btn" onClick={continueWithGoogle} disabled={busy} style={{ width: '100%', border: '1px solid #d8dce3', borderRadius: 12, padding: '.85rem', background: '#fff', color: '#1f2937' }}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.85 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: '#94a3b8', fontSize: '.75rem', margin: '1.25rem 0' }}><span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />OR CONTINUE WITH EMAIL<span style={{ flex: 1, height: 1, background: '#e2e8f0' }} /></div>
          </>}
          <label className="label" htmlFor="auth-email">Email address</label>
          <input id="auth-email" className="input" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ marginBottom: '1rem' }} />
          {mode !== 'reset' && <>
            <label className="label" htmlFor="auth-password">Password</label>
            <input id="auth-password" className="input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={{ marginBottom: '1rem' }} />
          </>}
          {message && <p role="status" style={{ color: message.startsWith('Password reset') ? '#047857' : '#b91c1c', fontSize: '.875rem' }}>{message}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', borderRadius: 12, padding: '.9rem' }}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.25rem', fontSize: '.875rem' }}>
            {mode === 'signin' ? <><button type="button" className="btn btn-ghost" onClick={() => { setMode('signup'); setMessage('') }}>Create account</button><button type="button" className="btn btn-ghost" onClick={() => { setMode('reset'); setMessage('') }}>Forgot password?</button></> : <button type="button" className="btn btn-ghost" onClick={() => { setMode('signin'); setMessage('') }}>Back to sign in</button>}
          </div>
        </form>
      </section>
      <style>{`@media(max-width:760px){main{grid-template-columns:1fr!important}main>section:first-child{padding:2rem;min-height:260px}main>section:first-child h1{font-size:2.5rem!important}}`}</style>
    </main>
  )
}
