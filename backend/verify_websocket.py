#!/usr/bin/env python
"""
Manual WebSocket verification script for DashX real-time layer.

Connects to ws://localhost:8000/ws/dashboard/ and prints all incoming events.

PREREQUISITES:
  1. Start Redis:
       docker run -d -p 6379:6379 --name dashx-redis redis:7-alpine
     Or locally:
       redis-server

  2. Set REDIS_URL in your .env (or export):
       REDIS_URL=redis://localhost:6379/0

  3. Start the Django ASGI server:
       cd backend
       python manage.py runserver
     (Daphne is auto-detected via ASGI_APPLICATION in settings.py)

  4. Run this script in a separate terminal:
       python verify_websocket.py

  5. In a third terminal, trigger a booking status update via curl:
       curl -X PATCH http://localhost:8000/api/v1/bookings/<BOOKING_ID>/status/ \\
            -H "Content-Type: application/json" \\
            -d '{"status": "ASSIGNED", "notes": "Test dispatch"}'

     Or trigger a mechanic status update:
       curl -X PATCH http://localhost:8000/api/v1/mechanics/<MECHANIC_ID>/status/ \\
            -H "Content-Type: application/json" \\
            -d '{"status": "BUSY"}'

  6. You should see the corresponding BOOKING_UPDATED or MECHANIC_STATUS_CHANGED
     event printed in this terminal.

EXPECTED OUTPUT:
  [CONNECTED] to ws://localhost:8000/ws/dashboard/
  [EVENT] {
    "type": "CONNECTION_ACK",
    "timestamp": "2026-09-01T14:30:00+05:30",
    "message": "Connected to DashX operations stream"
  }
  [EVENT] {
    "type": "BOOKING_UPDATED",
    "timestamp": "2026-09-01T14:35:12+05:30",
    "payload": {
      "booking_id": 1426,
      "reference_code": "IM-260907-00227",
      "status": "ASSIGNED",
      ...
    }
  }
"""

import asyncio
import json
import sys

try:
    import websockets
except ImportError:
    print("ERROR: 'websockets' library not installed.")
    print("Install it with: pip install websockets")
    sys.exit(1)


WS_URL = "ws://localhost:8000/ws/dashboard/"


async def listen():
    print(f"Connecting to {WS_URL} ...")
    try:
        async with websockets.connect(WS_URL) as ws:
            print(f"[CONNECTED] to {WS_URL}")
            print("Listening for events... (Ctrl+C to stop)\n")

            async for message in ws:
                try:
                    data = json.loads(message)
                    print(f"[EVENT] {json.dumps(data, indent=2)}\n")
                except json.JSONDecodeError:
                    print(f"[RAW] {message}\n")

    except ConnectionRefusedError:
        print(f"ERROR: Could not connect to {WS_URL}")
        print("Make sure the Django ASGI server is running:")
        print("  cd backend && python manage.py runserver")
        sys.exit(1)
    except websockets.exceptions.WebSocketException as e:
        print(f"WebSocket error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    try:
        asyncio.run(listen())
    except KeyboardInterrupt:
        print("\n[DISCONNECTED] Listener stopped.")
