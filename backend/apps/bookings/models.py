from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel
from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import Service

class Booking(TimeStampedModel):
    """
    Central vehicle service booking entity connecting customer, vehicle, service, and mechanic.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ASSIGNED = 'ASSIGNED', 'Assigned'
        ON_THE_WAY = 'ON_THE_WAY', 'Mechanic On The Way'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    reference_code = models.CharField(
        max_length=25,
        unique=True,
        db_index=True,
        help_text="Human-readable booking reference e.g., IM-260901-00140"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='bookings',
        db_index=True
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name='bookings',
        db_index=True
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='bookings',
        db_index=True
    )
    mechanic = models.ForeignKey(
        Mechanic,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings',
        db_index=True
    )
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    scheduled_at = models.DateTimeField(
        db_index=True,
        help_text="Scheduled service date and time"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when job was marked completed"
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Standard service catalog price in INR"
    )
    additional_charges = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Extra parts/labor added during service in INR"
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        db_index=True,
        help_text="Total billable amount in INR"
    )
    service_location = models.CharField(
        max_length=255,
        default="Gurugram Central Service Bay",
        help_text="Customer address or workshop location"
    )
    customer_notes = models.TextField(blank=True, help_text="Special requests by customer")
    mechanic_notes = models.TextField(blank=True, help_text="Inspection diagnosis and notes")

    class Meta:
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['reference_code']),
            models.Index(fields=['status', 'scheduled_at']),
            models.Index(fields=['created_at', 'total_amount']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['mechanic', 'status']),
        ]

    def __str__(self):
        return f"{self.reference_code} - {self.customer.full_name} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        # Auto compute total amount if not explicitly set
        if self.base_price is not None:
            self.total_amount = self.base_price + (self.additional_charges or 0)
        super().save(*args, **kwargs)


class BookingStatusHistory(models.Model):
    """
    Immutable audit trail for all booking status changes and state transitions.
    """
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='status_history',
        db_index=True
    )
    from_status = models.CharField(max_length=30, null=True, blank=True)
    to_status = models.CharField(max_length=30, db_index=True)
    changed_by = models.CharField(
        max_length=100,
        default="Operations Desk",
        help_text="User, Role or System actor performing the state change"
    )
    notes = models.TextField(blank=True, help_text="Optional remarks for transition")
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['created_at', 'id']
        verbose_name_plural = "Booking Status Histories"
        indexes = [
            models.Index(fields=['booking', 'created_at']),
            models.Index(fields=['to_status']),
        ]

    def __str__(self):
        return f"{self.booking.reference_code}: {self.from_status} -> {self.to_status} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
