"""
WebSocket URL routing for the DashX real-time layer.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/dashboard/$', consumers.DashboardConsumer.as_asgi()),
]
