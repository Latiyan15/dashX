from rest_framework import serializers
from .models import ServiceCategory, Service

class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id',
            'category',
            'category_name',
            'category_slug',
            'name',
            'description',
            'base_price',
            'estimated_duration_minutes',
            'is_active',
            'created_at',
        ]


class ServiceCategorySerializer(serializers.ModelSerializer):
    services_count = serializers.IntegerField(read_only=True)
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceCategory
        fields = [
            'id',
            'name',
            'slug',
            'icon',
            'description',
            'is_active',
            'services_count',
            'services',
            'created_at',
        ]
