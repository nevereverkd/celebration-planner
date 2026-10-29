# CelebrateAI ✨ — GenAI-Powered Celebration & Event Planner

A premium, user-friendly, and intelligent celebration planning assistant engineered to organize **weddings, birthdays, corporate gatherings, and community events** with real-time budgets, interactive timelines, vendor management, guest lists, and AI-powered ideas.

Powered by **Google Gemini AI** and integrated with **Firebase Cloud Firestore, Authentication & Analytics**.

---

## 🔥 Firebase Cloud Integration

CelebrateAI connects directly to Firebase project **`event-manage-app-147a1`**:

- **🔥 Cloud Firestore Sync:** Account-owned planner data is restored after sign-in and can be synced from Settings.
- **🔐 Authentication:** Google and email/password sign-in, account creation, password reset, and sign-out through Firebase Authentication.
- **📈 Firebase Analytics:** Privacy-compliant, non-blocking telemetry (`G-QH2LNXX1WZ`) for celebration milestones.
- **⚡ Gemini AI:** Add a Gemini API key in Settings or provide `VITE_GEMINI_API_KEY` at build time. Firebase's web API key is not used for Gemini.
- **🛡️ Local & Cloud Data:** Planner data is cached separately per signed-in account and can be restored or synced from Settings.

Email/Password sign-in must be enabled in Firebase Authentication, and the prototype rules in `firestore.rules` must be reviewed and deployed before sharing the app. See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for findings and deployment notes.

---

## 🌟 Key Features

### 1. 🤖 GenAI Planning Assistant
- **Bespoke Event Concepts:** Generate 8 creative, personalized celebration concepts tailored to your event type, guest count, and style.
- **Smart Timeline Generation:** AI automatically generates chronological planning milestones from venue booking to day-of logistics.
- **Vendor Checklist Engine:** Tailors required vendor categories and deliverables according to event scale.
- **AI Budget Recommendation:** Recommends optimal percentage allocations across 6–8 categories based on event priorities.
- **Interactive Event Chat:** Dedicated conversational planner that maintains event context and answers theme, decor, catering, and logistical questions.
- **Smart Dual-Engine AI:** Powered by the configured Google Cloud key with an intelligent simulation fallback.

### 2. 📊 Budget & Expense Tracker
- Real-time expense breakdown with interactive **Recharts** donut/pie visualization.
- Categorized expense tracking (Venue, Catering, Photography, Décor, Music, Attire, etc.).
- Paid vs. Pending expense statuses.
- Real-time budget progress rings and over-budget alerts.

### 3. 📅 Milestone Timeline
- Chronological timeline tracking days remaining until the celebration.
- Categorized by Booking, Design, Logistics, Communication, and Final Prep.
- Priority tagging (High, Medium, Low) with interactive milestone completion.

### 4. 🤝 Vendor Relationship Manager
- Track vendors by pipeline stage: *Researching*, *Contacted*, *Quoted*, *Booked*, and *Cancelled*.
- Centralized contact details (phone, email, website links, quoted amounts, and notes).
- AI vendor checklist generator to ensure nothing is missed.

### 5. 👥 Guest List & RSVP Hub
- RSVP status tracker (*Confirmed*, *Pending*, *Declined*) with response rate visualizations.
- Dietary preferences (*Standard, Vegetarian, Vegan, Gluten-Free, Halal, Kosher*).
- Table assignment and Plus-One indicators.
- Quick search and filtering by RSVP status.

### 6. ✅ Smart Celebration Checklist
- Interactive tasks with instant progress calculation.
- One-click starter pack loader for weddings and birthdays.
- Celebratory confetti animations upon milestone achievements! 🎉

### 7. 🪄 Multi-Step Creation Wizard
- Seamless 4-step wizard with visual event type selection, budget presets, and per-guest cost estimates.
- Support for multiple concurrent events with swift sidebar switching.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Unit Tests
```bash
npm test
```
Executes native unit tests via Node's test runner (`node --test`).

### 4. Production Build
```bash
npm run build
```
Creates an optimized, tree-shaken, chunk-split production bundle in `dist/`.

---

## 📁 Project Structure

```
celebration-planner/
├── src/
│   ├── components/
│   │   ├── EmptyState.jsx       # Reusable empty states with animations
│   │   ├── Modal.jsx            # Accessible modal dialog with focus traps
│   │   ├── ProgressRing.jsx     # SVG animated progress indicators
│   │   ├── Sidebar.jsx          # Event switcher, nav drawer & Firebase Cloud Sync pill
│   │   ├── Sidebar.module.css
│   │   └── Toast.jsx            # Notification manager
│   ├── context/
│   │   └── AppContext.jsx       # Global state reducer & Firebase Firestore sync
│   ├── hooks/
│   │   ├── useLocalStorage.js   # Local storage synchronization
│   │   └── useToast.js          # Toast trigger hook
│   ├── pages/
│   │   ├── AiPlanner.jsx        # Gemini AI chat assistant & idea studio
│   │   ├── Budget.jsx           # Expense tracker & Recharts charts
│   │   ├── Checklist.jsx        # Smart task checklist with confetti
│   │   ├── Dashboard.jsx        # Central celebration command center
│   │   ├── Guests.jsx           # Guest list, RSVP tracker & meal choices
│   │   ├── NewEvent.jsx         # 4-step event creation wizard
│   │   ├── Settings.jsx         # Firebase Cloud panel, API keys & data reset
│   │   ├── Timeline.jsx         # Milestone timeline & day countdown
│   │   └── Vendors.jsx          # Vendor manager with contact details
│   ├── utils/
│   │   ├── firebase.js          # Firebase App, Firestore, Auth & Analytics
│   │   ├── gemini.js            # Official Google Generative AI integration
│   │   ├── helpers.js           # Math calculations, date & text helpers
│   │   └── helpers.test.js      # Unit tests
│   ├── App.jsx                  # Main routing & layout
│   ├── index.css                # Premium celebration design system
│   └── main.jsx                 # Application entry point
├── package.json
├── vite.config.js               # Chunking & performance optimization
└── README.md
```
