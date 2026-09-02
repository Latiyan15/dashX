from django.contrib import admin
from .models import Booking, BookingStatusHistory

class BookingStatusHistoryInline(admin.TabularInline):
    model = BookingStatusHistory
    extra = 0
    readonly_fields = ('from_status', 'to_status', 'changed_by', 'notes', 'created_at')
    can_delete = False

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'reference_code',
        'customer',
        'vehicle',
        'service',
        'mechanic',
        'status',
        'total_amount',
        'scheduled_at'
    )
    search_fields = (
        'reference_code',
        'customer__first_name',
        'customer__last_name',
        'vehicle__license_plate',
        'mechanic__first_name',
        'mechanic__last_name'
    )
    list_filter = ('status', 'service__category', 'scheduled_at')
    inlines = [BookingStatusHistoryInline]

@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('booking', 'from_status', 'to_status', 'changed_by', 'created_at')
    list_filter = ('to_status', 'changed_by')
    search_fields = ('booking__reference_code', 'notes')
