from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from apps.mechanics.models import Mechanic
from .models import Booking
from .serializers import (
    BookingListSerializer,
    BookingDetailSerializer,
    BookingStatusUpdateSerializer,
    BookingAssignMechanicSerializer,
)
from .services import BookingService, BookingTransitionError

@extend_schema(tags=['Bookings'])
class BookingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints for querying, filtering, and updating vehicle service bookings.
    All listing operations use optimized server-side pagination, searching, sorting, and joins.
    """
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [
        'reference_code',
        'customer__first_name',
        'customer__last_name',
        'customer__email',
        'customer__phone',
        'vehicle__license_plate',
        'vehicle__make',
        'vehicle__model',
    ]
    ordering_fields = [
        'scheduled_at',
        'created_at',
        'total_amount',
        'status',
        'customer__first_name',
    ]
    ordering = ['-scheduled_at']

    def get_queryset(self):
        queryset = (
            Booking.objects
            .select_related(
                'customer',
                'vehicle',
                'service',
                'service__category',
                'mechanic'
            )
            .prefetch_related('status_history')
        )

        params = self.request.query_params

        # Filter by status
        status_param = params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        # Filter by mechanic ID
        mechanic_param = params.get('mechanic') or params.get('mechanic_id')
        if mechanic_param:
            queryset = queryset.filter(mechanic_id=mechanic_param)

        # Filter by service ID
        service_param = params.get('service') or params.get('service_id')
        if service_param:
            queryset = queryset.filter(service_id=service_param)

        # Filter by category slug or ID
        category_param = params.get('category')
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(service__category_id=int(category_param))
            else:
                queryset = queryset.filter(service__category__slug=category_param)

        # Filter by scheduled date range
        start_date = params.get('start_date')
        if start_date:
            queryset = queryset.filter(scheduled_at__date__gte=start_date)

        end_date = params.get('end_date')
        if end_date:
            queryset = queryset.filter(scheduled_at__date__lte=end_date)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BookingDetailSerializer
        if self.action == 'update_status':
            return BookingStatusUpdateSerializer
        if self.action == 'assign_mechanic':
            return BookingAssignMechanicSerializer
        return BookingListSerializer

    @extend_schema(
        request=BookingStatusUpdateSerializer,
        responses={
            200: BookingDetailSerializer,
            400: OpenApiTypes.OBJECT
        },
        description="Transition a booking's status lifecycle with audit tracking and mechanic sync."
    )
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        serializer = BookingStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        changed_by = serializer.validated_data.get('changed_by', 'Operations Desk')

        try:
            updated_booking = BookingService.transition_status(
                booking=booking,
                new_status=new_status,
                changed_by=changed_by,
                notes=notes
            )
            return Response(
                BookingDetailSerializer(updated_booking).data,
                status=status.HTTP_200_OK
            )
        except BookingTransitionError as exc:
            return Response(
                {
                    "error": "INVALID_STATUS_TRANSITION",
                    "detail": str(exc),
                    "current_status": booking.status,
                    "attempted_status": new_status,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        request=BookingAssignMechanicSerializer,
        responses={
            200: BookingDetailSerializer,
            400: OpenApiTypes.OBJECT
        },
        description="Assign a field mechanic to a booking and advance status to ASSIGNED."
    )
    @action(detail=True, methods=['patch'], url_path='assign-mechanic')
    def assign_mechanic(self, request, pk=None):
        booking = self.get_object()
        serializer = BookingAssignMechanicSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mechanic_id = serializer.validated_data['mechanic_id']
        notes = serializer.validated_data.get('notes', '')
        changed_by = serializer.validated_data.get('changed_by', 'Operations Dispatch')

        try:
            mechanic = Mechanic.objects.get(pk=mechanic_id)
        except Mechanic.DoesNotExist:
            return Response(
                {"error": "NOT_FOUND", "detail": f"Mechanic with ID {mechanic_id} not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            updated_booking = BookingService.assign_mechanic(
                booking=booking,
                mechanic=mechanic,
                changed_by=changed_by,
                notes=notes
            )
            return Response(
                BookingDetailSerializer(updated_booking).data,
                status=status.HTTP_200_OK
            )
        except BookingTransitionError as exc:
            return Response(
                {
                    "error": "ASSIGNMENT_ERROR",
                    "detail": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST
            )
