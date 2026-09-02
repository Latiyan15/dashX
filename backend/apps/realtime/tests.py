"""
Async test suite for the DashX real-time WebSocket layer.

Tests use Django Channels' WebsocketCommunicator with InMemoryChannelLayer
(no Redis dependency for CI). Covers:
    1. Connection and CONNECTION_ACK
    2. Clean disconnect
    3. BOOKING_UPDATED broadcast
    4. MECHANIC_STATUS_CHANGED broadcast
    5. Multiple clients receiving the same event
    6. Malformed client message handling
    7. No broadcast on transaction rollback (transaction.on_commit semantics)
"""

import pytest
from decimal import Decimal
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from django.db import transaction
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from apps.realtime.consumers import DashboardConsumer
from apps.realtime.events import (
    broadcast_booking_updated,
    broadcast_mechanic_status_changed,
)
from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking
from apps.bookings.services import BookingService, BookingTransitionError


# Use InMemoryChannelLayer for all WebSocket tests (no Redis needed)
TEST_CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class WebSocketConnectionTests(TransactionTestCase):
    """Tests for WebSocket connection lifecycle."""

    async def test_connect_and_ack(self):
        """Client connects to /ws/dashboard/ and receives CONNECTION_ACK."""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Should receive CONNECTION_ACK as first message
        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response['type'], 'CONNECTION_ACK')
        self.assertIn('timestamp', response)
        self.assertEqual(response['message'], 'Connected to DashX operations stream')

        await communicator.disconnect()

    async def test_disconnect_clean(self):
        """Client disconnects without errors."""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Consume the ACK
        await communicator.receive_json_from(timeout=2)

        # Disconnect should not raise
        await communicator.disconnect()

    async def test_malformed_message_ignored(self):
        """Client sends non-JSON text — connection stays open, no crash."""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Consume the ACK
        await communicator.receive_json_from(timeout=2)

        # Send malformed (non-JSON) text
        await communicator.send_to(text_data='this is not json {{{')

        # Connection should still be open — send valid JSON and verify no crash
        await communicator.send_json_to({'ping': True})

        # The consumer discards client messages, so we shouldn't get a response.
        # Verify no output arrives (would timeout if nothing)
        nothing = await communicator.receive_nothing(timeout=0.5)
        self.assertTrue(nothing)

        await communicator.disconnect()


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class BookingBroadcastTests(TransactionTestCase):
    """Tests for BOOKING_UPDATED event broadcasting."""

    def setUp(self):
        self.customer = Customer.objects.create(
            first_name="Priya", last_name="Patel",
            email="priya.patel@example.com",
            phone="+91 98765 11111", city="Mumbai"
        )
        self.vehicle = Vehicle.objects.create(
            customer=self.customer, make="Tata", model="Nexon",
            year=2023, license_plate="MH 01 XY 1234", mileage=20000
        )
        self.category = ServiceCategory.objects.create(
            name="Engine Care", slug="engine-care"
        )
        self.service = Service.objects.create(
            category=self.category, name="Oil Change",
            base_price=Decimal("1999.00"),
            estimated_duration_minutes=45
        )
        self.mechanic = Mechanic.objects.create(
            first_name="Suresh", last_name="Yadav",
            email="suresh.yadav@instantmechanic.in",
            phone="+91 98765 22222",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.80"),
            total_jobs_completed=35
        )
        self.booking = Booking.objects.create(
            reference_code="IM-260901-99001",
            customer=self.customer, vehicle=self.vehicle,
            service=self.service, status=Booking.Status.PENDING,
            scheduled_at=timezone.now(),
            base_price=Decimal("1999.00"),
            total_amount=Decimal("1999.00")
        )

    async def test_booking_updated_broadcast(self):
        """BOOKING_UPDATED event is received by a connected client after broadcast."""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Consume the CONNECTION_ACK
        await communicator.receive_json_from(timeout=2)

        # Broadcast a booking update from the sync service layer
        await sync_to_async(broadcast_booking_updated)(self.booking)

        # Client should receive the BOOKING_UPDATED event
        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response['type'], 'BOOKING_UPDATED')
        self.assertIn('timestamp', response)
        self.assertEqual(response['payload']['booking_id'], self.booking.id)
        self.assertEqual(response['payload']['reference_code'], 'IM-260901-99001')
        self.assertEqual(response['payload']['status'], 'PENDING')
        self.assertEqual(response['payload']['customer_name'], 'Priya Patel')
        self.assertEqual(response['payload']['service_name'], 'Oil Change')

        await communicator.disconnect()

    async def test_multiple_clients_receive_same_event(self):
        """Two connected clients both receive the same BOOKING_UPDATED event."""
        comm1 = WebsocketCommunicator(
            DashboardConsumer.as_asgi(), '/ws/dashboard/'
        )
        comm2 = WebsocketCommunicator(
            DashboardConsumer.as_asgi(), '/ws/dashboard/'
        )

        connected1, _ = await comm1.connect()
        connected2, _ = await comm2.connect()
        self.assertTrue(connected1)
        self.assertTrue(connected2)

        # Consume ACKs
        await comm1.receive_json_from(timeout=2)
        await comm2.receive_json_from(timeout=2)

        # Broadcast once
        await sync_to_async(broadcast_booking_updated)(self.booking)

        # Both clients should receive it
        resp1 = await comm1.receive_json_from(timeout=2)
        resp2 = await comm2.receive_json_from(timeout=2)

        self.assertEqual(resp1['type'], 'BOOKING_UPDATED')
        self.assertEqual(resp2['type'], 'BOOKING_UPDATED')
        self.assertEqual(
            resp1['payload']['booking_id'],
            resp2['payload']['booking_id']
        )

        await comm1.disconnect()
        await comm2.disconnect()


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class MechanicBroadcastTests(TransactionTestCase):
    """Tests for MECHANIC_STATUS_CHANGED event broadcasting."""

    def setUp(self):
        self.mechanic = Mechanic.objects.create(
            first_name="Ganesh", last_name="Pillai",
            email="ganesh.pillai@instantmechanic.in",
            phone="+91 98765 33333",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.60"),
            total_jobs_completed=22
        )

    async def test_mechanic_status_broadcast(self):
        """MECHANIC_STATUS_CHANGED event is received after broadcast."""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.receive_json_from(timeout=2)  # ACK

        await sync_to_async(broadcast_mechanic_status_changed)(self.mechanic)

        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response['type'], 'MECHANIC_STATUS_CHANGED')
        self.assertEqual(response['payload']['mechanic_id'], self.mechanic.id)
        self.assertEqual(response['payload']['full_name'], 'Ganesh Pillai')
        self.assertEqual(response['payload']['status'], 'AVAILABLE')

        await communicator.disconnect()


@override_settings(CHANNEL_LAYERS=TEST_CHANNEL_LAYERS)
class TransactionOnCommitTests(TransactionTestCase):
    """
    Tests that transaction.on_commit() correctly suppresses broadcasts
    when the transaction rolls back.
    """

    def setUp(self):
        self.customer = Customer.objects.create(
            first_name="Anita", last_name="Desai",
            email="anita.desai@example.com",
            phone="+91 98765 44444", city="Delhi"
        )
        self.vehicle = Vehicle.objects.create(
            customer=self.customer, make="Hyundai", model="i20",
            year=2024, license_plate="DL 01 ZZ 9999", mileage=5000
        )
        self.category = ServiceCategory.objects.create(
            name="Brakes", slug="brakes"
        )
        self.service = Service.objects.create(
            category=self.category, name="Brake Pad Replacement",
            base_price=Decimal("3499.00"),
            estimated_duration_minutes=90
        )
        self.mechanic = Mechanic.objects.create(
            first_name="Vikram", last_name="Singh",
            email="vikram.singh@instantmechanic.in",
            phone="+91 98765 55555",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.70"),
            total_jobs_completed=60
        )
        self.booking = Booking.objects.create(
            reference_code="IM-260901-99002",
            customer=self.customer, vehicle=self.vehicle,
            service=self.service, status=Booking.Status.PENDING,
            scheduled_at=timezone.now(),
            base_price=Decimal("3499.00"),
            total_amount=Decimal("3499.00")
        )

    async def test_no_broadcast_on_rollback(self):
        """
        When an invalid transition causes a rollback, no BOOKING_UPDATED
        event should be broadcast to connected clients.
        """
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            '/ws/dashboard/'
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.receive_json_from(timeout=2)  # ACK

        # Attempt an invalid transition: PENDING -> COMPLETED (skips ASSIGNED)
        # This should raise BookingTransitionError and NOT broadcast
        def attempt_invalid_transition():
            try:
                BookingService.transition_status(
                    booking=self.booking,
                    new_status=Booking.Status.COMPLETED,
                    changed_by="Test",
                    notes="Invalid skip"
                )
            except BookingTransitionError:
                pass  # Expected

        await sync_to_async(attempt_invalid_transition)()

        # No broadcast should arrive — verify nothing is received
        nothing = await communicator.receive_nothing(timeout=1)
        self.assertTrue(nothing, "Expected no broadcast after a rolled-back transaction")

        # Verify booking is still PENDING in the database
        await sync_to_async(self.booking.refresh_from_db)()
        self.assertEqual(self.booking.status, Booking.Status.PENDING)

        await communicator.disconnect()
