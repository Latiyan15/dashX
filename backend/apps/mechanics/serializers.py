from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Mechanic

class ActiveBookingCompactSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reference_code = serializers.CharField()
    customer_name = serializers.CharField(source='customer.full_name')
    vehicle_info = serializers.CharField(source='vehicle.display_name')
    license_plate = serializers.CharField(source='vehicle.license_plate')
    service_name = serializers.CharField(source='service.name')
    status = serializers.CharField()
    scheduled_at = serializers.DateTimeField()


class MechanicListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    active_booking = serializers.SerializerMethodField()

    class Meta:
        model = Mechanic
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'status',
            'status_display',
            'rating',
            'total_jobs_completed',
            'specialization',
            'avatar_url',
            'experience_years',
            'current_latitude',
            'current_longitude',
            'active_booking',
            'created_at',
        ]

    @extend_schema_field(ActiveBookingCompactSerializer(allow_null=True))
    def get_active_booking(self, obj):
        # Return first active non-terminal booking if exists
        active = (
            obj.bookings
            .filter(status__in=['ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS'])
            .select_related('customer', 'vehicle', 'service')
            .order_by('-scheduled_at')
            .first()
        )
        if active:
            return ActiveBookingCompactSerializer(active).data
        return None


class MechanicDetailSerializer(MechanicListSerializer):
    booking_history = serializers.SerializerMethodField()

    class Meta(MechanicListSerializer.Meta):
        fields = MechanicListSerializer.Meta.fields + ['booking_history']

    @extend_schema_field(ActiveBookingCompactSerializer(many=True))
    def get_booking_history(self, obj):
        history = (
            obj.bookings
            .select_related('customer', 'vehicle', 'service')
            .order_by('-scheduled_at')[:10]
        )
        return ActiveBookingCompactSerializer(history, many=True).data


class MechanicStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Mechanic.Status.choices)
