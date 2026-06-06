# TokenShark 🦈

**LLM Observability & Cost Intelligence Platform**

> Datadog for LLM Applications — Real-time cost attribution, prompt regression detection, hallucination tracking, and token waste analysis for production AI teams.

---

## Quick Start

```bash
# 1. Clone and enter directory
cd tokenshark

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Run the application
python run.py
```

Open [http://localhost:5000](http://localhost:5000)

---

## Features

### 10+ Quality of Life Features

| Feature | Description |
|---------|-------------|
| **Dark/Light Theme** | Toggle with `T` key or button. Preference persisted server-side |
| **Command Palette** | `Cmd/Ctrl+K` — Search pages, commands, actions |
| **Keyboard Shortcuts** | `?` to view all shortcuts. `G+D` for Dashboard, `G+E` for Events, etc. |
| **Breadcrumb Navigation** | Context-aware path showing your location in the app |
| **Flash Messages** | Auto-dismissing toast notifications with icons |
| **Toast System** | Programmatic toast API for success/error/info/warning |
| **Copy to Clipboard** | One-click copy for code blocks, API keys |
| **Password Strength** | Real-time visual meter with color-coded feedback |
| **Password Visibility** | Toggle show/hide on all password inputs |
| **Search/Filter** | Live table filtering, command palette search |
| **Sidebar Collapse** | `Cmd/Ctrl+B` to toggle sidebar width |
| **Live Indicator** | Pulsing "Live" badge on dashboard |
| **Responsive Design** | Full mobile/tablet/desktop support |
| **Scroll Reveal** | Intersection Observer animations on all cards |
| **Sparkline Charts** | Animated mini-charts on stat cards |
| **Canvas Charts** | Cost line chart + donut chart on dashboard |
| **FAQ Accordion** | Animated expand/collapse with ARIA support |
| **Onboarding Flow** | 3-step guided setup for new users |
| **Export Data** | CSV export from dashboard panels |
| **Hotjar Analytics** | Integrated UX tracking |

---

## Project Structure

```
tokenshark/
├── app.py                    # Flask application factory
├── config.py                 # All variables & secrets
├── run.py                    # Entry point
├── requirements.txt          # Dependencies
├── .env.example              # Environment template
├── .gitignore
├── README.md
│
├── blueprints/               # Route blueprints
│   ├── main.py               # Public pages (landing, pricing, etc.)
│   ├── auth.py               # Login, register, logout
│   ├── dashboard.py          # Dashboard pages
│   ├── api.py                # API endpoints for SDK
│   ├── billing.py            # Billing & subscriptions
│   └── docs.py               # Documentation pages
│
├── models/                   # SQLAlchemy models
│   ├── user.py               # User authentication
│   ├── team.py               # Organization/team
│   ├── api_key.py            # API key management
│   ├── llm_event.py          # LLM telemetry events
│   ├── alert.py              # Notifications/alerts
│   └── invitation.py         # Team invitations
│
├── templates/                # Jinja2 templates
│   ├── base.html             # Master layout
│   ├── partials/             # Reusable components
│   │   ├── marketing_nav.html
│   │   ├── app_nav.html
│   │   ├── sidebar.html
│   │   ├── footer.html
│   │   ├── flash.html
│   │   ├── command_palette.html
│   │   ├── toast_container.html
│   │   └── keyboard_shortcuts.html
│   └── pages/                # Page templates
│       ├── landing.html
│       ├── features.html
│       ├── pricing.html
│       ├── about.html
│       ├── contact.html
│       ├── error.html
│       ├── auth/
│       ├── dashboard/
│       ├── docs/
│       └── billing/
│
├── static/
│   ├── css/                  # 7 CSS files (modular)
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── utilities.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── animations.css
│   │   └── pages.css
│   ├── js/                   # 5 JS files (modular)
│   │   ├── core.js
│   │   ├── ui.js
│   │   ├── animations.js
│   │   ├── charts.js
│   │   └── dashboard.js
│   └── images/
│       ├── TokenShark.png    # Logo (replace with your own)
│       └── og.png            # Open Graph image
│
├── utils/                    # Helper utilities
├── services/                 # Business logic
└── tests/                    # Test suite
```

---

## Design System

### Colors
- **Black**: `#0a0a0a` to `#888888` — Primary dark palette
- **White**: `#ffffff` to `#e0e0e0` — Light accents
- **Rosewater**: `#fdf8f7` to `#361c1b` — Brand accent

### Typography
- **JetBrains Mono** — Code, data, monospace elements
- **Inter** — Body text, UI elements
- **Space Grotesk** — Headlines, display text

---

## Environment Variables

See `.env.example` for all available variables. Key ones:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask session encryption |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis for caching/sessions |
| `HOTJAR_ID` | Hotjar tracking ID |
| `STRIPE_SECRET_KEY` | Payment processing |
| `MAIL_USERNAME` | SMTP email credentials |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ingest` | Ingest LLM event from SDK |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/stats` | Aggregated statistics |

---

## License

MIT License — Built for solo technical founders.

---

*TokenShark — Stop flying blind. Start monitoring your LLM production stack.*
