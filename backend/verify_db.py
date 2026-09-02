import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.customers.models import Customer, Vehicle
from apps.mechanics.models import Mechanic
from apps.services.models import ServiceCategory, Service
from apps.bookings.models import Booking, BookingStatusHistory
from django.db.models import Count, Sum, Avg

print("=" * 60)
print("           DASHX DATABASE VERIFICATION REPORT             ")
print("=" * 60)
print(f"Total Customers:          {Customer.objects.count()}")
print(f"Total Vehicles:           {Vehicle.objects.count()}")
print(f"Total Mechanics:          {Mechanic.objects.count()}")
print(f"Total Service Categories: {ServiceCategory.objects.count()}")
print(f"Total Services:           {Service.objects.count()}")
print(f"Total Bookings:           {Booking.objects.count()}")
print(f"Total Status Histories:   {BookingStatusHistory.objects.count()}")

print("\n" + "-" * 60)
print("BOOKING STATUS BREAKDOWN:")
print("-" * 60)
for item in Booking.objects.values('status').annotate(count=Count('id')).order_by('-count'):
    print(f"  • {item['status']:<15}: {item['count']} bookings")

print("\n" + "-" * 60)
print("FINANCIAL SUMMARY:")
print("-" * 60)
rev = Booking.objects.filter(status='COMPLETED').aggregate(total_rev=Sum('total_amount'), avg_ticket=Avg('total_amount'))
print(f"  • Total Revenue from Completed Bookings: Rs. {rev['total_rev']:,.2f}")
print(f"  • Average Ticket Size:                  Rs. {rev['avg_ticket']:,.2f}")

print("\n" + "-" * 60)
print("SAMPLE SEEDED BOOKING RECORDS:")
print("-" * 60)
for b in Booking.objects.select_related('customer', 'vehicle', 'service', 'mechanic').all()[:4]:
    mech_name = b.mechanic.full_name if b.mechanic else "Unassigned"
    print(f"  [{b.reference_code}] | {b.customer.full_name} | {b.vehicle.display_name} ({b.vehicle.license_plate})")
    print(f"    -> Service: {b.service.name}")
    print(f"    -> Mechanic: {mech_name} | Status: {b.status} | Total: Rs. {b.total_amount}")
    print(f"    -> Audit steps recorded: {b.status_history.count()}")
    print()
print("=" * 60)
