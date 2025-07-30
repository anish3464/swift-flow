from django.db import models
from accounts.models import User, Company
import uuid

class Team(models.Model):
    """Team model for organizing users into groups"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='teams'
    )
    lead = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='led_teams'
    )
    members = models.ManyToManyField(
        User, 
        through='TeamMembership',
        related_name='teams'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'company']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"

class TeamMembership(models.Model):
    """Through model for Team-User relationship with additional fields"""
    MEMBERSHIP_ROLES = [
        ('lead', 'Team Lead'),
        ('member', 'Team Member'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=MEMBERSHIP_ROLES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['team', 'user']
        ordering = ['joined_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.team.name} ({self.get_role_display()})"
