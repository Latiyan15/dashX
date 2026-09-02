from django.urls import path
from .views import (
    AnalyticsOverviewView,
    BookingsOverTimeView,
    RevenueOverTimeView,
    StatusDistributionView,
    ServiceBreakdownView,
)

urlpatterns = [
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('analytics/bookings-over-time/', BookingsOverTimeView.as_view(), name='analytics-bookings-over-time'),
    path('analytics/revenue-over-time/', RevenueOverTimeView.as_view(), name='analytics-revenue-over-time'),
    path('analytics/status-distribution/', StatusDistributionView.as_view(), name='analytics-status-distribution'),
    path('analytics/service-breakdown/', ServiceBreakdownView.as_view(), name='analytics-service-breakdown'),
]
