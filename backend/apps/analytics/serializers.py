from rest_framework import serializers

class AnalyticsOverviewSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    today_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    assigned_bookings = serializers.IntegerField()
    on_the_way_bookings = serializers.IntegerField()
    in_progress_bookings = serializers.IntegerField()
    cancelled_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    avg_ticket_size = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_mechanics = serializers.IntegerField()
    active_mechanics = serializers.IntegerField()
    available_mechanics = serializers.IntegerField()
    busy_mechanics = serializers.IntegerField()
    new_customers_this_month = serializers.IntegerField()


class BookingsOverTimeItemSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_bookings = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    pending = serializers.IntegerField()
    cancelled = serializers.IntegerField()


class RevenueOverTimeItemSerializer(serializers.Serializer):
    date = serializers.DateField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    completed_jobs = serializers.IntegerField()
    avg_ticket = serializers.DecimalField(max_digits=12, decimal_places=2)


class StatusDistributionItemSerializer(serializers.Serializer):
    status = serializers.CharField()
    status_display = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class CategoryBreakdownItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    icon = serializers.CharField()
    booking_count = serializers.IntegerField()
    completed_booking_count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class TopServiceItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    category__name = serializers.CharField()
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    booking_count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class ServiceBreakdownSerializer(serializers.Serializer):
    categories = CategoryBreakdownItemSerializer(many=True)
    top_services = TopServiceItemSerializer(many=True)
