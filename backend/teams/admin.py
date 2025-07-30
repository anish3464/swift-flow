from django.contrib import admin
from .models import Team, TeamMembership

class TeamMembershipInline(admin.TabularInline):
    model = TeamMembership
    extra = 0
    readonly_fields = ['joined_at']

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'lead', 'is_active', 'created_at']
    list_filter = ['company', 'is_active', 'created_at']
    search_fields = ['name', 'company__name', 'lead__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [TeamMembershipInline]

@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ['team', 'user', 'role', 'is_active', 'joined_at']
    list_filter = ['role', 'is_active', 'joined_at', 'team__company']
    search_fields = ['team__name', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'joined_at']
