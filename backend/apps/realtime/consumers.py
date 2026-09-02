"""
DashboardConsumer — WebSocket consumer for the DashX operations dashboard.

Handles connections to /ws/dashboard/, adds clients to the 'ops_dashboard'
channel group, and forwards server-push events (booking updates, mechanic
status changes, metrics refresh hints) to all connected clients.

This consumer is server-push only. Client-to-server messages are silently
discarded after logging.
"""

import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

logger = logging.getLogger(__name__)

DASHBOARD_GROUP = 'ops_dashboard'


class DashboardConsumer(AsyncJsonWebsocketConsumer):
    """
    Async JSON WebSocket consumer for the operations dashboard.

    - On connect: joins the ops_dashboard group and sends CONNECTION_ACK.
    - On disconnect: leaves the group cleanly.
    - On receive: logs and discards (server-push channel).
    - dashboard_event handler: forwards group broadcasts to the WebSocket.
    """

    async def connect(self):
        """Accept connection, join group, send acknowledgement."""
        await self.channel_layer.group_add(
            DASHBOARD_GROUP,
            self.channel_name
        )
        await self.accept()

        # Send connection acknowledgement to this specific client
        await self.send_json({
            'type': 'CONNECTION_ACK',
            'timestamp': timezone.now().isoformat(),
            'message': 'Connected to DashX operations stream',
        })
        logger.info(
            "WebSocket connected: channel=%s group=%s",
            self.channel_name, DASHBOARD_GROUP
        )

    async def disconnect(self, close_code):
        """Leave the group cleanly on disconnect."""
        try:
            await self.channel_layer.group_discard(
                DASHBOARD_GROUP,
                self.channel_name
            )
        except Exception:
            # Graceful handling if group removal fails (e.g., Redis down)
            logger.warning(
                "Failed to discard channel %s from group %s on disconnect",
                self.channel_name, DASHBOARD_GROUP
            )
        logger.info(
            "WebSocket disconnected: channel=%s close_code=%s",
            self.channel_name, close_code
        )

    async def receive_json(self, content, **kwargs):
        """
        Handle incoming client messages.

        This is a server-push channel — client messages are logged and discarded.
        """
        logger.debug(
            "Received client message (discarded): channel=%s content=%s",
            self.channel_name, content
        )

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        """
        Override raw receive to catch malformed JSON without crashing.
        Valid JSON is delegated to receive_json via the parent class.
        """
        try:
            await super().receive(text_data=text_data, bytes_data=bytes_data, **kwargs)
        except Exception:
            logger.warning(
                "Malformed WebSocket message received (ignored): channel=%s data=%s",
                self.channel_name, text_data[:200] if text_data else bytes_data
            )

    # ── Group message handler ──────────────────────────────────────────

    async def dashboard_event(self, event):
        """
        Handler for 'dashboard.event' messages sent to the ops_dashboard group.

        Extracts the 'data' payload from the channel-layer message and forwards
        it directly to the WebSocket client as JSON.
        """
        await self.send_json(event['data'])
