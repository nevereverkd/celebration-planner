/**
 * AiPlanner.jsx
 * Gemini-powered AI planning assistant with chat interface and idea generation.
 */

import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, RefreshCw, Copy, MessageSquare, Lightbulb, Calendar, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { generateEventIdeas, EventPlanningAssistant } from '../utils/gemini'
import EmptyState from '../components/EmptyState'
import styles from './AiPlanner.module.css'

const QUICK_PROMPTS = [
  { emoji: '🎨', label: 'Theme Ideas',       prompt: 'Suggest 5 unique and creative themes for my event with detailed descriptions.' },
  { emoji: '🍽️', label: 'Menu Ideas',        prompt: 'Create a complete menu plan including appetizers, mains, desserts, and drinks.' },
  { emoji: '📸', label: 'Photo Moments',     prompt: 'What are the must-have photo moments and creative shot ideas for my event?' },
  { emoji: '🎮', label: 'Activities',         prompt: 'Suggest fun activities and entertainment ideas to keep guests engaged.' },
  { emoji: '💡', label: 'Budget Tips',        prompt: 'Give me specific money-saving tips and creative alternatives to reduce costs without sacrificing quality.' },
  { emoji: '📋', label: 'Day-of Timeline',   prompt: 'Create a detailed hour-by-hour timeline for the day of the event.' },
  { emoji: '🎁', label: 'Guest Favors',      prompt: 'Suggest 8 unique and memorable guest favor ideas with estimated costs.' },
  { emoji: '🌸', label: 'Décor Ideas',        prompt: 'Describe a complete décor vision including centerpieces, lighting, and ambiance.' },
]

export default function AiPlanner() {
  const { state }                 = useApp()
  const { toast }                 = useToast()
  const event                     = state.events.find(e => e.id === state.activeEventId)
  const [tab, setTab]             = useState('chat')
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [ideas, setIdeas]         = useState('')
  const [ideasLoading, setIdeasLoading] = useState(false)
  const assistantRef              = useRef(null)
  const chatEndRef                = useRef(null)
  const inputRef                  = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize assistant when event changes
  useEffect(() => {
    assistantRef.current = null
    setMessages([])
  }, [state.activeEventId])

  if (!event) {
    return <EmptyState emoji="✨" title="No event selected" description="Create or select an event to use the AI Planner." />
  }

  async function getOrCreateAssistant() {
    if (!assistantRef.current) {
      assistantRef.current = new EventPlanningAssistant(state.apiKey, event)
      setMessages([{
        role: 'assistant',
        content: `✨ Hi! I'm your AI event planner for **${event.name}**! I'm here to help make your celebration unforgettable. Ask me anything about themes, vendors, timelines, budget tips, or any other aspect of your event!`,
        timestamp: new Date(),
      }])
    }
    return assistantRef.current
  }

  async function handleSend(messageText) {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    setInput('')
    const userMsg = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const assistant = await getOrCreateAssistant()
      const response  = await assistant.sendMessage(text)
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }])
    } catch (err) {
      toast(err.message || 'AI response failed.', 'error')
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an issue. Please verify your Gemini API key in Settings.', timestamp: new Date(), isError: true }])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateIdeas() {
    setIdeasLoading(true)
    setIdeas('')
    try {
      const result = await generateEventIdeas(state.apiKey, event)
      setIdeas(result)
      toast('🎉 Ideas generated! Check them out!', 'success')
    } catch (err) {
      toast(err.message || 'Failed to generate ideas.', 'error')
    } finally {
      setIdeasLoading(false)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard! 📋', 'success'))
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.75rem' }}>✨ AI Event Planner</h1>
          <p className="section-subtitle">Powered by Gemini AI — planning made magical for <strong>{event.name}</strong></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {state.apiKey ? (
            <span className="badge badge-green" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>
              🟢 Live Gemini 2.0 Connected
            </span>
          ) : (
            <span className="badge badge-purple" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }} title="Add your Gemini API Key in Settings to connect live cloud AI">
              ✨ Smart AI Demo Active
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'chat' ? styles.tabActive : ''}`} onClick={() => setTab('chat')}>
          <MessageSquare size={16} /> Chat Planner
        </button>
        <button className={`${styles.tab} ${tab === 'ideas' ? styles.tabActive : ''}`} onClick={() => setTab('ideas')}>
          <Lightbulb size={16} /> Generate Ideas
        </button>
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className={styles.chatLayout}>
          {/* Chat Window */}
          <div className={styles.chatWindow}>
            <div className={styles.chatMessages}>
              {messages.length === 0 ? (
                <div className={styles.chatEmpty}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    Your AI Event Planner
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '280px', textAlign: 'center', lineHeight: 1.6 }}>
                    Click a quick prompt or type your own question to get personalized advice!
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                    {msg.role === 'assistant' && (
                      <div className={styles.aiAvatar}>✨</div>
                    )}
                    <div className={msg.role === 'user' ? 'user-bubble' : `ai-bubble ${msg.isError ? styles.errorBubble : ''}`}>
                      <FormattedText text={msg.content} />
                    </div>
                    {msg.role === 'assistant' && !msg.isError && (
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(msg.content)}
                        title="Copy response"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className={styles.message}>
                  <div className={styles.aiAvatar}>✨</div>
                  <div className="ai-bubble">
                    <div className={styles.typingIndicator}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className={styles.chatInput}>
              <input
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything about your event..."
                disabled={isLoading}
                maxLength={1000}
              />
              <button
                className={`btn btn-primary ${styles.sendBtn}`}
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Sidebar */}
          <div className={styles.promptsSidebar}>
            <div className={styles.promptsHeader}>
              <Sparkles size={16} color="#8b5cf6" />
              <span>Quick Prompts</span>
            </div>
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                className={styles.promptBtn}
                onClick={() => handleSend(p.prompt)}
                disabled={isLoading}
              >
                <span style={{ fontSize: '1.25rem' }}>{p.emoji}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ideas Tab */}
      {tab === 'ideas' && (
        <div className={styles.ideasLayout}>
          <div className={styles.ideasHero}>
            <div className={styles.ideasHeroIcon}>🎯</div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4c1d95', marginBottom: '0.375rem' }}>
                Personalized Event Ideas
              </h2>
              <p style={{ color: '#7e22ce', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Get 8 creative, AI-generated ideas tailored specifically to your {event.type} event, budget, and style.
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerateIdeas}
            disabled={ideasLoading}
            style={{ marginBottom: '1.5rem' }}
          >
            {ideasLoading
              ? <><div className={styles.spinner} /> Generating ideas…</>
              : <><Sparkles size={18} /> Generate My Personalized Ideas</>
            }
          </button>

          {ideas && (
            <div className={styles.ideasCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} /> AI-Generated Ideas for {event.name}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(ideas)} title="Copy all ideas">
                    <Copy size={14} /> Copy
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleGenerateIdeas} disabled={ideasLoading} title="Regenerate">
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </div>
              <div className={styles.ideasContent}>
                <FormattedText text={ideas} />
              </div>
            </div>
          )}

          {!ideas && !ideasLoading && (
            <div style={{ opacity: 0.5, textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
              <div>Click the button above to generate personalized ideas!</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Render AI response with basic markdown formatting */
function FormattedText({ text }) {
  const lines = (text || '').split('\n')
  const inline = value => value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return part
  })
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />
        const heading = line.replace(/^#+\s*/, '')
        if (line.match(/^\d+\./)) {
          return <div key={i} style={{ marginBottom: '0.5rem' }}>{inline(line)}</div>
        }
        if (line.startsWith('##')) {
          return <div key={i} style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>{inline(heading)}</div>
        }
        if (line.startsWith('#')) {
          return <div key={i} style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.375rem' }}>{inline(heading)}</div>
        }
        return <div key={i}>{inline(line)}</div>
      })}
    </div>
  )
}

