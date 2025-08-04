from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Company

class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    users_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'company_type', 'description', 'email', 
            'phone', 'address', 'website', 'created_at', 'updated_at',
            'is_active', 'users_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'users_count']
    
    def get_users_count(self, obj):
        return obj.users.count()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    company_name = serializers.CharField(source='company.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'company', 'company_name', 'role', 'phone', 'avatar', 'position',
            'department', 'hire_date', 'is_company_owner', 'is_active',
            'date_joined', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'created_at', 'updated_at', 
            'company_name', 'full_name'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 'first_name', 
            'last_name', 'company', 'role', 'phone', 'position', 'department', 
            'hire_date', 'is_company_owner'
        ]
        extra_kwargs = {
            'company': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Set company from request user if not provided
        if 'company' not in validated_data or not validated_data['company']:
            validated_data['company'] = self.context['request'].user.company
            
        user = User.objects.create_user(password=password, **validated_data)
        return user

class CompanyRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for company registration with owner user"""
    owner_username = serializers.CharField(max_length=150)
    owner_email = serializers.EmailField()
    owner_password = serializers.CharField(write_only=True, validators=[validate_password])
    owner_password_confirm = serializers.CharField(write_only=True)
    owner_first_name = serializers.CharField(max_length=150, required=False)
    owner_last_name = serializers.CharField(max_length=150, required=False)
    
    class Meta:
        model = Company
        fields = [
            'name', 'company_type', 'description', 'email', 'phone', 
            'address', 'website', 'owner_username', 'owner_email', 
            'owner_password', 'owner_password_confirm', 'owner_first_name', 
            'owner_last_name'
        ]
    
    def validate(self, attrs):
        if attrs['owner_password'] != attrs['owner_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check if username already exists
        if User.objects.filter(username=attrs['owner_username']).exists():
            raise serializers.ValidationError("Username already exists")
        
        return attrs
    
    def create(self, validated_data):
        # Extract owner data
        owner_data = {
            'username': validated_data.pop('owner_username'),
            'email': validated_data.pop('owner_email'),
            'password': validated_data.pop('owner_password'),
            'first_name': validated_data.pop('owner_first_name', ''),
            'last_name': validated_data.pop('owner_last_name', ''),
        }
        validated_data.pop('owner_password_confirm')
        
        # Create company
        company = Company.objects.create(**validated_data)
        
        # Create owner user
        owner = User.objects.create_user(
            **owner_data,
            company=company,
            role='admin',
            is_company_owner=True
        )
        
        return company

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value