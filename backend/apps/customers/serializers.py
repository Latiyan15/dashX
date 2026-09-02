from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Customer, Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)
    fuel_type_display = serializers.CharField(source='get_fuel_type_display', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'make',
            'model',
            'year',
            'license_plate',
            'vin',
            'fuel_type',
            'fuel_type_display',
            'mileage',
            'display_name',
            'created_at',
        ]


class CustomerBookingSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reference_code = serializers.CharField()
    service_name = serializers.CharField(source='service.name')
    vehicle_info = serializers.CharField(source='vehicle.display_name')
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    scheduled_at = serializers.DateTimeField()


class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    vehicle_count = serializers.IntegerField(read_only=True, default=0)
    booking_count = serializers.IntegerField(read_only=True, default=0)
    total_spend = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=0.00)

    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'address',
            'city',
            'postal_code',
            'vehicle_count',
            'booking_count',
            'total_spend',
            'created_at',
        ]


class CustomerDetailSerializer(CustomerListSerializer):
    vehicles = VehicleSerializer(many=True, read_only=True)
    recent_bookings = serializers.SerializerMethodField()

    class Meta(CustomerListSerializer.Meta):
        fields = CustomerListSerializer.Meta.fields + ['vehicles', 'recent_bookings']

    @extend_schema_field(CustomerBookingSummarySerializer(many=True))
    def get_recent_bookings(self, obj):
        bookings = (
            obj.bookings
            .select_related('service', 'vehicle')
            .order_by('-scheduled_at')[:10]
        )
        return CustomerBookingSummarySerializer(bookings, many=True).data
