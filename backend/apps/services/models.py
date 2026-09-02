from django.db import models
from apps.core.models import TimeStampedModel

class ServiceCategory(TimeStampedModel):
    """
    Broad automotive service classification categories.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=60, default='Wrench', help_text="Lucide icon identifier")
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name_plural = "Service Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class Service(TimeStampedModel):
    """
    Individual service offerings catalog with standardized Indian pricing.
    """
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.PROTECT,
        related_name='services',
        db_index=True
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Standard base price in INR (₹)"
    )
    estimated_duration_minutes = models.PositiveIntegerField(
        default=60,
        help_text="Estimated turnaround duration in minutes"
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ['category', 'base_price']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['base_price']),
        ]

    def __str__(self):
        return f"{self.name} (₹{self.base_price})"
