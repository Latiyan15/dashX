from rest_framework import serializers
from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import Service, ServiceCategory
from .models import Booking, BookingStatusHistory

class BookingStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by',
            'notes',
            'created_at',
        ]


class BookingCustomerCompactSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'city']


class BookingVehicleCompactSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Vehicle
        fields = ['id', 'make', 'model', 'year', 'license_plate', 'fuel_type', 'mileage', 'display_name']


class BookingServiceCompactSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'name', 'category_name', 'category_slug', 'base_price', 'estimated_duration_minutes']


class BookingMechanicCompactSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Mechanic
        fields = ['id', 'first_name', 'last_name', 'full_name', 'phone', 'rating', 'status', 'avatar_url', 'specialization']


class BookingListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer = BookingCustomerCompactSerializer(read_only=True)
    vehicle = BookingVehicleCompactSerializer(read_only=True)
    service = BookingServiceCompactSerializer(read_only=True)
    mechanic = BookingMechanicCompactSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'reference_code',
            'customer',
            'vehicle',
            'service',
            'mechanic',
            'status',
            'status_display',
            'scheduled_at',
            'completed_at',
            'base_price',
            'additional_charges',
            'total_amount',
            'service_location',
            'created_at',
        ]


class BookingDetailSerializer(BookingListSerializer):
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)

    class Meta(BookingListSerializer.Meta):
        fields = BookingListSerializer.Meta.fields + [
            'customer_notes',
            'mechanic_notes',
            'status_history',
            'updated_at',
        ]


class BookingStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Booking.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    changed_by = serializers.CharField(required=False, allow_blank=True, default='Operations Desk')


class BookingAssignMechanicSerializer(serializers.Serializer):
    mechanic_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    changed_by = serializers.CharField(required=False, allow_blank=True, default='Operations Dispatch')
