# DashX — Technical Architecture & System Design

This document details the software architecture, data flow patterns, database relationships, and engineering principles behind DashX.

---

## 1. High-Level System Architecture

DashX separates concerns across a reactive single-page frontend, a transactional Django REST backend, and a real-time WebSocket channel layer.

```
                      ┌──────────────────────────────────────────────┐
                      │              React 18 Dashboard              │
                      │         (TypeScript + Vite + Tailwind)       │
                      └──────────────┬───────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
            HTTP/REST Requests                 Persistent WebSocket
                    │                             (/ws/dashboard/)
                    ▼                                 ▲
     ┌──────────────────────────────┐                 │
     │    Django REST Framework     │                 │
     │      (REST Controllers)      │                 │
     └──────────────┬───────────────┘                 │
                    │                                 │
                    ▼                                 │
     ┌──────────────────────────────┐                 │
     │    Business Service Layer    │                 │
     │ (BookingService, Dispatch)   │                 │
     └──────────────┬───────────────┘                 │
                    │                                 │
          transaction.on_commit()                     │
                    │                                 │
        ┌───────────┴───────────┐                     │
        ▼                       ▼                     │
 ┌──────────────┐       ┌──────────────┐              │
 │ PostgreSQL / │       │Django Channels│              │
 │ SQLite Engine│       │  (ASGI Layer)│              │
 └──────────────┘       └───────┬──────┘              │
                                │                     │
                                ▼                     │
                        ┌──────────────┐              │
                        │ Redis / In-  │──────────────┘
                        │ Memory Group │
                        └──────────────┘
```

---

## 2. Frontend Architecture

### 2.1 State Management & Telemetry Cache
- **Server State**: Managed via **TanStack Query (React Query v5)** with fine-grained cache invalidation keys (`['analytics', 'overview']`, `['bookings']`, `['mechanics']`).
- **UI State**: Managed with React Context (`ThemeContext.tsx`) for instant dark/light mode switching and persistent sidebar rail state.
- **Real-Time Hook (`useWebSocket.ts`)**: Manages the lifecycle of the WebSocket connection with exponential backoff auto-reconnect (`1s`, `2s`, `4s`, max `10s`), deserializing real-time frames and dispatching TanStack cache invalidations.

### 2.2 Component Hierarchy
```
App
 └─ ThemeProvider
     └─ QueryClientProvider
         └─ DashboardLayout
             ├─ Sidebar (Collapsible to 64px rail, navigation router)
             ├─ Header (Search, Theme Toggle, Dispatcher Profile, Live Telemetry Pill)
             └─ Workspace Page View:
                 ├─ Command Center (CockpitHero, OverviewCards, RevenueChart, StatusDistribution, LiveFleetMap)
                 ├─ BookingsPage (BookingFilters, BookingsTable, BookingDetailSheet, StatusActions)
                 ├─ MechanicsPage (MechanicCard grid, inline availability selector)
                 ├─ CustomersPage (CustomersTable, CustomerDetailSheet)
                 ├─ AnalyticsPage (Multi-axis charts, service breakdown)
                 ├─ ReportsPage (Financial statements, live CSV generator)
                 ├─ AlertsPage (SLA violation monitors, technician shortages)
                 └─ SettingsPage (Autonomous dispatch heuristics, telemetry parameters)
```

---

## 3. Backend Architecture & Service-Layer Pattern

DashX avoids fat controllers and bloated models by isolating business rules inside clean service layers:

- **`apps/bookings/services.py` (`BookingService`)**:
  - Encapsulates booking state machine transitions.
  - Validates permissible status transitions.
  - Automatically records timestamped `BookingStatusHistory` audit entries.
  - Triggers transaction-safe real-time broadcasts.
- **`apps/realtime/events.py`**:
  - Handles channel group broadcasting using `asgiref.sync.async_to_sync`.
  - Integrates `transaction.on_commit()` hooks so failed mutations never emit phantom events.

---

## 4. Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│     Customer     │
│──────────────────│
│ id (PK)          │
│ first_name       │
│ last_name        │
│ email (UQ, IDX)  │
│ phone (IDX)      │
│ city             │
└────────┬─────────┘
         │ 1
         │
         │ M
┌────────▼─────────┐
│     Vehicle      │
│──────────────────│
│ id (PK)          │
│ customer_id (FK) ├────────────────────────────┐
│ make, model      │                            │
│ license_plate(UQ)│                            │
│ fuel_type        │                            │
└──────────────────┘                            │
                                                │ 1
┌──────────────────┐                            │
│ ServiceCategory  │                            │
│──────────────────│                            │
│ id (PK)          │                            │
│ name, slug (UQ)  │                            │
└────────┬─────────┘                            │
         │ 1                                    │
         │                                      │
         │ M                                    │
┌────────▼─────────┐                            │
│     Service      │                            │
│──────────────────│                            │
│ id (PK)          │                            │
│ category_id (FK) │                            │
│ name, base_price │                            │
└────────┬─────────┘                            │
         │ 1                                    │
         │                                      │ M
         │ M                            ┌───────▼──────────┐
         └─────────────────────────────►│     Booking      │
                                        │──────────────────│
┌──────────────────┐                    │ id (PK)          │
│     Mechanic     │                    │ reference_code   │
│──────────────────│                    │ customer_id (FK) │
│ id (PK)          │ 1                M │ vehicle_id (FK)  │
│ full_name        │───────────────────►│ service_id (FK)  │
│ status, rating   │                    │ mechanic_id (FK) │
│ specialization   │                    │ status (IDX)     │
└──────────────────┘                    │ scheduled_at     │
                                        │ total_amount     │
                                        └────────┬─────────┘
                                                 │ 1
                                                 │
                                                 │ M
                                        ┌────────▼─────────┐
                                        │StatusHistoryEntry│
                                        │──────────────────│
                                        │ id (PK)          │
                                        │ booking_id (FK)  │
                                        │ from_status      │
                                        │ to_status        │
                                        │ changed_by       │
                                        │ created_at       │
                                        └──────────────────┘
```

---

## 5. Real-Time Event Architecture & `transaction.on_commit()`

A common vulnerability in distributed real-time systems is broadcasting WebSocket events before database changes are fully committed, leading to race conditions where connected clients query an uncommitted or rolled-back state.

DashX enforces consistency via Django's **`transaction.on_commit()`**:

```
Client (Dispatcher)           Django API                 Database               Channel Layer / WS
     │                            │                         │                           │
     ├── PATCH /status ──────────►│                         │                           │
     │                            ├── BEGIN TRANSACTION ───►│                           │
     │                            ├── UPDATE booking ──────►│                           │
     │                            ├── INSERT status_hist ──►│                           │
     │                            ├── register on_commit()  │                           │
     │                            ├── COMMIT ──────────────►│                           │
     │                            │                         │ (committed)               │
     │                            ├────── on_commit hook fires ────────────────────────►│
     │                            │                                                     ├── Broadcast BOOKING_UPDATED
     │◄── 200 OK (Response) ──────┤                                                     │
     │                            │                                                     ▼
     │◄───────────────────────────┴──────────────────────────────────────── Connected Dashboard Clients
```

### Why `transaction.on_commit()` is Critical:
1. **Guaranteed Consistency**: If any validation fails or the database raises an integrity error, the transaction rolls back and **zero** WebSocket messages are emitted.
2. **Eliminates Race Conditions**: When clients receive the WebSocket event and immediately query related records, the database transaction is guaranteed to be committed.

---

## 6. Key Engineering Decisions

| Decision | Selection | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | Django 5 + DRF | Mature ORM with transactions, declarative serializers, out-of-the-box admin, and seamless ASGI Channels integration. |
| **Real-Time Distribution** | Django Channels + Redis | Scalable pub/sub channel layer supporting horizontal scaling across multiple worker nodes. |
| **Frontend Framework** | React 18 + Vite | Sub-second hot-module reloading, strict TypeScript typing, and high-performance bundle tree-shaking. |
| **Server State Management** | TanStack Query v5 | Automatic background refetching, cache de-duplication, and surgical cache invalidation upon WebSocket alerts. |
| **CSS System** | Tailwind CSS v4 | Curated HSL automotive telemetry token system with instant dark/light mode toggle. |
| **Data Integrity** | State Machine Validator | Prevents illegal state transitions (e.g. attempting to cancel an already completed work order). |
