from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking

class AnalyticsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        now = timezone.now()

        self.customer = Customer.objects.create(
            first_name="Priya",
            last_name="Nair",
            email="priya.nair@example.com",
            phone="+91 91234 56789",
            city="Gurugram"
        )
        self.vehicle = Vehicle.objects.create(
            customer=self.customer,
            make="Tata",
            model="Nexon",
            year=2023,
            license_plate="KA 03 MK 1111",
            mileage=8000
        )
        self.category = ServiceCategory.objects.create(
            name="Brake & Wheel Care",
            slug="brake-wheel-care"
        )
        self.service = Service.objects.create(
            category=self.category,
            name="Ceramic Brake Pad Service",
            base_price=Decimal("3000.00"),
            estimated_duration_minutes=60
        )
        self.mechanic = Mechanic.objects.create(
            first_name="Abdul",
            last_name="Khan",
            email="abdul.khan@instantmechanic.in",
            phone="+91 98888 77777",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.95"),
            total_jobs_completed=100
        )

        # Create 1 Completed booking and 1 Pending booking
        self.completed_booking = Booking.objects.create(
            reference_code="IM-AN-001",
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            mechanic=self.mechanic,
            status=Booking.Status.COMPLETED,
            scheduled_at=now,
            completed_at=now + timedelta(minutes=60),
            base_price=Decimal("3000.00"),
            total_amount=Decimal("3000.00")
        )
        self.pending_booking = Booking.objects.create(
            reference_code="IM-AN-002",
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            status=Booking.Status.PENDING,
            scheduled_at=now + timedelta(days=1),
            base_price=Decimal("3000.00"),
            total_amount=Decimal("3000.00")
        )

    def test_analytics_overview(self):
        response = self.client.get('/api/v1/analytics/overview/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['total_bookings'], 2)
        self.assertEqual(data['completed_bookings'], 1)
        self.assertEqual(data['pending_bookings'], 1)
        self.assertEqual(Decimal(str(data['total_revenue'])), Decimal("3000.00"))
        self.assertEqual(data['total_mechanics'], 1)
        self.assertEqual(data['active_mechanics'], 1)

    def test_revenue_over_time(self):
        response = self.client.get('/api/v1/analytics/revenue-over-time/?days=7')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(Decimal(str(response.data[0]['revenue'])), Decimal("3000.00"))

    def test_status_distribution(self):
        response = self.client.get('/api/v1/analytics/status-distribution/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        statuses = {item['status']: item['count'] for item in response.data}
        self.assertEqual(statuses.get('COMPLETED'), 1)
        self.assertEqual(statuses.get('PENDING'), 1)

    def test_service_breakdown(self):
        response = self.client.get('/api/v1/analytics/service-breakdown/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('categories', response.data)
        self.assertIn('top_services', response.data)
        self.assertEqual(response.data['categories'][0]['slug'], "brake-wheel-care")
