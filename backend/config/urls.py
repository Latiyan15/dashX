"""
Root URL Configuration for DashX Vehicle Service Operations API.
All operational endpoints are grouped under /api/v1/ with automated Swagger/OpenAPI documentation.
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1 Endpoints
    path('api/v1/', include('apps.analytics.urls')),
    path('api/v1/', include('apps.bookings.urls')),
    path('api/v1/', include('apps.mechanics.urls')),
    path('api/v1/', include('apps.customers.urls')),
    path('api/v1/', include('apps.services.urls')),

    # OpenAPI 3.0 Schema & Interactive Swagger UI
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
