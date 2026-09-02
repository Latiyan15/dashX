from rest_framework import generics
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import ServiceCategory, Service
from .serializers import ServiceCategorySerializer, ServiceSerializer

@extend_schema(tags=['Services'])
class ServiceCategoryListView(generics.ListAPIView):
    """
    List all active automotive service categories with embedded service lists.
    """
    serializer_class = ServiceCategorySerializer
    pagination_class = None  # Return all active categories for UI filters

    def get_queryset(self):
        return (
            ServiceCategory.objects
            .filter(is_active=True)
            .annotate(services_count=Count('services'))
            .prefetch_related('services')
            .order_by('name')
        )


@extend_schema(
    tags=['Services'],
    parameters=[
        OpenApiParameter(name='category', type=int, description='Filter by category ID'),
        OpenApiParameter(name='category_slug', type=str, description='Filter by category slug'),
        OpenApiParameter(name='search', type=str, description='Search service name or description'),
    ]
)
class ServiceListView(generics.ListAPIView):
    """
    List all individual service catalog offerings with category metadata.
    """
    serializer_class = ServiceSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['base_price', 'name', 'estimated_duration_minutes', 'created_at']
    ordering = ['category', 'base_price']
    pagination_class = None

    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True).select_related('category')
        category_id = self.request.query_params.get('category')
        category_slug = self.request.query_params.get('category_slug')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset
