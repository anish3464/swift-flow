from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from .models import User, Company
from .serializers import (
    UserSerializer, UserCreateSerializer, CompanySerializer,
    CompanyRegistrationSerializer, LoginSerializer, ChangePasswordSerializer
)

# Create your views here.

class CompanyRegistrationView(generics.CreateAPIView):
    """Register a new company with owner user"""
    queryset = Company.objects.all()
    serializer_class = CompanyRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save()
        
        # Get the owner user
        owner = company.users.filter(is_company_owner=True).first()
        
        # Generate tokens
        refresh = RefreshToken.for_user(owner)
        
        return Response({
            'message': 'Company registered successfully',
            'company': CompanySerializer(company).data,
            'user': UserSerializer(owner).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })

@api_view(['POST'])
def logout_view(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception:
        return Response({'message': 'Logout successful'})

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    """Change user password"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})

class CompanyUsersListView(generics.ListCreateAPIView):
    """List users in the company and create new users"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def perform_create(self, serializer):
        # Only admins and managers can create users
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to create users")
        
        serializer.save(company=self.request.user.company)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific user"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company)
    
    def perform_update(self, serializer):
        # Users can only update their own profile, admins can update anyone
        if (self.get_object() != self.request.user and 
            self.request.user.role not in ['admin', 'manager']):
            raise permissions.PermissionDenied("You can only update your own profile")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins can delete users, and can't delete themselves
        if (self.request.user.role != 'admin' or 
            instance == self.request.user):
            raise permissions.PermissionDenied("You don't have permission to delete this user")
        instance.is_active = False
        instance.save()

class CompanyDetailView(generics.RetrieveUpdateAPIView):
    """Get and update company details"""
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.company
    
    def perform_update(self, serializer):
        # Only admins can update company details
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("You don't have permission to update company details")
        serializer.save()

@api_view(['GET'])
def current_user_view(request):
    """Get current authenticated user details"""
    return Response(UserSerializer(request.user).data)
