from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.customers.models import Customer, Vehicle
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking

class CustomerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create(
            first_name="Amit",
            last_name="Patel",
            email="amit.patel@example.com",
            phone="+91 98989 12345",
            city="Ahmedabad"
        )
        self.vehicle1 = Vehicle.objects.create(
            customer=self.customer,
            make="Maruti Suzuki",
            model="Swift",
            year=2021,
            license_plate="GJ 01 XX 1234"
        )
        self.vehicle2 = Vehicle.objects.create(
            customer=self.customer,
            make="Toyota",
            model="Fortuner",
            year=2023,
            license_plate="GJ 01 YY 5678"
        )
        self.cat = ServiceCategory.objects.create(name="Oil", slug="oil")
        self.svc = Service.objects.create(category=self.cat, name="Oil Service", base_price=Decimal("2000.00"))
        self.booking = Booking.objects.create(
            reference_code="IM-CUST-1",
            customer=self.customer,
            vehicle=self.vehicle1,
            service=self.svc,
            status=Booking.Status.COMPLETED,
            scheduled_at=timezone.now(),
            base_price=Decimal("2000.00"),
            total_amount=Decimal("2000.00")
        )

    def test_customer_list_metrics(self):
        response = self.client.get('/api/v1/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cust_data = response.data['results'][0]
        self.assertEqual(cust_data['vehicle_count'], 2)
        self.assertEqual(cust_data['booking_count'], 1)
        self.assertEqual(Decimal(str(cust_data['total_spend'])), Decimal("2000.00"))

    def test_customer_search(self):
        response = self.client.get('/api/v1/customers/?search=Amit')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_customer_detail(self):
        response = self.client.get(f'/api/v1/customers/{self.customer.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['vehicles']), 2)
        self.assertEqual(len(response.data['recent_bookings']), 1)
