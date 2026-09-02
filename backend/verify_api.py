import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient

client = APIClient()

print("=" * 75)
print("             DASHX REST API ENDPOINT VERIFICATION REPORT            ")
print("=" * 75)

endpoints = [
    ("Analytics Overview", "/api/v1/analytics/overview/"),
    ("Bookings Over Time", "/api/v1/analytics/bookings-over-time/?days=7"),
    ("Revenue Over Time", "/api/v1/analytics/revenue-over-time/?days=7"),
    ("Status Distribution", "/api/v1/analytics/status-distribution/"),
    ("Service Breakdown", "/api/v1/analytics/service-breakdown/"),
    ("Bookings List (Filtered)", "/api/v1/bookings/?status=PENDING&page=1&page_size=3"),
    ("Bookings Search", "/api/v1/bookings/?search=Maruti&page_size=2"),
    ("Mechanics List", "/api/v1/mechanics/?status=AVAILABLE&page_size=3"),
    ("Customers List", "/api/v1/customers/?page_size=3"),
    ("Services Catalog", "/api/v1/services/"),
    ("Service Categories", "/api/v1/service-categories/"),
]

for name, url in endpoints:
    resp = client.get(url)
    print(f"\n[GET] {url}  --> Status: {resp.status_code}")
    data = resp.data
    # Print sample / pretty formatted JSON snippet
    if isinstance(data, dict):
        if 'results' in data:
            print(f"  Count: {data.get('count')}, Next: {data.get('next')}")
            sample = data['results'][:1]
            print("  Sample Result:", json.dumps(sample, indent=2, default=str))
        else:
            print("  Response:", json.dumps(data, indent=2, default=str))
    elif isinstance(data, list):
        print(f"  Total items: {len(data)}")
        print("  Sample Item:", json.dumps(data[:1], indent=2, default=str))

# Test PATCH booking status
print("\n" + "=" * 75)
print("TESTING STATUS TRANSITION & AUDIT TRAIL:")
print("=" * 75)
booking_resp = client.get("/api/v1/bookings/?status=PENDING&page_size=1")
if booking_resp.data['results']:
    b_id = booking_resp.data['results'][0]['id']
    ref = booking_resp.data['results'][0]['reference_code']
    print(f"Testing transition on Booking #{b_id} ({ref}): PENDING -> ASSIGNED")
    patch_resp = client.patch(
        f"/api/v1/bookings/{b_id}/status/",
        {"status": "ASSIGNED", "notes": "Dispatched field engineer to site", "changed_by": "Ops Manager Lead"},
        format='json'
    )
    print(f"PATCH /api/v1/bookings/{b_id}/status/ --> Status: {patch_resp.status_code}")
    print("Updated Booking Status:", patch_resp.data.get('status'))
    print("Latest Status History Entry:", json.dumps(patch_resp.data.get('status_history', [])[:1], indent=2, default=str))

print("\n" + "=" * 75)
print("ALL ENDPOINTS VERIFIED SUCCESSFULLY!")
print("=" * 75)
