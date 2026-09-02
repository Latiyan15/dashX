from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.services.models import ServiceCategory, Service

class ServiceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = ServiceCategory.objects.create(
            name="Periodic Maintenance",
            slug="periodic-maintenance",
            icon="Wrench"
        )
        self.service = Service.objects.create(
            category=self.category,
            name="Engine Oil Flush",
            base_price=Decimal("1999.00"),
            estimated_duration_minutes=45
        )

    def test_service_category_list(self):
        response = self.client.get('/api/v1/service-categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['slug'], "periodic-maintenance")
        self.assertEqual(response.data[0]['services_count'], 1)

    def test_service_list_and_filter(self):
        response = self.client.get('/api/v1/services/?category_slug=periodic-maintenance')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Engine Oil Flush")
