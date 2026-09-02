from django.db import models
from apps.core.models import TimeStampedModel

class Customer(TimeStampedModel):
    """
    Vehicle owners registered in the operations management system.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    phone = models.CharField(max_length=30, db_index=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, default='Gurugram')
    postal_code = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['first_name', 'last_name']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Vehicle(TimeStampedModel):
    """
    Customer vehicles serviced by Instant Mechanic.
    """
    class FuelType(models.TextChoices):
        PETROL = 'PETROL', 'Petrol'
        DIESEL = 'DIESEL', 'Diesel'
        ELECTRIC = 'ELECTRIC', 'Electric'
        CNG = 'CNG', 'CNG'
        HYBRID = 'HYBRID', 'Hybrid'

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='vehicles',
        db_index=True
    )
    make = models.CharField(max_length=60, help_text="e.g., Maruti Suzuki, Hyundai, Tata")
    model = models.CharField(max_length=60, help_text="e.g., Swift, Creta, Nexon")
    year = models.PositiveIntegerField(help_text="Manufacturing year e.g., 2022")
    license_plate = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Registration format e.g. KA 01 MJ 5821"
    )
    vin = models.CharField(max_length=25, blank=True, null=True)
    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
        default=FuelType.PETROL
    )
    mileage = models.PositiveIntegerField(default=0, help_text="Odometer reading in km")

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['license_plate']),
            models.Index(fields=['make', 'model']),
        ]

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.license_plate})"

    @property
    def display_name(self):
        return f"{self.year} {self.make} {self.model}"
