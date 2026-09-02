# DashX — Live Vehicle Service Operations Dashboard

DashX is an enterprise-grade, real-time vehicle service operations platform designed for automotive fleet managers, service center dispatchers, and operations controllers to monitor bookings, field mechanics, customers, revenue streams, and workshop telemetry from a unified command center.

![DashX Operations Command](frontend/src/assets/dashx-logo.png)

---

## Overview

Modern automotive service networks operate in fast-paced, high-volume environments where vehicle breakdowns, scheduled maintenance, and emergency roadside repairs occur simultaneously across metropolitan hubs. Dispatchers often struggle with fragmented spreadsheets, stale metrics, and disconnected phone calls to track technician availability.

**DashX solves this by unifying the entire service operations lifecycle into a single, real-time command center:**
- **Who uses it**: Lead bay controllers, fleet operations managers, customer support dispatchers, and financial auditors.
- **The problem it solves**: Eliminates communication latency, prevents technician double-booking, surfaces SLA bottlenecks before they escalate, and provides continuous operational intelligence.
- **Why real-time matters**: Instant visibility into technician status shifts and work order updates ensures rapid dispatch times and reliable customer SLAs without requiring manual page refreshes.

---

## Key Features

### 1. Command Center (`/`)
- **Operational KPI Telemetry**: Instant summary cards for Total Bookings, Active Dispatches, Completed Jobs, Cancelled Orders, Total Revenue, Today's Earnings, and Active Field Technicians.
- **Environmental & Station Telemetry**: Header telemetry strip displaying ambient weather, station air quality index (AQI), and lead dispatcher callsign for the **Gurugram Central Ops Hub**.
- **Interactive Timeseries Visualizations**: Multi-period (7D, 30D, 90D) charts for Bookings Over Time and Revenue Over Time with exact hover earnings and period totals.
- **Booking Status Distribution**: Donut telemetry chart tracking proportional distribution across all service statuses.
- **Fleet Pulse & Live Activity Stream**: Real-time ticker showing live technician assignments and booking transitions pushed over WebSockets.
- **Live Fleet Radar Map**: Dynamic regional radar canvas visualizing technician locations across key Gurugram hubs (Cyber Hub, DLF Phase 5, Sector 29, Sohna Road, Golf Course Road).

### 2. Bookings Management (`/bookings`)
- **Multi-Vector Filtering & Search**: Instant filtering by status, service category, date range, and full-text search across customer names, license plates, reference codes, and vehicle models.
- **Work Order Detail Drawer**: Slide-over drawer displaying customer contact details, vehicle specifications, service items, and technician notes.
- **Chronological Audit Trail**: Full status history tracking every state change, timestamp, and responsible operator.
- **Inline Status Actions & Dispatching**: Permissible state transitions and technician assignment with immediate database and WebSocket synchronization.

### 3. Field Mechanics & Dispatch (`/mechanics`)
- **Technician Roster & Workload**: Live tracking of technician availability (`Available`, `Busy`, `On Trip`, `Offline`), completed job counts, ratings, and years of experience.
- **Active Assignment HUD**: Dedicated cockpit box on each technician card showing active booking reference codes, customer names, vehicles, and destinations.
- **Inline Status Toggling**: Rapid availability override dropdown for bay supervisors.

### 4. Customer Registry (`/customers`)
- **Customer Directory**: Searchable list of registered vehicle owners with total spend, booking counts, and contact metadata.
- **Garage Fleet Inspection**: Slide-over drawer displaying all vehicles registered under a customer with fuel types, mileage, and license numbers.

### 5. Analytics (`/analytics`)
- **Deep-Dive Performance Metrics**: Comprehensive revenue curves, average ticket size, and service category breakdown.
- **Service Breakdown**: Revenue distribution across Periodic Maintenance, Engine Tuning, Braking & Suspension, and Climate Telemetry.

### 6. Operations & Financial Reports (`/reports`)
- **Financial Audit Statements**: Pre-formatted operations ledgers, technician SLA compliance sheets, and revenue statements with client-side live CSV export.

### 7. Alerts & Exceptions (`/alerts`)
- **Operational Bottleneck Monitor**: High-priority alert triggers for unassigned bookings, technician shortages in peak shifts, and low customer satisfaction flags.

### 8. System Configuration (`/settings`)
- **Autonomous Dispatch Heuristics**: Toggleable auto-dispatching protocols, SLA response thresholds, maximum service radii, and station callsign management.

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | High-performance SPA with fast HMR and optimized production bundles |
| **Language** | TypeScript (~6.0) | Strict static typing across components, API contracts, and WebSocket events |
| **State & Data Fetching** | TanStack Query (React Query v5) | Asynchronous server-state caching, background refetching, and cache invalidation |
| **Styling & Design System** | Tailwind CSS (v4) + CSS Custom Properties | Custom dark cockpit telemetry palette with high-contrast Light Mode support |
| **Charts & Visuals** | Recharts & Framer Motion | Responsive SVG charts, status donuts, and fluid slide-over sheet animations |
| **Icons** | Lucide React | Clean, scalable iconography for telemetry and status indicators |
| **Backend Framework** | Django 5 + Django REST Framework | Robust ORM, transactional controllers, validation, and auto-admin |
| **Real-Time & WebSockets** | Django Channels + Daphne + Redis | Asynchronous ASGI WebSocket server and pub/sub message distribution |
| **API Specification** | drf-spectacular (OpenAPI 3.0 / Swagger UI) | Automated OpenAPI schema generation and interactive documentation |
| **Database** | SQLite (Dev/Demo) / PostgreSQL (Prod) | Relational database with indexing on phone, email, and reference codes |
| **Testing** | Django Test Runner (`unittest`) | Automated unit and integration test suite |
| **Linter** | Oxlint | High-speed JavaScript/TypeScript static analysis |

---

## Architecture

DashX implements a decoupled, event-driven client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   React 18 Dashboard                   │
│             (TypeScript + Vite + Tailwind)             │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       HTTP REST Requests          Persistent WebSocket
        (/api/v1/...)               (/ws/dashboard/)
                │                        ▲
                ▼                        │
┌───────────────────────────────┐        │
│     Django REST Framework     │        │
│       (REST Controllers)      │        │
└───────────────┬───────────────┘        │
                │                        │
                ▼                        │
┌───────────────────────────────┐        │
│     BookingService Layer      │        │
│ (State Machine, Audit Trail)  │        │
└───────────────┬───────────────┘        │
                │                        │
      transaction.on_commit()            │
                │                        │
        ┌───────┴───────┐                │
        ▼               ▼                │
┌──────────────┐ ┌──────────────┐        │
│  PostgreSQL/ │ │Django Channels│       │
│  SQLite DB   │ │ (ASGI Layer) │        │
└──────────────┘ └──────┬───────┘        │
                        │                │
                        ▼                │
                 ┌──────────────┐        │
                 │Redis Channel │────────┘
                 │    Layer     │
                 └──────────────┘
```

---

## Real-Time Architecture

The real-time synchronization pipeline ensures that any state mutation performed by an operator is immediately reflected across all active dashboard clients without full page reloads:

1. **Operator Action**: A dispatcher updates a booking status (e.g. `ASSIGNED` → `ON_THE_WAY`) or assigns a mechanic via the web UI.
2. **Transactional Mutation**: The request hits the Django REST API endpoint, invoking `BookingService.update_status()`.
3. **Audit History Recording**: Inside a database transaction, the booking record is updated, and a new timestamped `BookingStatusHistory` entry is inserted.
4. **`transaction.on_commit()` Hook**: The service registers an event broadcast hook with Django's transaction manager.
5. **Database Commit**: The database transaction commits successfully.
6. **Channel Layer Broadcast**: The `on_commit` hook executes, sending a structured `BOOKING_UPDATED` or `MECHANIC_STATUS_CHANGED` event to the `dashboard_ops` Redis channel group.
7. **Client Reception**: Connected WebSocket clients receive the payload over `/ws/dashboard/`.
8. **Targeted Cache Invalidation**: The frontend's `useWebSocket` hook processes the message, adds it to the live activity feed, and instructs TanStack Query to invalidate relevant query keys (`['bookings']`, `['analytics']`, `['mechanics']`).
9. **Instant UI Refresh**: The UI re-renders the updated work order and metric badges seamlessly.

> [!IMPORTANT]
> **Why `transaction.on_commit()` is essential**: Emitting WebSocket events directly inside views can lead to race conditions where connected clients receive an event and query the database before the writing transaction has finished, or worse, emit phantom notifications for operations that subsequently roll back. `transaction.on_commit()` guarantees absolute data consistency.

---

## Database Schema & Relationships

```
Customer (1) ───────────< (M) Vehicle (1) ───────────< (M) Booking
                                                            │ (M)
                                                            │
                                                            ├───> (1) ServiceCategory
                                                            ├───> (1) Service
                                                            ├───> (0..1) Mechanic
                                                            └───< (M) BookingStatusHistory
```

- **`Customer`**: Vehicle owners registered with phone, email, address, and city (`Gurugram`).
- **`Vehicle`**: Vehicles linked to a customer with make, model, year, license plate, and fuel type.
- **`ServiceCategory` & `Service`**: Maintenance catalog with base pricing and estimated duration.
- **`Mechanic`**: Field technicians with specialization, experience, rating, availability status, and GPS coordinates.
- **`Booking`**: Central work order entity referencing Customer, Vehicle, Service, Mechanic, scheduled time, pricing, and status.
- **`BookingStatusHistory`**: Append-only audit trail logging every state transition, timestamp, and operator callsign.

---

## API Documentation

All REST API endpoints are prefixed with `/api/v1/`. Interactive documentation is available via Swagger UI at `/api/v1/docs/`.

### Core Endpoint Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Analytics** | `GET` | `/api/v1/analytics/overview/` | Returns top-line KPI metrics and revenue totals |
| **Analytics** | `GET` | `/api/v1/analytics/bookings-over-time/` | Time-series booking counts with date range filtering |
| **Analytics** | `GET` | `/api/v1/analytics/revenue-over-time/` | Time-series daily revenue ledger and average ticket |
| **Analytics** | `GET` | `/api/v1/analytics/status-distribution/` | Lifecycle status breakdown counts & percentages |
| **Analytics** | `GET` | `/api/v1/analytics/service-breakdown/` | Revenue and volume breakdown by service category |
| **Bookings** | `GET` | `/api/v1/bookings/` | Paginated booking ledger with status, search, and date filters |
| **Bookings** | `POST` | `/api/v1/bookings/` | Creates a new service work order |
| **Bookings** | `GET` | `/api/v1/bookings/<id>/` | Returns full booking details with audit history |
| **Bookings** | `PATCH` | `/api/v1/bookings/<id>/status/` | Executes a validated status transition & broadcasts event |
| **Bookings** | `PATCH` | `/api/v1/bookings/<id>/assign-mechanic/` | Assigns technician and updates availability |
| **Mechanics** | `GET` | `/api/v1/mechanics/` | Lists field technicians with ratings and active HUD tasks |
| **Mechanics** | `PATCH` | `/api/v1/mechanics/<id>/status/` | Updates technician availability status |
| **Customers** | `GET` | `/api/v1/customers/` | Paginated customer registry with spend and booking stats |
| **Customers** | `GET` | `/api/v1/customers/<id>/` | Returns customer profile with nested vehicle garage list |
| **Services** | `GET` | `/api/v1/service-categories/` | Lists service categories |
| **Services** | `GET` | `/api/v1/services/` | Lists maintenance catalog services with base pricing |
| **Docs** | `GET` | `/api/v1/docs/` | Interactive OpenAPI 3.0 Swagger UI |

*For complete request payloads, parameters, and error responses, refer to [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).*

---

## WebSocket API (`/ws/dashboard/`)

DashX provides a real-time event distribution stream over WebSockets:

| Event Type | Trigger | Key Payload Fields | Frontend Action |
| :--- | :--- | :--- | :--- |
| `CONNECTION_ACK` | On client WebSocket connection | `timestamp`, `message` | Sets connection state to `LIVE` |
| `BOOKING_UPDATED` | On booking status change / assignment | `booking_id`, `reference_code`, `status`, `mechanic_id`, `customer_name` | Pushes item to Activity Feed & invalidates booking/analytics cache |
| `MECHANIC_STATUS_CHANGED` | On technician availability shift | `mechanic_id`, `full_name`, `status`, `status_display` | Updates technician roster & command center counter |
| `METRICS_UPDATED` | On bulk operations | `timestamp` | Invalidates top-level KPI cache |

---

## Status Flow Architecture

DashX strictly distinguishes between **user-facing presentation terminology** and **internal backend state machine representations**:

### User-Facing Presentation Vocabulary
1. **`Pending`**: Booking logged, awaiting technician dispatch.
2. **`Assigned`**: Mechanic assigned and dispatched to bay.
3. **`On The Way`**: Technician in transit to customer location.
4. **`Completed`**: Service inspection and repairs completed.
5. **`Cancelled`**: Booking cancelled prior to service completion.

*(Note: The backend internally includes an `IN_PROGRESS` state representing active physical service, which maps gracefully into the dashboard's active dispatch lifecycle).*

---

## Verified Seed Dataset

The project database comes pre-seeded with a comprehensive operations dataset:

| Entity | Verified Count | Notes |
| :--- | :--- | :--- |
| **Customers** | **70** | Realistic Indian customer profiles located in Gurugram |
| **Vehicles** | **121** | Cars across Petrol, Diesel, EV, and Hybrid classes |
| **Field Mechanics** | **25** | Verified technicians across 4 specialization areas |
| **Service Categories** | **6** | Maintenance, Tuning, Braking, AC, Electrical, Roadside |
| **Maintenance Services** | **18** | Catalog services with defined labor hours and pricing |
| **Bookings (Work Orders)** | **650** | Realistic historical and active booking records |
| **Status Audit Histories** | **2,743** | Timestamped chronological transition records |

---

## Testing & Quality Assurance

The backend test suite verifies REST controllers, state machine validators, database constraints, and asynchronous WebSocket channel layers:

```bash
python manage.py test
```

### Verified Test Results
```
Ran 27 tests in 2.822s
OK (27/27 tests passed, 0 failures, 0 errors)
```

### Test Coverage Highlights
- **Real-Time Channels (`apps.realtime.tests`)**:
  - Connection acknowledgement on handshake.
  - Channel group broadcast verification.
  - Multi-client simultaneous event delivery.
  - Malformed frame rejection without server termination.
  - `transaction.on_commit()` rollback verification (ensuring rolled-back database mutations do NOT emit phantom events).
- **Bookings & State Transitions (`apps.bookings.tests`)**:
  - Valid status progression enforcement.
  - Illegal status transition rejection (`400 Bad Request`).
  - Mechanic double-booking prevention.
- **Analytics & Financials (`apps.analytics.tests`)**:
  - Revenue aggregation, ticket sizing, and date range filters.

---

## UI / UX Design System

DashX features a bespoke **automotive operations control-room aesthetic**:
- **Palette**: Dark charcoal foundation (`#0b0b0e`, `#131317`) accented with warm automotive orange (`#FF5500`) and semantic status indicators (emerald green, sky cyan, warm amber, crimson rose).
- **Atmospheric Hero Strip**: Background mechanical assembly texture behind environmental weather and AQI telemetry.
- **Dual-Theme High Contrast**: Full Light Mode toggle converting dark cards into crisp white surfaces (`#ffffff`) with WCAG-compliant deep black (`#0f172a`) and slate text.
- **Micro-Interactions**: Hover glows, radar pulse indicators, animated slide-over drawers, and fluid badge transitions.
- **Defensive UX States**:
  - **Loading**: Pulse skeletons for all cards, tables, and metric widgets.
  - **Empty States**: Contextual empty illustrations with clear call-to-actions.
  - **Error Banners**: Non-blocking toast notifications (`sonner`) and retry buttons.
  - **Connection Telemetry**: Live/Reconnecting/Offline badge indicating WebSocket stream status.

---

## Responsive Design

- **Desktop (1536px+)**: Full multi-column command center with side-by-side charts, telemetry widgets, and expanded sidebar navigation.
- **Tablet / Laptop (768px – 1280px)**: Collapsible sidebar rail (compacting to a 64px icon bar), adaptive 2-column card layouts, and auto-scrolling tables.
- **Mobile (< 768px)**: Single-column stacked telemetry widgets, touch-friendly slide-over detail sheets, and mobile hamburger navigation.

---

## Project Directory Tree

```
dashX/
├── backend/
│   ├── apps/
│   │   ├── analytics/       # KPI aggregation & time-series views
│   │   ├── bookings/        # Work orders, state machine & services
│   │   ├── core/            # Base models, pagination & utils
│   │   ├── customers/       # Customer registry & vehicle garages
│   │   ├── mechanics/       # Technician roster & availability
│   │   ├── realtime/        # WebSocket consumers, routing & events
│   │   ├── seed/            # Database generation & seeding commands
│   │   └── services/        # Service catalog & pricing models
│   ├── config/              # Django settings, ASGI, WSGI & URLs
│   ├── db.sqlite3           # Pre-seeded SQLite database (650 bookings)
│   ├── manage.py
│   └── requirements.txt     # Backend Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Logos, icons, and hero textures
│   │   ├── components/      # UI components (analytics, bookings, dashboard, layout)
│   │   ├── context/         # ThemeContext (Dark/Light mode)
│   │   ├── hooks/           # useWebSocket, useBookings, useOverview
│   │   ├── pages/           # Command Center, Bookings, Mechanics, Reports, Settings
│   │   ├── services/        # Axios API clients with cloud fallback
│   │   └── types/           # TypeScript interfaces matching backend models
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json          # Frontend SPA routing configuration
│
├── docs/
│   ├── API_DOCUMENTATION.md # Comprehensive REST & WebSocket API spec
│   └── ARCHITECTURE.md      # Detailed system architecture & ERD
│
├── submission/
│   ├── SUBMISSION.md        # Formal internship submission details
│   └── CHECKLIST.md         # Deliverable verification checklist
│
├── api/
│   └── index.py             # Serverless WSGI entrypoint for cloud deployment
├── README.md                # Root project documentation
├── requirements.txt         # Root Python dependencies
└── .gitignore
```

---

## Local Setup & Quick Start

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18.0+
- **Redis** *(Optional for local development; Django Channels automatically falls back to an in-memory channel layer when Redis is not running)*

---

### 2. Backend Setup (Windows PowerShell / Bash)

```powershell
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate      # On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (already migrated if using provided db.sqlite3)
python manage.py migrate

# (Optional) Re-seed fresh demo dataset if desired
# python manage.py seed_database

# Start Django ASGI development server
python manage.py runserver 8000
```
- **Backend API**: `http://127.0.0.1:8000/api/v1/`
- **Swagger Documentation**: `http://127.0.0.1:8000/api/v1/docs/`
- **Django Admin**: `http://127.0.0.1:8000/admin/`

---

### 3. Frontend Setup

```powershell
# Open a new terminal in the frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```
- **Frontend Dashboard**: `http://127.0.0.1:5173/`

---

## Environment Variables

### Backend (`backend/.env`)
```ini
DEBUG=True
SECRET_KEY=django-insecure-dashx-ops-dashboard-secret-key-prod-change-in-ec2
ALLOWED_HOSTS=*
# Optional: Use Redis for multi-worker production pub/sub
# REDIS_URL=redis://localhost:6379/0
# Optional: Use PostgreSQL in production
# DATABASE_URL=postgres://user:password@localhost:5432/dashx_db
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_BASE_URL=ws://localhost:8000
```

---

## Deployment Architecture

- **Frontend**: Deployed on **Vercel** (`https://dash-x-lpyc.vercel.app`) with SPA rewrite rules in [`frontend/vercel.json`](frontend/vercel.json).
- **Backend**: Can be deployed serverlessly on Vercel via [`api/index.py`](api/index.py) or as a persistent ASGI service on **Render / Railway / Fly.io / AWS EC2** via `daphne -b 0.0.0.0 -p $PORT config.asgi:application`.

---

## AI Usage Disclosure

In compliance with the internship assignment guidelines, AI coding assistants were leveraged throughout the development of DashX:
- **Tools**: ChatGPT (OpenAI), Google Gemini, and Antigravity (Google DeepMind).
- **Use Cases**: Architecture brainstorming, rapid React component scaffolding, TypeScript interface typing, SQL index design, and automated test generation.
- **Review Process**: All AI-suggested code was rigorously reviewed, debugged, refactored, manually verified against live browser runs, and validated with passing unit tests.

---

## Engineering Decisions

1. **Why Django + DRF?**
   Django provides an industrial-grade ORM with built-in transactional guarantees, declarative serialization, schema validation, and mature authentication models, allowing rapid development of dependable backend services.
2. **Why WebSockets over Polling?**
   Polling creates unnecessary server load and introduces a multi-second notification lag. WebSockets provide sub-millisecond event distribution with minimal network overhead.
3. **Why `transaction.on_commit()`?**
   Eliminates race conditions by ensuring events are emitted only after database writes have permanently committed.
4. **Why TanStack Query?**
   Provides server-state caching, dedupes identical in-flight requests, and allows surgical cache invalidation without requiring manual Redux boilerplate.

---

## Future Improvements

- **Role-Based Access Control (RBAC)**: Fine-grained permissions separating Lead Dispatchers, Bay Technicians, and Read-Only Auditors.
- **Live GPS Fleet Tracking**: Real-time geolocation updates streamed from a mobile mechanic application via WebSockets.
- **Predictive Dispatch ML**: Machine learning heuristic allocating mechanics based on traffic, job complexity, and historical completion times.
- **Automated CI/CD Pipeline**: GitHub Actions running unit tests, linting, and automated Vercel/Render deployments on pull requests.

---

## License
Proprietary — Instant Mechanic Full Stack Developer Internship Submission.
