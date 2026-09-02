from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.mechanics.models import Mechanic

class MechanicAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.mechanic = Mechanic.objects.create(
            first_name="Jagdish",
            last_name="Sutar",
            email="jagdish.sutar@instantmechanic.in",
            phone="+91 91111 22222",
            status=Mechanic.Status.AVAILABLE,
            rating=Decimal("4.89"),
            total_jobs_completed=110,
            specialization="Electrical & Hybrid"
        )

    def test_mechanic_list(self):
        response = self.client.get('/api/v1/mechanics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['results'][0]['first_name'], "Jagdish")

    def test_mechanic_detail(self):
        response = self.client.get(f'/api/v1/mechanics/{self.mechanic.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "jagdish.sutar@instantmechanic.in")
        self.assertIn('booking_history', response.data)

    def test_mechanic_status_patch(self):
        response = self.client.patch(
            f'/api/v1/mechanics/{self.mechanic.id}/status/',
            {"status": "BUSY"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.mechanic.refresh_from_db()
        self.assertEqual(self.mechanic.status, Mechanic.Status.BUSY)
