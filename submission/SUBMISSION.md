# DashX — Internship Assignment Submission

## Candidate
**Sara Dhoundiyal**

## Project
**DashX — Live Vehicle Service Operations Command Center**

---

## Deliverable Links

- **Live Frontend Application**: `https://dash-x-lpyc.vercel.app`
- **GitHub Repository (Full Stack Monorepo)**: `https://github.com/Latiyan15/dashX`
- **Interactive API Documentation (Swagger UI)**: `https://dash-x-lpyc.vercel.app/api/v1/docs/` *(or `http://127.0.0.1:8000/api/v1/docs/` locally)*
- **OpenAPI 3.0 Schema**: `https://dash-x-lpyc.vercel.app/api/v1/schema/` *(or `http://127.0.0.1:8000/api/v1/schema/` locally)*
- **Live Backend API**: `https://dash-x-lpyc.vercel.app/api/v1/` *(Vercel Serverless Python WSGI / Local ASGI `http://127.0.0.1:8000/api/v1/`)*

---

## Short Architecture Explanation

DashX is an enterprise-grade vehicle service operations platform designed for dispatch managers and service controllers to oversee booking lifecycles, field technician assignments, financial revenue streams, and fleet geographic distribution in real time. 

The application is architected around a reactive **React 18 + TypeScript** frontend with **TanStack Query** for asynchronous server state synchronization, connected to a **Django 5 + Django REST Framework** backend. Real-time updates are driven by a dedicated **Django Channels WebSocket layer** (`/ws/dashboard/`) backed by a Redis pub/sub channel layer. A domain-driven service layer (`BookingService`) coordinates database mutations and utilizes Django's `transaction.on_commit()` hooks to ensure that WebSocket events are broadcast only after database transactions successfully commit, eliminating phantom events and race conditions.

---

## AI Tools Used

- **Antigravity (Google DeepMind)**: Core pair-programming agent for codebase navigation, full-stack implementation, testing orchestration, and telemetry UI design.
- **ChatGPT (OpenAI)**: Architecture design brainstorming, OpenAPI schema validation, and SQL query optimization strategies.
- **Google Gemini**: Rapid UI component prototyping, responsive grid design review, and edge-case test suite planning.

*Transparency Note: AI assistants were used extensively for architecture brainstorming, rapid component scaffolding, and test suite generation. All generated code was thoroughly reviewed, debugged, integrated, manually tested, and validated against strict TypeScript and Django test requirements.*

---

## What I'm Most Proud Of

What I am most proud of in DashX is the harmony between **robust transaction-safe backend engineering** and a **distinctive, high-performance operations UI**:

1. **Transaction-Aware Real-Time Telemetry**: Instead of naively broadcasting events inside view controllers, I implemented a service layer with `transaction.on_commit()`. This guarantees that if a database transaction aborts or fails validation, connected dispatchers never receive a false notification.
2. **Authentic Automotive Cockpit Aesthetics**: I crafted a bespoke automotive operations interface with dark telemetry styling, warm charcoal surfaces, and glowing instrument-cluster status badges, while engineering a high-contrast Light Theme toggle that guarantees WCAG-compliant legibility across all tables, charts, and metric HUDs.
3. **Resilient Production Experience**: The dashboard handles live WebSocket reconnections with exponential backoff, includes loading skeletons for every data widget, and provides high-fidelity fallback telemetry for cloud preview deployments.

---

## Key Technical Highlights

- **Real-Time WebSocket Stream**: Live bi-directional updates for booking status transitions and mechanic availability shifts with instant TanStack Query cache invalidation.
- **Strict State Machine Integrity**: Domain service layer enforces permissible status transitions (`PENDING` → `ASSIGNED` → `ON_THE_WAY` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`) and records a chronological `BookingStatusHistory` audit trail.
- **Automated Swagger / OpenAPI 3.0**: Fully documented and typed API schema generated automatically via `drf-spectacular`.
- **High-Performance Telemetry Visualizations**: Responsive, multi-timescale revenue and booking charts (7D / 30D / 90D) built with Recharts, with calibrated donut status distributions and live fleet radar maps.
- **Dual-Theme Automotive Design System**: Instant dark/light mode switching with custom CSS token mapping, collapsible 64px sidebar rail, and responsive slide-over work order drawers.
- **Comprehensive Test Coverage**: 27 automated tests covering analytics aggregation, booking lifecycle rules, customer garages, mechanic status transitions, and WebSocket event distribution.

---

## Verified Test Suite Results

```bash
python manage.py test
```
```
Creating test database for alias 'default'...
...........................
----------------------------------------------------------------------
Ran 27 tests in 2.822s

OK
Destroying test database for alias 'default'...
Found 27 test(s).
System check identified no issues (0 silenced).
```
- **Backend Unit & Integration Tests**: 27 / 27 Passed (100%)
- **Frontend TypeScript Check (`tsc -b`)**: 0 Errors
- **Frontend Production Build (`vite build`)**: Built in 2.15s
- **Linter (`oxlint`)**: 0 Errors across 63 files

---

## Verified Database Dataset Counts

Directly verified against the project SQLite database:
- **Customers**: 70
- **Vehicles**: 121
- **Field Mechanics**: 25
- **Service Categories**: 6
- **Maintenance Services**: 18
- **Bookings / Work Orders**: 650
- **Status Audit Histories**: 2,743
