/**
 * gemini.js
 * Gemini API integration for AI-powered celebration & event planning.
 * Supports official @google/generative-ai SDK with automatic fallbacks,
 * robust JSON sanitization, and intelligent offline simulation when no key is provided.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const PRIMARY_MODEL = 'gemini-2.0-flash-exp'
const FALLBACK_MODEL = 'gemini-1.5-flash'

/* ── Safety Settings ────────────────────────────────────────── */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

/* ── Generation Config ──────────────────────────────────────── */
const GENERATION_CONFIG = {
  temperature:     0.7,
  topK:            40,
  topP:            0.95,
  maxOutputTokens: 2048,
}

/**
 * Resolves only an explicitly supplied Gemini key or a build-time Gemini key.
 */
export function getEffectiveApiKey(apiKey) {
  if (apiKey?.trim()) return apiKey.trim()
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY.trim()
  }
  return null
}

/**
 * Create a Gemini client instance.
 */
function createClient(apiKey) {
  const effectiveKey = getEffectiveApiKey(apiKey)
  if (!effectiveKey) return null
  return new GoogleGenerativeAI(effectiveKey)
}

/**
 * Helper to call Gemini model with fallback.
 */
async function callGemini(client, prompt, config = GENERATION_CONFIG) {
  try {
    const model = client.getGenerativeModel({ model: PRIMARY_MODEL, safetySettings: SAFETY_SETTINGS, generationConfig: config })
    const res = await model.generateContent(prompt)
    return res.response.text()
  } catch (err) {
    console.warn(`Primary model ${PRIMARY_MODEL} failed, attempting ${FALLBACK_MODEL}:`, err)
    const fallback = client.getGenerativeModel({ model: FALLBACK_MODEL, safetySettings: SAFETY_SETTINGS, generationConfig: config })
    const res = await fallback.generateContent(prompt)
    return res.response.text()
  }
}

/**
 * Safely parse JSON from LLM output, extracting from ```json ... ``` blocks or raw text.
 */
function parseJsonArray(text) {
  if (!text) return []
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const arrayMatch = clean.match(/\[[\s\S]*\]/)
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0])
  }
  return JSON.parse(clean)
}

/* ── AI Event Ideas Generator ────────────────────────────────── */
export async function generateEventIdeas(apiKey, event) {
  const client = createClient(apiKey)

  if (!client) {
    // Return rich simulated ideas based on event type
    await new Promise(r => setTimeout(r, 800))
    return getSimulatedIdeas(event)
  }

  const prompt = `You are a world-class luxury celebration and event designer.
Generate 8 creative, memorable, and personalized event concepts for this celebration:

Event Details:
- Name: "${event.name}"
- Type: ${event.type}
- Date: ${event.date || 'Upcoming'}
- Guest Count: ${event.guestCount || 'approx 50-100'}
- Budget: $${event.budget?.toLocaleString() || 'Flexible'}
- Theme/Style: ${event.theme || 'Custom / Elegant'}
- Notes: ${event.description || 'None'}

Provide:
1. 🎯 Catchy Concept Name
2. Vivid 2-sentence description of the guest experience
3. Why this fits their event type and budget
4. Estimated cost allocation range

Return clean, nicely structured markdown text with emojis and clear sections.`

  return await callGemini(client, prompt)
}

/* ── AI Vendor Checklist Generator ───────────────────────────── */
export async function generateVendorChecklist(apiKey, event) {
  const client = createClient(apiKey)

  if (!client) {
    await new Promise(r => setTimeout(r, 600))
    return getSimulatedVendorChecklist(event)
  }

  const prompt = `You are an expert event planner. Return a JSON array of vendor categories for:
Event: ${event.name} (${event.type})
Guest Count: ${event.guestCount || 50}
Budget: $${event.budget?.toLocaleString() || 'Flexible'}

Format:
[
  {
    "category": "Category Name",
    "emoji": "emoji",
    "items": ["Item 1", "Item 2", "Item 3"]
  }
]
Return ONLY a valid JSON array. No markdown code blocks, no preamble.`

  const rawText = await callGemini(client, prompt, { ...GENERATION_CONFIG, temperature: 0.3 })
  return parseJsonArray(rawText)
}

/* ── AI Timeline Generator ───────────────────────────────────── */
export async function generateTimeline(apiKey, event) {
  const client = createClient(apiKey)

  if (!client) {
    await new Promise(r => setTimeout(r, 600))
    return getSimulatedTimeline(event)
  }

  const prompt = `Create a detailed planning milestone timeline for:
Event: ${event.name} (${event.type})
Date: ${event.date || 'TBD'}
Guests: ${event.guestCount || 50}

Return a JSON array of 10-12 chronologically ordered milestones (from earliest daysBeforeEvent down to 0 for event day):
[
  {
    "title": "Short title",
    "description": "Actionable task guidance",
    "daysBeforeEvent": 120,
    "category": "booking" | "design" | "logistics" | "communication" | "final",
    "priority": "high" | "medium" | "low"
  }
]
Return ONLY a valid JSON array.`

  const rawText = await callGemini(client, prompt, { ...GENERATION_CONFIG, temperature: 0.2 })
  return parseJsonArray(rawText)
}

/* ── AI Budget Breakdown ─────────────────────────────────────── */
export async function generateBudgetBreakdown(apiKey, event) {
  const client = createClient(apiKey)

  if (!client) {
    await new Promise(r => setTimeout(r, 500))
    return getSimulatedBudgetBreakdown(event)
  }

  const total = Number(event.budget) || 10000
  const prompt = `As an event budget planner, recommend a 100% budget allocation for:
Event Type: ${event.type}
Total Budget: $${total}
Guests: ${event.guestCount || 50}

Return a JSON array of 6-8 categories summing to 100%:
[
  {
    "category": "Category name",
    "emoji": "emoji",
    "percentage": 30,
    "amount": ${Math.round(total * 0.3)},
    "notes": "Actionable tip on spending in this category"
  }
]
Return ONLY a valid JSON array.`

  const rawText = await callGemini(client, prompt, { ...GENERATION_CONFIG, temperature: 0.2 })
  return parseJsonArray(rawText)
}

/* ── Conversational Event Planning Assistant ─────────────────── */
export class EventPlanningAssistant {
  constructor(apiKey, event) {
    this.apiKey = getEffectiveApiKey(apiKey)
    this.event  = event
    this.history = []

    if (this.apiKey) {
      const client = new GoogleGenerativeAI(this.apiKey)
      const model  = client.getGenerativeModel({ model: PRIMARY_MODEL, safetySettings: SAFETY_SETTINGS, generationConfig: GENERATION_CONFIG })
      this.chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: `I am planning a ${event.type} named "${event.name}". Budget: $${event.budget?.toLocaleString() || 'Flexible'}, Guests: ${event.guestCount || 'Flexible'}, Date: ${event.date || 'TBD'}. You are my luxury celebration planner.` }],
          },
          {
            role: 'model',
            parts: [{ text: `🎉 Welcome! I'm thrilled to be your personal AI planner for **${event.name}**! Whether you need theme inspirations, catering ideas, budget-saving tricks, or hour-by-hour schedules, I'm here to make planning seamless and magical. What shall we tackle first?` }],
          },
        ],
      })
    }
  }

  async sendMessage(userMessage) {
    if (!this.apiKey) {
      await new Promise(r => setTimeout(r, 600))
      return getSimulatedChatResponse(userMessage, this.event)
    }
    const result = await this.chat.sendMessage(userMessage)
    return result.response.text()
  }
}

/* ── Fallback Simulations (High-fidelity offline mode) ───────── */

function getSimulatedIdeas(event) {
  const isWedding = event.type === 'wedding'
  const isBday    = event.type === 'birthday'

  return `✨ **Personalized Concepts for ${event.name}** *(Simulated AI Mode)*

### 1. 🕯️ Candlelit Twilight Garden & Acoustic Lounge
- **The Experience:** Guests arrive to fairy-light canopies, signature infused botanical mocktails/cocktails, and intimate acoustic melodies.
- **Why it fits:** Perfect for a ${event.type} with ${event.guestCount || 50} guests seeking an enchanting, warm atmosphere that feels both high-end and deeply personal.
- **Estimated Cost:** 18% - 25% of overall budget.

### 2. 📸 Retro Vinyl & Polaroid Memory Station
- **The Experience:** An interactive retro record listening nook with a customized guestbook where attendees snap instant photos and write favorite song lyrics or blessings.
- **Why it fits:** High sentimental value with very modest cost, maximizing guest engagement.
- **Estimated Cost:** $400 - $900.

### 3. 🍾 Artisanal Tasting & Gourmet Grazing Tables
- **The Experience:** Cascading boards of regional cheeses, artisan flatbreads, edible florals, and craft beverage pairings curated for interactive socializing.
- **Why it fits:** Eliminates formal seating stiffness and fosters lively mingling for ${event.guestCount || 50} guests.
- **Estimated Cost:** 30% - 35% of total food & beverage.

### 4. 🌟 Golden Hour Drone Silhouette & Sparkler Send-off
- **The Experience:** Synchronized cold-spark fountains or LED glow wands with a drone aerial group capture at twilight.
- **Why it fits:** Creates a breathtaking cinematic finale that leaves every guest raving.
- **Estimated Cost:** $600 - $1,500.

### 5. 🎨 Personalized Custom Scent or Favor Bar
- **The Experience:** Guests blend their own miniature celebration perfume/cologne or pick bespoke artisan coffee/tea blends in branded keepsake tins.
- **Why it fits:** Far superior to throwaway favors; guests treasure this for months.
- **Estimated Cost:** $8 - $14 per guest.

*(Tip: Add your Gemini API key in Settings to generate unlimited dynamic AI prompts!)*`
}

function getSimulatedVendorChecklist(event) {
  return [
    {
      category: 'Venue & Staging',
      emoji: '🏛️',
      items: ['Primary Ceremony/Party Venue', 'Weather Contingency Tenting', 'Sound & Audio Visual Setup'],
    },
    {
      category: 'Catering & Beverages',
      emoji: '🍽️',
      items: ['Main Course Caterer', 'Craft Bartender / Beverage Service', 'Custom Baker / Cake Designer'],
    },
    {
      category: 'Photo & Cinema',
      emoji: '📸',
      items: ['Lead Photographer', 'Cinematic Videographer', 'Interactive Photo Booth'],
    },
    {
      category: 'Music & Vibes',
      emoji: '🎵',
      items: ['Live Band or Professional DJ', 'Acoustic Cocktail Musician', 'Master of Ceremonies (MC)'],
    },
    {
      category: 'Floral & Styling',
      emoji: '💐',
      items: ['Floral Designer', 'Tableware & Linen Rental', 'Atmospheric Lighting Specialist'],
    },
  ]
}

function getSimulatedTimeline(event) {
  return [
    { title: 'Lock Down Dream Venue', description: 'Tour finalists, review contracts, and place initial deposit.', daysBeforeEvent: 180, category: 'booking', priority: 'high' },
    { title: 'Select Food & Beverage Partner', description: 'Schedule menu tastings and finalize dietary options.', daysBeforeEvent: 150, category: 'booking', priority: 'high' },
    { title: 'Secure Photo & Video Specialists', description: 'Review portfolios and sign engagement agreement.', daysBeforeEvent: 120, category: 'booking', priority: 'medium' },
    { title: 'Design & Send Save-the-Dates', description: 'Collect mailing addresses and publish digital RSVP link.', daysBeforeEvent: 90, category: 'communication', priority: 'medium' },
    { title: 'Curate Music & Entertainment Playlists', description: 'List must-play and do-not-play tracks with your DJ/band.', daysBeforeEvent: 60, category: 'design', priority: 'medium' },
    { title: 'Finalize Floor Plan & Seating Chart', description: 'Assign tables and accommodate special accessibility needs.', daysBeforeEvent: 30, category: 'logistics', priority: 'high' },
    { title: 'Confirm RSVP Headcount with Caterer', description: 'Lock in final plate counts and vendor meals.', daysBeforeEvent: 14, category: 'communication', priority: 'high' },
    { title: 'Rehearsal & Day-of Schedule Briefing', description: 'Walk through key cues with family and bridal/party party.', daysBeforeEvent: 2, category: 'final', priority: 'high' },
    { title: 'Celebration Day Logistics', description: 'Vendor load-in, personal styling, and showtime!', daysBeforeEvent: 0, category: 'final', priority: 'high' },
  ]
}

function getSimulatedBudgetBreakdown(event) {
  const budget = Number(event.budget) || 20000
  return [
    { category: 'Venue & Rentals', emoji: '🏛️', percentage: 35, amount: Math.round(budget * 0.35), notes: 'Secures the space, tables, chairs, and foundational layout.' },
    { category: 'Catering & Bar', emoji: '🍽️', percentage: 28, amount: Math.round(budget * 0.28), notes: 'Hors d’oeuvres, multi-course meal, drinks, and service staff.' },
    { category: 'Photography & Film', emoji: '📸', percentage: 12, amount: Math.round(budget * 0.12), notes: 'Full day coverage and edited high-resolution gallery.' },
    { category: 'Music & Entertainment', emoji: '🎵', percentage: 9, amount: Math.round(budget * 0.09), notes: 'DJ/MC and sound engineering for ceremony & reception.' },
    { category: 'Décor & Florals', emoji: '💐', percentage: 8, amount: Math.round(budget * 0.08), notes: 'Centerpieces, ceremony arch, lighting accents, and stationery.' },
    { category: 'Contingency Buffer', emoji: '🛡️', percentage: 8, amount: Math.round(budget * 0.08), notes: 'Reserved for last-minute tips, overtime, or weather adjustments.' },
  ]
}

function getSimulatedChatResponse(message, event) {
  const lower = message.toLowerCase()
  if (lower.includes('theme') || lower.includes('style')) {
    return `🎨 **Theme Recommendations for ${event.name}:**\n\n1. **Modern Minimalist & Warm Neutrals:** Champagne tones, organic linen, sculptural flora, and warm amber lighting.\n2. **Enchanted Botanical Greenhouse:** Cascading greenery, glass terrariums, fairy lights, and live acoustic music.\n3. **Celestial Twilight Gala:** Deep midnight blues, constellations, metallic star accents, and dry-ice dancefloor moments.\n\nWhich direction feels closest to your aesthetic vision?`
  }
  if (lower.includes('budget') || lower.includes('save') || lower.includes('money')) {
    return `💰 **Smart Cost-Optimization Strategies:**\n\n- **In-Season Blooms:** Work with your florist to use seasonal flowers; this can cut floral invoices by 30-40%.\n- **Signature Cocktails vs Full Open Bar:** Offer 2 bespoke craft drinks + beer & wine rather than 20 liquors. It's chic and significantly cheaper.\n- **Digital + Keepsake hybrid invites:** Send gorgeous interactive online invitations with printed keepsake cards for close family only.\n\nYour current budget of $${event.budget?.toLocaleString() || 'N/A'} is in great shape if we allocate intentionally!`
  }
  if (lower.includes('food') || lower.includes('menu') || lower.includes('cater')) {
    return `🍽️ **Curated Menu Concept for ${event.guestCount || 50} Guests:**\n\n- **Cocktail Hour:** Truffle arancini, smoked salmon crostini, watermelon-feta skewers.\n- **Plated Entrée:** Herb-crusted tenderloin or pan-seared sea bass with saffron risotto, plus wild mushroom polenta for plant-based guests.\n- **Sweet Finish:** Miniature dessert trio + late-night gourmet street tacos or churro station.`
  }
  return `✨ I love that question for **${event.name}**! For a ${event.type} of this scale, focusing on guest experience flow makes all the difference. When planning this, consider timing it right after the golden hour so you get the best natural photos and maximum party energy. Would you like me to map out a sample schedule or vendor quote checklist for this?`
}
