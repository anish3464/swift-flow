from django.contrib import admin
from .models import Project, ProjectMembership, Task, TaskComment

class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 0
    readonly_fields = ['joined_at']

class TaskInline(admin.TabularInline):
    model = Task
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    fields = ['title', 'assigned_to', 'status', 'priority', 'due_date']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'manager', 'status', 'priority', 'progress', 'created_at']
    list_filter = ['status', 'priority', 'company', 'created_at']
    search_fields = ['title', 'company__name', 'manager__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'task_count', 'completed_tasks', 'completion_percentage']
    date_hierarchy = 'created_at'
    inlines = [ProjectMembershipInline, TaskInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'company', 'manager')
        }),
        ('Assignment', {
            'fields': ('assigned_teams',)
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'progress')
        }),
        ('Timeline', {
            'fields': ('start_date', 'due_date')
        }),
        ('Budget', {
            'fields': ('budget',)
        }),
        ('Statistics', {
            'fields': ('task_count', 'completed_tasks', 'completion_percentage'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'is_active', 'joined_at']
    list_filter = ['role', 'is_active', 'joined_at', 'project__company']
    search_fields = ['project__title', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['id', 'joined_at']

class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assigned_to', 'status', 'priority', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'project__company', 'created_at']
    search_fields = ['title', 'project__title', 'assigned_to__username', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'
    inlines = [TaskCommentInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'project')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'created_by')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority')
        }),
        ('Time Tracking', {
            'fields': ('estimated_hours', 'actual_hours')
        }),
        ('Timeline', {
            'fields': ('start_date', 'due_date', 'completed_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'user', 'created_at']
    list_filter = ['task__project__company', 'created_at']
    search_fields = ['task__title', 'user__username', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at']
