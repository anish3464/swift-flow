from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class Company(models.Model):
    """Company model for organizations and freelancers"""
    COMPANY_TYPES = [
        ('company', 'Company'),
        ('freelancer', 'Freelancer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPES, default='company')
    description = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_company_type_display()})"

class User(AbstractUser):
    """Extended User model with company association"""
    USER_ROLES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('member', 'Member'),
        ('viewer', 'Viewer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE, 
        related_name='users',
        null=True, 
        blank=True
    )
    role = models.CharField(max_length=20, choices=USER_ROLES, default='member')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(null=True, blank=True)
    is_company_owner = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} - {self.company}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
