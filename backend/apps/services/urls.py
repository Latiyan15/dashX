from django.urls import path
from .views import ServiceCategoryListView, ServiceListView

urlpatterns = [
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('service-categories/', ServiceCategoryListView.as_view(), name='service-category-list'),
]
