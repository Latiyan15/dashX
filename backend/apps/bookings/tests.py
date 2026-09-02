from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking, BookingStatusHistory
from apps.bookings.services import BookingService, BookingTransitionError

class BookingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.customer = Customer.objects.create(
            first_name="Rohan",
            last_name="Sharma",
            email="rohan.sharma@example.com",
            phone="+91 98765 43210",
            city="Gurugram"
        )
        self.vehicle = Vehicle.objects.create(
            customer=self.customer,
            make="Hyundai",
            model="Creta",
            year=2022,
            license_plate="KA 01 AB 9999",
            mileage=15000
        )
        self.category = ServiceCategory.objects.create(
            name="Periodic Maintenance",
            slug="periodic-maintenance"
        )
        self.service = Service.objects.create(
            category=self.category,
            name="Engine Oil Service",
            base_price=Decimal("2499.00"),
            estimated_duration_minutes=60
        )
        self.mechanic = Mechanic.objects.create(
            first_name="Ramesh",
            last_name="Kumar",
            email="ramesh.kumar@instantmechanic.in",
            phone="+91 99887 76655",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.90"),
            total_jobs_completed=50
        )
        self.booking = Booking.objects.create(
            reference_code="IM-TEST-1001",
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            status=Booking.Status.PENDING,
            scheduled_at=timezone.now(),
            base_price=Decimal("2499.00"),
            total_amount=Decimal("2499.00")
        )

    def test_booking_list_success(self):
        response = self.client.get('/api/v1/bookings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['reference_code'], "IM-TEST-1001")

    def test_booking_search(self):
        # Search by reference
        response = self.client.get('/api/v1/bookings/?search=IM-TEST-1001')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Search by license plate
        response = self.client.get('/api/v1/bookings/?search=KA 01 AB')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Non-matching search
        response = self.client.get('/api/v1/bookings/?search=NONEXISTENT')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_booking_filtering(self):
        # Filter by status
        response = self.client.get('/api/v1/bookings/?status=PENDING')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        response = self.client.get('/api/v1/bookings/?status=COMPLETED')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_booking_pagination(self):
        # Create additional bookings
        for i in range(25):
            Booking.objects.create(
                reference_code=f"IM-TEST-{2000+i}",
                customer=self.customer,
                vehicle=self.vehicle,
                service=self.service,
                status=Booking.Status.PENDING,
                scheduled_at=timezone.now(),
                base_price=Decimal("2499.00"),
                total_amount=Decimal("2499.00")
            )
        response = self.client.get('/api/v1/bookings/?page=1&page_size=10')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertEqual(response.data['count'], 26)

    def test_booking_detail(self):
        response = self.client.get(f'/api/v1/bookings/{self.booking.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['reference_code'], "IM-TEST-1001")
        self.assertEqual(response.data['customer']['full_name'], "Rohan Sharma")
        self.assertEqual(response.data['vehicle']['license_plate'], "KA 01 AB 9999")
        self.assertIn('status_history', response.data)

    def test_valid_status_transition(self):
        # Transition PENDING -> ASSIGNED
        response = self.client.patch(
            f'/api/v1/bookings/{self.booking.id}/status/',
            {"status": "ASSIGNED", "notes": "Dispatched to tech"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "ASSIGNED")

        # Check status history was created
        self.assertEqual(self.booking.status_history.count(), 1)
        history = self.booking.status_history.first()
        self.assertEqual(history.from_status, "PENDING")
        self.assertEqual(history.to_status, "ASSIGNED")

    def test_invalid_status_transition(self):
        # PENDING directly to COMPLETED is forbidden
        response = self.client.patch(
            f'/api/v1/bookings/{self.booking.id}/status/',
            {"status": "COMPLETED", "notes": "Skipping steps"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "INVALID_STATUS_TRANSITION")

        # Booking should still be PENDING in DB
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, Booking.Status.PENDING)

    def test_mechanic_assignment(self):
        response = self.client.patch(
            f'/api/v1/bookings/{self.booking.id}/assign-mechanic/',
            {"mechanic_id": self.mechanic.id, "notes": "Urgent assign"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "ASSIGNED")
        self.assertEqual(response.data['mechanic']['id'], self.mechanic.id)

        # Mechanic should now be BUSY
        self.mechanic.refresh_from_db()
        self.assertEqual(self.mechanic.status, Mechanic.Status.BUSY)
