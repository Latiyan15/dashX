from decimal import Decimal
from django.db.models import Count, Sum, Q, Value, DecimalField, OuterRef, Subquery, IntegerField
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema
from apps.bookings.models import Booking
from apps.customers.models import Customer, Vehicle
from .serializers import CustomerListSerializer, CustomerDetailSerializer

@extend_schema(tags=['Customers'])
class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve customer profiles with real-time aggregated metrics (vehicles, bookings, total spend).
    Uses subqueries to avoid Cartesian product duplication across multiple 1:N relations.
    """
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'city']
    ordering_fields = ['created_at', 'first_name', 'vehicle_count', 'booking_count', 'total_spend']
    ordering = ['-created_at']

    def get_queryset(self):
        spend_subquery = (
            Booking.objects
            .filter(customer=OuterRef('pk'), status=Booking.Status.COMPLETED)
            .values('customer')
            .annotate(total=Sum('total_amount'))
            .values('total')
        )

        booking_count_subquery = (
            Booking.objects
            .filter(customer=OuterRef('pk'))
            .values('customer')
            .annotate(cnt=Count('id'))
            .values('cnt')
        )

        vehicle_count_subquery = (
            Vehicle.objects
            .filter(customer=OuterRef('pk'))
            .values('customer')
            .annotate(cnt=Count('id'))
            .values('cnt')
        )

        return (
            Customer.objects
            .annotate(
                vehicle_count=Coalesce(Subquery(vehicle_count_subquery, output_field=IntegerField()), Value(0)),
                booking_count=Coalesce(Subquery(booking_count_subquery, output_field=IntegerField()), Value(0)),
                total_spend=Coalesce(
                    Subquery(spend_subquery, output_field=DecimalField(max_digits=12, decimal_places=2)),
                    Value(Decimal('0.00')),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            )
            .prefetch_related('vehicles')
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerListSerializer
