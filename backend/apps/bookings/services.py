"""
Business logic service for Bookings management.
Handles explicit state transitions, transaction atomicity, audit history, and mechanic state sync.
Avoids implicit Django signals for core business workflows to maintain interview clarity and deterministic execution.

After a successful transaction commit, broadcasts real-time events to connected
dashboard clients via the channel layer (transaction.on_commit ensures no stale
events are sent for rolled-back transactions).
"""

from django.db import transaction
from django.utils import timezone
from apps.bookings.models import Booking, BookingStatusHistory
from apps.mechanics.models import Mechanic
from apps.realtime.events import (
    broadcast_booking_updated,
    broadcast_mechanic_status_changed,
    broadcast_metrics_updated,
)

class BookingTransitionError(Exception):
    """Raised when an invalid status transition is attempted."""
    pass


class BookingService:
    """
    Encapsulates all booking state mutations and business rules.
    """

    # Defined valid status graph
    VALID_TRANSITIONS = {
        Booking.Status.PENDING: [
            Booking.Status.ASSIGNED,
            Booking.Status.CANCELLED
        ],
        Booking.Status.ASSIGNED: [
            Booking.Status.ON_THE_WAY,
            Booking.Status.IN_PROGRESS,
            Booking.Status.CANCELLED
        ],
        Booking.Status.ON_THE_WAY: [
            Booking.Status.IN_PROGRESS,
            Booking.Status.CANCELLED
        ],
        Booking.Status.IN_PROGRESS: [
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED
        ],
        Booking.Status.COMPLETED: [],  # Terminal state
        Booking.Status.CANCELLED: [],  # Terminal state
    }

    @classmethod
    @transaction.atomic
    def transition_status(
        cls,
        booking: Booking,
        new_status: str,
        changed_by: str = "Operations Staff",
        notes: str = "",
        mechanic: Mechanic = None
    ) -> Booking:
        """
        Atomically transitions a booking's lifecycle state, records audit history,
        and synchronizes associated mechanic availability.

        After successful commit, broadcasts BOOKING_UPDATED and METRICS_UPDATED
        events to the ops_dashboard channel group via transaction.on_commit().
        """
        old_status = booking.status

        # Validate transition if not already in that status
        if old_status != new_status:
            allowed_next_states = cls.VALID_TRANSITIONS.get(old_status, [])
            if new_status not in allowed_next_states:
                raise BookingTransitionError(
                    f"Invalid status transition from '{old_status}' to '{new_status}'. "
                    f"Allowed transitions from '{old_status}': {allowed_next_states if allowed_next_states else 'None (Terminal state)'}."
                )

        # Update mechanic assignment if provided
        if mechanic:
            # If there was a previously assigned different mechanic, free them if needed
            if booking.mechanic and booking.mechanic != mechanic:
                old_mech = booking.mechanic
                old_mech.status = Mechanic.Status.AVAILABLE
                old_mech.save(update_fields=['status'])

            booking.mechanic = mechanic

        # Update booking status
        booking.status = new_status
        if new_status == Booking.Status.COMPLETED and not booking.completed_at:
            booking.completed_at = timezone.now()

        booking.save()

        # Record immutable audit history
        BookingStatusHistory.objects.create(
            booking=booking,
            from_status=old_status if old_status != new_status else None,
            to_status=new_status,
            changed_by=changed_by,
            notes=notes
        )

        # Synchronize Mechanic state
        if booking.mechanic:
            assigned_mechanic = booking.mechanic
            if new_status == Booking.Status.ASSIGNED:
                assigned_mechanic.status = Mechanic.Status.BUSY
                assigned_mechanic.save(update_fields=['status'])
            elif new_status == Booking.Status.ON_THE_WAY:
                assigned_mechanic.status = Mechanic.Status.ON_TRIP
                assigned_mechanic.save(update_fields=['status'])
            elif new_status == Booking.Status.IN_PROGRESS:
                assigned_mechanic.status = Mechanic.Status.BUSY
                assigned_mechanic.save(update_fields=['status'])
            elif new_status == Booking.Status.COMPLETED:
                assigned_mechanic.status = Mechanic.Status.AVAILABLE
                assigned_mechanic.total_jobs_completed += 1
                assigned_mechanic.save(update_fields=['status', 'total_jobs_completed'])
            elif new_status == Booking.Status.CANCELLED:
                assigned_mechanic.status = Mechanic.Status.AVAILABLE
                assigned_mechanic.save(update_fields=['status'])

        # ── Real-time broadcasting (only after successful commit) ──────
        # transaction.on_commit() ensures these callbacks execute ONLY when
        # the outermost @transaction.atomic block commits successfully.
        # If the transaction rolls back, the callbacks are silently discarded.
        transaction.on_commit(lambda: broadcast_booking_updated(booking))
        transaction.on_commit(lambda: broadcast_metrics_updated())

        # If mechanic status changed, broadcast that too
        if booking.mechanic and old_status != new_status:
            mechanic_ref = booking.mechanic
            transaction.on_commit(lambda: broadcast_mechanic_status_changed(mechanic_ref))

        return booking

    @classmethod
    @transaction.atomic
    def assign_mechanic(
        cls,
        booking: Booking,
        mechanic: Mechanic,
        changed_by: str = "Operations Staff",
        notes: str = ""
    ) -> Booking:
        """
        Assigns a mechanic to a booking and advances status to ASSIGNED if currently PENDING.
        """
        old_status = booking.status
        target_status = Booking.Status.ASSIGNED if old_status == Booking.Status.PENDING else old_status

        notes_str = f"Assigned to {mechanic.full_name}. {notes}".strip()
        return cls.transition_status(
            booking=booking,
            new_status=target_status,
            changed_by=changed_by,
            notes=notes_str,
            mechanic=mechanic
        )
