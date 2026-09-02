from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Mechanic
from .serializers import (
    MechanicListSerializer,
    MechanicDetailSerializer,
    MechanicStatusUpdateSerializer
)
from apps.realtime.events import broadcast_mechanic_status_changed

@extend_schema(tags=['Mechanics'])
class MechanicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints for listing, searching, filtering, and updating field mechanics.
    """
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'specialization']
    ordering_fields = ['rating', 'total_jobs_completed', 'experience_years', 'first_name', 'created_at']
    ordering = ['-rating', '-total_jobs_completed']

    def get_queryset(self):
        queryset = Mechanic.objects.all().prefetch_related('bookings')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MechanicDetailSerializer
        if self.action == 'status_update':
            return MechanicStatusUpdateSerializer
        return MechanicListSerializer

    @extend_schema(
        request=MechanicStatusUpdateSerializer,
        responses={200: MechanicDetailSerializer},
        description="Update mechanic operational availability status (AVAILABLE, BUSY, ON_TRIP, OFFLINE)"
    )
    @action(detail=True, methods=['patch'], url_path='status')
    def status_update(self, request, pk=None):
        mechanic = self.get_object()
        serializer = MechanicStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        mechanic.status = new_status
        mechanic.save(update_fields=['status'])

        # Broadcast mechanic status change after save
        # Using on_commit even though there's no explicit @transaction.atomic here,
        # because Django wraps each request in autocommit — on_commit fires immediately
        # after the save() completes in autocommit mode.
        transaction.on_commit(lambda: broadcast_mechanic_status_changed(mechanic))

        return Response(
            MechanicDetailSerializer(mechanic).data,
            status=status.HTTP_200_OK
        )
