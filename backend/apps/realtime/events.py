"""
Broadcast helpers for the DashX real-time event system.

These functions send structured events to the 'ops_dashboard' channel group.
They are designed to be called from synchronous Django code (service layer,
views) using async_to_sync. Each function wraps the channel_layer call in a
try/except so that Redis failures never crash the REST API.

Usage:
    from apps.realtime.events import broadcast_booking_updated
    transaction.on_commit(lambda: broadcast_booking_updated(booking))
"""

import logging
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

DASHBOARD_GROUP = 'ops_dashboard'


def _send_to_group(data: dict) -> None:
    """
    Internal helper: send a 'dashboard.event' message to the ops_dashboard group.

    Catches all exceptions so that a Redis outage (or missing channel layer)
    does not propagate to the caller — REST API continues to function normally.
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            logger.warning("Channel layer is not configured — skipping broadcast.")
            return

        async_to_sync(channel_layer.group_send)(
            DASHBOARD_GROUP,
            {
                'type': 'dashboard.event',
                'data': data,
            }
        )
        logger.info("Broadcast event: type=%s", data.get('type', 'UNKNOWN'))
    except Exception:
        logger.warning(
            "Failed to broadcast event (Redis may be down): type=%s",
            data.get('type', 'UNKNOWN'),
            exc_info=True
        )


def broadcast_booking_updated(booking) -> None:
    """
    Broadcast a BOOKING_UPDATED event to all connected dashboard clients.

    Sends a lightweight payload — not the full serialized booking — to minimize
    WebSocket message size. The frontend can re-fetch full details if needed.
    """
    _send_to_group({
        'type': 'BOOKING_UPDATED',
        'timestamp': timezone.now().isoformat(),
        'payload': {
            'booking_id': booking.id,
            'reference_code': booking.reference_code,
            'status': booking.status,
            'status_display': booking.get_status_display(),
            'mechanic_id': booking.mechanic_id,
            'customer_name': booking.customer.full_name if booking.customer else None,
            'service_name': booking.service.name if booking.service else None,
        }
    })


def broadcast_mechanic_status_changed(mechanic) -> None:
    """
    Broadcast a MECHANIC_STATUS_CHANGED event to all connected dashboard clients.
    """
    _send_to_group({
        'type': 'MECHANIC_STATUS_CHANGED',
        'timestamp': timezone.now().isoformat(),
        'payload': {
            'mechanic_id': mechanic.id,
            'full_name': mechanic.full_name,
            'status': mechanic.status,
            'status_display': mechanic.get_status_display(),
        }
    })


def broadcast_metrics_updated() -> None:
    """
    Broadcast a METRICS_UPDATED hint to all connected dashboard clients.

    This is a lightweight signal telling the frontend to re-fetch analytics
    data. No heavy payload is included.
    """
    _send_to_group({
        'type': 'METRICS_UPDATED',
        'timestamp': timezone.now().isoformat(),
        'payload': {}
    })
