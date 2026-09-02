from django.db import models
from apps.core.models import TimeStampedModel

class Mechanic(TimeStampedModel):
    """
    Certified service engineers and field mechanics deployed on service requests.
    """
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        BUSY = 'BUSY', 'Busy / In Service'
        ON_TRIP = 'ON_TRIP', 'On The Way'
        OFFLINE = 'OFFLINE', 'Offline'

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    phone = models.CharField(max_length=30, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=4.80,
        help_text="Customer satisfaction rating out of 5.00"
    )
    total_jobs_completed = models.PositiveIntegerField(
        default=0,
        db_index=True,
        help_text="Total verified completed service bookings"
    )
    specialization = models.CharField(
        max_length=120,
        default="General Maintenance & Diagnostics",
        help_text="Primary technical specialty"
    )
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    experience_years = models.PositiveIntegerField(default=4)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        ordering = ['-rating', '-total_jobs_completed']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['rating']),
            models.Index(fields=['total_jobs_completed']),
            models.Index(fields=['first_name', 'last_name']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_status_display()})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_available(self):
        return self.status == self.Status.AVAILABLE
