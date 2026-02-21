# VC Intelligence Interface

A high-fidelity venture capital sourcing platform that helps investors discover, analyze, and track early-stage startups. Built as a production-quality prototype with live AI enrichment, intelligent filtering, and a clean dark-themed interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## Features

### 🏢 Company Pipeline
- **15 pre-loaded startups** spanning AI/ML, FinTech, HealthTech, EdTech, and more
- **Sortable data table** with TanStack Table — click any column header
- **Multi-filter toolbar** — filter by Industry, Stage, or free-text search
- **Global search** via `Cmd+K` / `Ctrl+K` keyboard shortcut
- **Company detail sheet** — click any row for the full profile

### 🤖 AI Enrichment Engine
- **One-click enrichment** — extracts structured intelligence from any company website
- **Bulk Enrich All** — processes all un-enriched companies sequentially
- **Re-enrich** — re-run enrichment on already-analyzed companies
- **Enrichment pipeline:**
  1. **AI Scrape** — Fetches website content via [Jina Reader API](https://jina.ai/reader/)
  2. **LLM Extraction** — Structured JSON output via [Groq](https://groq.com/) (Llama 3.3 70B)
  3. **Signal Derivation** — Investment signals derived from content
  4. **Thesis Alignment** — Signals tailored to your fund's investment thesis
- **Extracted fields:** Summary, What They Do, Keywords, Derived Signals, Sources
- **Graceful fallbacks** — mock enrichment if API is unavailable, retry toast on failure
- **24h caching** per URL to minimize redundant API calls

### 📋 Lists & Organization
- **Create custom lists** to track deal pipeline stages
- **Add companies to lists** directly from the detail sheet
- **Export any list to CSV** with one click
- **Color-coded list cards** with company previews

### 🔖 Saved Searches
- Save filter configurations for quick access
- Re-run saved searches to see updated results

### ⚙️ Settings
- **Investment thesis editor** — stored persistently, fed to every enrichment
- Thesis shapes the AI's signal derivation for fund-specific insights

### 🎨 Power-User UX
- `Cmd+K` / `Ctrl+K` — Focus global search
- `Escape` — Close company detail sheet
- Collapsible sidebar with count badges
- Staggered skeleton loading during enrichment
- Toast notifications with retry actions
- Enrichment timestamps (relative time display)
- Responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **State** | Zustand with localStorage persistence |
| **Table** | TanStack Table (sorting, filtering) |
| **AI/LLM** | Groq API (Llama 3.3 70B Versatile) |
| **Scraping** | Jina Reader API |
| **Notifications** | Sonner |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys) (no credit card required)

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd VC-Intelligence-Interface

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your Groq API key:
# GROQ_API_KEY=gsk_your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for AI enrichment ([get one free](https://console.groq.com/keys)) |
| `GROQ_MODEL` | No | Override LLM model (default: `llama-3.3-70b-versatile`) |

> **Note:** API keys are exclusively used server-side in route handlers — they are never exposed to the client.

---

## Architecture

```
src/
├── app/
│   ├── api/enrich/      # Server-side enrichment pipeline (Jina + Groq)
│   ├── companies/       # Main pipeline view
│   ├── lists/           # List management
│   ├── saved/           # Saved search configurations
│   └── settings/        # Thesis editor & config
├── components/
│   ├── companies/       # CompanyTable, CompanySheet
│   ├── layout/          # AppShell, Sidebar, SearchHeader
│   └── ui/              # shadcn/ui primitives
├── data/
│   └── mock-companies.ts  # 15 seed startups
├── store/
│   └── useStore.ts      # Zustand store (companies, lists, searches, thesis)
└── types/
    └── index.ts         # TypeScript interfaces
```

### Enrichment Pipeline Flow

```
Company URL → Jina Reader (scrape) → Markdown → Groq LLM (extract) → Structured JSON
                                                                          ↓
                                                              summary, what_they_do,
                                                              keywords, derived_signals,
                                                              sources
```

The pipeline handles failures gracefully:
- **Jina fails?** → Falls back to company description
- **Groq rate-limited?** → Returns mock enrichment data (flagged with `demo: true`)
- **No API key?** → Mock enrichment works out of the box

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add `GROQ_API_KEY` to your Vercel project's Environment Variables in the dashboard.

### Production Build

```bash
npm run build
npm start
```

---

## Design Decisions

- **Server-side API keys** — All LLM/scraping API calls go through Next.js route handlers. No secrets reach the browser.
- **Zustand + localStorage** — Lightweight state management with automatic persistence. No database needed for a prototype.
- **Graceful degradation** — The app works perfectly without API keys (mock enrichment), making demos reliable.
- **Rate limit resilience** — Exponential backoff awareness + automatic fallback to mock data on 429 errors.
- **No external CSS framework lock-in** — Uses Tailwind utilities with shadcn/ui primitives for maximum flexibility.

---

## License

MIT
