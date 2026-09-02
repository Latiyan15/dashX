from django.contrib import admin
from .models import Mechanic

@admin.register(Mechanic)
class MechanicAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'status', 'rating', 'total_jobs_completed', 'specialization', 'phone')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'specialization')
    list_filter = ('status', 'specialization')
    ordering = ('-rating', '-total_jobs_completed')
