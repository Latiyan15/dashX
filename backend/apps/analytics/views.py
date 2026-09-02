from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q, Value, DecimalField
from django.db.models.functions import Coalesce, TruncDate
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from apps.bookings.models import Booking
from apps.mechanics.models import Mechanic
from apps.customers.models import Customer
from apps.services.models import ServiceCategory, Service
from .serializers import (
    AnalyticsOverviewSerializer,
    BookingsOverTimeItemSerializer,
    RevenueOverTimeItemSerializer,
    StatusDistributionItemSerializer,
    ServiceBreakdownSerializer,
)

@extend_schema(tags=['Analytics'], responses={200: AnalyticsOverviewSerializer})
class AnalyticsOverviewView(APIView):
    """
    Returns high-level operational KPIs and real-time dashboard snapshot.
    Calculated via a single high-performance conditional SQL aggregation.
    """
    def get(self, request):
        now = timezone.now()
        today = now.date()
        start_of_month = today.replace(day=1)

        # High-performance conditional aggregation on Bookings
        booking_stats = Booking.objects.aggregate(
            total_bookings=Count('id'),
            today_bookings=Count('id', filter=Q(scheduled_at__date=today)),
            completed_bookings=Count('id', filter=Q(status=Booking.Status.COMPLETED)),
            pending_bookings=Count('id', filter=Q(status=Booking.Status.PENDING)),
            assigned_bookings=Count('id', filter=Q(status=Booking.Status.ASSIGNED)),
            on_the_way_bookings=Count('id', filter=Q(status=Booking.Status.ON_THE_WAY)),
            in_progress_bookings=Count('id', filter=Q(status=Booking.Status.IN_PROGRESS)),
            cancelled_bookings=Count('id', filter=Q(status=Booking.Status.CANCELLED)),
            total_revenue=Coalesce(
                Sum('total_amount', filter=Q(status=Booking.Status.COMPLETED)),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            today_revenue=Coalesce(
                Sum('total_amount', filter=Q(status=Booking.Status.COMPLETED, scheduled_at__date=today)),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
            avg_ticket_size=Coalesce(
                Avg('total_amount', filter=Q(status=Booking.Status.COMPLETED)),
                Value(Decimal('0.00')),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            ),
        )

        # Mechanic operational counts
        mech_stats = Mechanic.objects.aggregate(
            total_mechanics=Count('id'),
            active_mechanics=Count('id', filter=Q(status__in=[Mechanic.Status.AVAILABLE, Mechanic.Status.BUSY, Mechanic.Status.ON_TRIP])),
            available_mechanics=Count('id', filter=Q(status=Mechanic.Status.AVAILABLE)),
            busy_mechanics=Count('id', filter=Q(status__in=[Mechanic.Status.BUSY, Mechanic.Status.ON_TRIP])),
        )

        # Customer acquisition count
        new_customers_this_month = Customer.objects.filter(created_at__date__gte=start_of_month).count()

        response_data = {
            "total_bookings": booking_stats["total_bookings"],
            "today_bookings": booking_stats["today_bookings"],
            "completed_bookings": booking_stats["completed_bookings"],
            "pending_bookings": booking_stats["pending_bookings"],
            "assigned_bookings": booking_stats["assigned_bookings"],
            "on_the_way_bookings": booking_stats["on_the_way_bookings"],
            "in_progress_bookings": booking_stats["in_progress_bookings"],
            "cancelled_bookings": booking_stats["cancelled_bookings"],
            "total_revenue": booking_stats["total_revenue"],
            "today_revenue": booking_stats["today_revenue"],
            "avg_ticket_size": booking_stats["avg_ticket_size"],
            "total_mechanics": mech_stats["total_mechanics"],
            "active_mechanics": mech_stats["active_mechanics"],
            "available_mechanics": mech_stats["available_mechanics"],
            "busy_mechanics": mech_stats["busy_mechanics"],
            "new_customers_this_month": new_customers_this_month,
        }

        return Response(response_data)


@extend_schema(
    tags=['Analytics'],
    parameters=[
        OpenApiParameter(name='days', type=int, description='Number of past days to aggregate (default 30)'),
        OpenApiParameter(name='start_date', type=str, description='Start date YYYY-MM-DD'),
        OpenApiParameter(name='end_date', type=str, description='End date YYYY-MM-DD'),
    ],
    responses={200: BookingsOverTimeItemSerializer(many=True)}
)
class BookingsOverTimeView(APIView):
    """
    Returns daily booking volume breakdown (total, completed, cancelled, in progress) for trend charts.
    """
    def get(self, request):
        now = timezone.now()
        days = int(request.query_params.get('days', 30))
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        qs = Booking.objects.all()
        if start_date and end_date:
            qs = qs.filter(scheduled_at__date__gte=start_date, scheduled_at__date__lte=end_date)
        else:
            cutoff = (now - timedelta(days=days)).date()
            qs = qs.filter(scheduled_at__date__gte=cutoff)

        daily_data = (
            qs
            .annotate(date=TruncDate('scheduled_at'))
            .values('date')
            .annotate(
                total_bookings=Count('id'),
                completed=Count('id', filter=Q(status=Booking.Status.COMPLETED)),
                in_progress=Count('id', filter=Q(status__in=[Booking.Status.IN_PROGRESS, Booking.Status.ON_THE_WAY, Booking.Status.ASSIGNED])),
                pending=Count('id', filter=Q(status=Booking.Status.PENDING)),
                cancelled=Count('id', filter=Q(status=Booking.Status.CANCELLED)),
            )
            .order_by('date')
        )

        return Response(list(daily_data))


@extend_schema(
    tags=['Analytics'],
    parameters=[
        OpenApiParameter(name='days', type=int, description='Number of past days to aggregate (default 30)'),
        OpenApiParameter(name='start_date', type=str, description='Start date YYYY-MM-DD'),
        OpenApiParameter(name='end_date', type=str, description='End date YYYY-MM-DD'),
    ],
    responses={200: RevenueOverTimeItemSerializer(many=True)}
)
class RevenueOverTimeView(APIView):
    """
    Returns daily completed booking revenue and job volume for financial charts.
    """
    def get(self, request):
        now = timezone.now()
        days = int(request.query_params.get('days', 30))
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        qs = Booking.objects.filter(status=Booking.Status.COMPLETED)
        if start_date and end_date:
            qs = qs.filter(scheduled_at__date__gte=start_date, scheduled_at__date__lte=end_date)
        else:
            cutoff = (now - timedelta(days=days)).date()
            qs = qs.filter(scheduled_at__date__gte=cutoff)

        revenue_data = (
            qs
            .annotate(date=TruncDate('scheduled_at'))
            .values('date')
            .annotate(
                revenue=Coalesce(
                    Sum('total_amount'),
                    Value(Decimal('0.00')),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                ),
                completed_jobs=Count('id'),
                avg_ticket=Coalesce(
                    Avg('total_amount'),
                    Value(Decimal('0.00')),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            )
            .order_by('date')
        )

        return Response(list(revenue_data))


@extend_schema(tags=['Analytics'], responses={200: StatusDistributionItemSerializer(many=True)})
class StatusDistributionView(APIView):
    """
    Returns counts and calculated percentages of bookings grouped by current status.
    """
    def get(self, request):
        total_count = Booking.objects.count() or 1

        status_counts = (
            Booking.objects
            .values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        status_label_map = dict(Booking.Status.choices)
        result = []
        for item in status_counts:
            st = item['status']
            cnt = item['count']
            pct = round((cnt / total_count) * 100, 2)
            result.append({
                "status": st,
                "status_display": status_label_map.get(st, st),
                "count": cnt,
                "percentage": pct
            })

        return Response(result)


@extend_schema(tags=['Analytics'], responses={200: ServiceBreakdownSerializer})
class ServiceBreakdownView(APIView):
    """
    Returns volume and financial contributions categorized by service category and top service items.
    """
    def get(self, request):
        # Category breakdown
        category_data = (
            ServiceCategory.objects
            .annotate(
                booking_count=Count('services__bookings'),
                completed_booking_count=Count('services__bookings', filter=Q(services__bookings__status=Booking.Status.COMPLETED)),
                revenue=Coalesce(
                    Sum('services__bookings__total_amount', filter=Q(services__bookings__status=Booking.Status.COMPLETED)),
                    Value(Decimal('0.00')),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            )
            .values('id', 'name', 'slug', 'icon', 'booking_count', 'completed_booking_count', 'revenue')
            .order_by('-revenue')
        )

        # Top 8 most requested services
        top_services = (
            Service.objects
            .annotate(
                booking_count=Count('bookings'),
                revenue=Coalesce(
                    Sum('bookings__total_amount', filter=Q(bookings__status=Booking.Status.COMPLETED)),
                    Value(Decimal('0.00')),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            )
            .select_related('category')
            .values(
                'id',
                'name',
                'category__name',
                'base_price',
                'booking_count',
                'revenue'
            )
            .order_by('-booking_count')[:8]
        )

        return Response({
            "categories": list(category_data),
            "top_services": list(top_services)
        })
