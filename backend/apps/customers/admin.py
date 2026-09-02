from django.contrib import admin
from .models import Customer, Vehicle

class VehicleInline(admin.TabularInline):
    model = Vehicle
    extra = 1

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'city', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone')
    list_filter = ('city', 'created_at')
    inlines = [VehicleInline]

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('license_plate', 'make', 'model', 'year', 'customer', 'fuel_type', 'mileage')
    search_fields = ('license_plate', 'make', 'model', 'customer__first_name', 'customer__last_name')
    list_filter = ('make', 'fuel_type', 'year')
