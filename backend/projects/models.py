from django.db import models
from accounts.models import User, Company
from teams.models import Team
import uuid

class Project(models.Model):
    """Project model for managing projects"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='projects'
    )
    manager = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='managed_projects'
    )
    assigned_users = models.ManyToManyField(
        User, 
        through='ProjectMembership',
        related_name='assigned_projects'
    )
    assigned_teams = models.ManyToManyField(
        Team, 
        blank=True,
        related_name='assigned_projects'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    progress = models.PositiveIntegerField(default=0, help_text='Progress percentage (0-100)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.company.name}"
    
    @property
    def task_count(self):
        return self.tasks.count()
    
    @property
    def completed_tasks(self):
        return self.tasks.filter(status='completed').count()
    
    @property
    def completion_percentage(self):
        if self.task_count == 0:
            return 0
        return int((self.completed_tasks / self.task_count) * 100)

class ProjectMembership(models.Model):
    """Through model for Project-User relationship with additional fields"""
    MEMBERSHIP_ROLES = [
        ('manager', 'Project Manager'),
        ('lead', 'Lead'),
        ('member', 'Member'),
        ('contributor', 'Contributor'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=MEMBERSHIP_ROLES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['project', 'user']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.project.title} ({self.get_role_display()})"

class Task(models.Model):
    """Task model for individual tasks within projects"""
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    project = models.ForeignKey(
        Project, 
        on_delete=models.CASCADE, 
        related_name='tasks'
    )
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_tasks'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"

class TaskComment(models.Model):
    """Comment model for task discussions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='task_comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.task.title}"
