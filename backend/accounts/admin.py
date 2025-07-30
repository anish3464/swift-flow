from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'company_type', 'email', 'is_active', 'created_at']
    list_filter = ['company_type', 'is_active', 'created_at']
    search_fields = ['name', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'company', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'is_company_owner', 'company__company_type', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'company__name']
    readonly_fields = ['id', 'date_joined', 'last_login', 'created_at', 'updated_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Company Info', {
            'fields': ('company', 'role', 'is_company_owner')
        }),
        ('Additional Info', {
            'fields': ('phone', 'avatar', 'position', 'department', 'hire_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
