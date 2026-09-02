# DashX — REST & WebSocket API Documentation

DashX exposes a production-ready, OpenAPI 3.0-documented REST API built on **Django REST Framework (DRF)**, paired with a real-time event distribution layer powered by **Django Channels & Redis WebSockets**.

- **Interactive Swagger UI**: `/api/v1/docs/`
- **OpenAPI Schema**: `/api/v1/schema/`
- **Base Endpoint**: `/api/v1/`
- **WebSocket Gateway**: `/ws/dashboard/`

---

## 1. Analytics Endpoints

### 1.1 Get Operational KPI Overview
- **Method**: `GET`
- **Path**: `/api/v1/analytics/overview/`
- **Description**: Returns top-level aggregated telemetry for the dashboard command center.
- **Parameters**: None
- **Response**: `200 OK`
```json
{
  "total_bookings": 650,
  "today_bookings": 32,
  "completed_bookings": 584,
  "pending_bookings": 18,
  "assigned_bookings": 12,
  "on_the_way_bookings": 8,
  "in_progress_bookings": 6,
  "cancelled_bookings": 48,
  "total_revenue": "1849404.00",
  "today_revenue": "72300.00",
  "active_mechanics": 8,
  "total_mechanics": 25,
  "new_customers_this_month": 24
}
```

---

### 1.2 Bookings Over Time
- **Method**: `GET`
- **Path**: `/api/v1/analytics/bookings-over-time/`
- **Description**: Daily time-series breakdown of booking volumes.
- **Query Parameters**:
  - `start_date` *(optional, ISO string, e.g. `2026-08-01`)*: Filter range start
  - `end_date` *(optional, ISO string, e.g. `2026-09-02`)*: Filter range end
- **Response**: `200 OK`
```json
[
  {
    "date": "2026-09-01",
    "total_bookings": 28,
    "completed": 25,
    "in_progress": 2,
    "pending": 0,
    "cancelled": 1
  }
]
```

---

### 1.3 Revenue Over Time
- **Method**: `GET`
- **Path**: `/api/v1/analytics/revenue-over-time/`
- **Description**: Time-series revenue ledger aggregated by day, with completed job counts and average ticket size.
- **Query Parameters**:
  - `start_date` *(optional)*
  - `end_date` *(optional)*
- **Response**: `200 OK`
```json
[
  {
    "date": "2026-09-01",
    "revenue": "64900.00",
    "completed_jobs": 16,
    "avg_ticket": "₹4,056"
  }
]
```

---

### 1.4 Booking Status Distribution
- **Method**: `GET`
- **Path**: `/api/v1/analytics/status-distribution/`
- **Description**: Proportional distribution of bookings across all operational lifecycle states.
- **Parameters**: None
- **Response**: `200 OK`
```json
[
  {
    "status": "COMPLETED",
    "status_display": "Completed",
    "count": 584,
    "percentage": 89.8
  },
  {
    "status": "CANCELLED",
    "status_display": "Cancelled",
    "count": 48,
    "percentage": 7.4
  }
]
```

---

### 1.5 Service & Category Breakdown
- **Method**: `GET`
- **Path**: `/api/v1/analytics/service-breakdown/`
- **Description**: Revenue and volume breakdown by service category and top individual maintenance services.
- **Parameters**: None
- **Response**: `200 OK`
```json
{
  "by_category": [
    {
      "category_name": "Periodic Maintenance",
      "total_bookings": 285,
      "total_revenue": "855000.00"
    }
  ],
  "top_services": [
    {
      "service_name": "Comprehensive Full Synthetic Service",
      "category_name": "Periodic Maintenance",
      "total_bookings": 198,
      "total_revenue": "594000.00"
    }
  ]
}
```

---

## 2. Bookings Endpoints

### 2.1 List Bookings (Paginated & Filterable)
- **Method**: `GET`
- **Path**: `/api/v1/bookings/`
- **Query Parameters**:
  - `page` *(integer, default `1`)*: Page number
  - `page_size` *(integer, default `20`)*: Records per page
  - `status` *(string, optional)*: Filter by `PENDING`, `ASSIGNED`, `ON_THE_WAY`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - `search` *(string, optional)*: Search reference code, customer name, license plate, make, model
  - `mechanic_id` *(integer, optional)*: Filter by assigned mechanic
  - `category` *(string, optional)*: Filter by service category slug
  - `start_date` / `end_date` *(ISO date strings, optional)*: Date range
  - `ordering` *(string, default `-scheduled_at`)*: Ordering attribute (e.g. `total_amount`, `-created_at`)
- **Response**: `200 OK`
```json
{
  "count": 650,
  "next": "http://127.0.0.1:8000/api/v1/bookings/?page=2",
  "previous": null,
  "results": [
    {
      "id": 101,
      "reference_code": "IM-260901-00408",
      "customer": {
        "id": 1,
        "first_name": "Rahul",
        "last_name": "Singhania",
        "full_name": "Rahul Singhania",
        "email": "rahul.singhania@example.com",
        "phone": "+91 98111 22334",
        "city": "Gurugram"
      },
      "vehicle": {
        "id": 1,
        "make": "Hyundai",
        "model": "Creta 1.5 SX",
        "year": 2023,
        "license_plate": "HR 26 DQ 8891",
        "fuel_type": "PETROL",
        "mileage": 18450,
        "display_name": "2023 Hyundai Creta 1.5 SX"
      },
      "service": {
        "id": 1,
        "name": "Comprehensive Periodic Maintenance",
        "category_name": "Periodic Maintenance",
        "category_slug": "periodic-maintenance",
        "base_price": "2899.00",
        "estimated_duration_minutes": 120
      },
      "mechanic": {
        "id": 2,
        "first_name": "Vikram",
        "last_name": "Patel",
        "full_name": "Vikram Patel",
        "email": "vikram.patel@dashx.in",
        "phone": "+91 98202 34567",
        "status": "ON_TRIP",
        "status_display": "On Trip",
        "rating": "4.88"
      },
      "status": "ON_THE_WAY",
      "status_display": "On The Way",
      "scheduled_at": "2026-09-02T16:30:00Z",
      "completed_at": null,
      "base_price": "2899.00",
      "additional_charges": "0.00",
      "total_amount": "2899.00",
      "service_location": "DLF Phase 5, Golf Course Road, Gurugram",
      "created_at": "2026-09-02T11:00:00Z"
    }
  ]
}
```

---

### 2.2 Get Booking Work Order Detail
- **Method**: `GET`
- **Path**: `/api/v1/bookings/<id>/`
- **Description**: Returns full booking telemetry including audit history trail, mechanic notes, and customer remarks.
- **Response**: `200 OK`

---

### 2.3 Transition Booking Status
- **Method**: `PATCH`
- **Path**: `/api/v1/bookings/<id>/status/`
- **Description**: Executes a transactional status transition, enforces state machine validity, records status history, and broadcasts `BOOKING_UPDATED` WebSocket event.
- **Request Body**:
```json
{
  "status": "COMPLETED",
  "notes": "Full synthetic oil replacement and 40-point safety check completed.",
  "changed_by": "Dispatcher Ops - Lead Bay Controller"
}
```
- **Response**: `200 OK` (Updated `BookingDetail` object)
- **Error Codes**:
  - `400 Bad Request`: If invalid status transition requested (e.g. `COMPLETED` -> `PENDING`).
  - `404 Not Found`: Booking ID does not exist.

---

### 2.4 Assign Mechanic to Booking
- **Method**: `PATCH`
- **Path**: `/api/v1/bookings/<id>/assign-mechanic/`
- **Description**: Assigns technician to work order, transitions status to `ASSIGNED` if pending, updates mechanic status, and broadcasts real-time events.
- **Request Body**:
```json
{
  "mechanic_id": 2,
  "notes": "Dispatched for high-priority brake service.",
  "changed_by": "Dispatcher Ops"
}
```
- **Response**: `200 OK`

---

## 3. Mechanics Endpoints

### 3.1 List Field Mechanics
- **Method**: `GET`
- **Path**: `/api/v1/mechanics/`
- **Query Parameters**:
  - `status` *(string, optional)*: Filter by `AVAILABLE`, `BUSY`, `ON_TRIP`, `OFFLINE`
  - `search` *(string, optional)*: Search mechanic name, specialization, phone
  - `ordering` *(string, optional)*: Order by `-rating`, `total_jobs_completed`
- **Response**: `200 OK`
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "first_name": "Aarav",
      "last_name": "Sharma",
      "full_name": "Aarav Sharma",
      "email": "aarav.sharma@dashx.in",
      "phone": "+91 98101 23456",
      "status": "AVAILABLE",
      "status_display": "Available",
      "rating": "4.95",
      "total_jobs_completed": 184,
      "specialization": "Engine Tuning & Overhauls",
      "avatar_url": "",
      "experience_years": 8,
      "current_latitude": "28.4595",
      "current_longitude": "77.0266",
      "active_booking": null,
      "created_at": "2026-01-10T10:00:00Z"
    }
  ]
}
```

---

### 3.2 Update Mechanic Status
- **Method**: `PATCH`
- **Path**: `/api/v1/mechanics/<id>/status/`
- **Request Body**:
```json
{
  "status": "AVAILABLE"
}
```
- **Response**: `200 OK`

---

## 4. Customers Endpoints

### 4.1 List Customers
- **Method**: `GET`
- **Path**: `/api/v1/customers/`
- **Query Parameters**: `search`, `page`, `page_size`, `ordering`
- **Response**: `200 OK`

### 4.2 Customer Detail & Vehicle Garage
- **Method**: `GET`
- **Path**: `/api/v1/customers/<id>/`
- **Response**: `200 OK` (Customer profile with nested `vehicles` array)

---

## 5. Services & Catalog Endpoints

### 5.1 List Categories
- **Method**: `GET`
- **Path**: `/api/v1/service-categories/`

### 5.2 List Services
- **Method**: `GET`
- **Path**: `/api/v1/services/`
- **Query Parameters**: `category` *(category slug or ID)*, `search`

---

## 6. WebSocket Protocol (`/ws/dashboard/`)

DashX provides a persistent bi-directional WebSocket connection via Django Channels.

### 6.1 Handshake & Acknowledgement (`CONNECTION_ACK`)
Sent immediately when client connects.
```json
{
  "type": "CONNECTION_ACK",
  "timestamp": "2026-09-02T18:30:00.000Z",
  "message": "Connected to DashX Live Operations Stream"
}
```

### 6.2 Booking Mutation Broadcast (`BOOKING_UPDATED`)
Broadcast to all connected clients after a database commit:
```json
{
  "type": "BOOKING_UPDATED",
  "timestamp": "2026-09-02T18:30:05.120Z",
  "payload": {
    "booking_id": 101,
    "reference_code": "IM-260901-00408",
    "status": "ON_THE_WAY",
    "status_display": "On The Way",
    "mechanic_id": 2,
    "customer_name": "Rahul Singhania",
    "service_name": "Comprehensive Periodic Maintenance"
  }
}
```

### 6.3 Mechanic Status Shift Broadcast (`MECHANIC_STATUS_CHANGED`)
```json
{
  "type": "MECHANIC_STATUS_CHANGED",
  "timestamp": "2026-09-02T18:30:10.450Z",
  "payload": {
    "mechanic_id": 2,
    "full_name": "Vikram Patel",
    "status": "ON_TRIP",
    "status_display": "On Trip"
  }
}
```

### 6.4 Metrics Invalidation Notification (`METRICS_UPDATED`)
Triggers TanStack query invalidation on active clients to synchronize top-line KPIs.
