from rest_framework import serializers
from .models import Team, TeamMembership
from accounts.serializers import UserSerializer

class TeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for TeamMembership model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = TeamMembership
        fields = [
            'id', 'user', 'user_id', 'role', 'joined_at', 'is_active'
        ]
        read_only_fields = ['id', 'joined_at']

class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    lead_name = serializers.CharField(source='lead.full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    members_count = serializers.SerializerMethodField()
    memberships = TeamMembershipSerializer(source='teammembership_set', many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'company', 'company_name',
            'lead', 'lead_name', 'members_count', 'memberships',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'company_name', 'lead_name', 'members_count']
    
    def get_members_count(self, obj):
        return obj.teammembership_set.filter(is_active=True).count()

class TeamCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating teams"""
    member_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Team
        fields = [
            'name', 'description', 'lead', 'member_ids'
        ]
    
    def validate_lead(self, value):
        if value:
            user = self.context['request'].user
            if value.company != user.company:
                raise serializers.ValidationError("Team lead must belong to the same company")
        return value
    
    def create(self, validated_data):
        member_ids = validated_data.pop('member_ids', [])
        user = self.context['request'].user
        validated_data['company'] = user.company
        
        team = Team.objects.create(**validated_data)
        
        # Add members
        for member_id in member_ids:
            try:
                from accounts.models import User
                member_user = User.objects.get(id=member_id, company=user.company)
                TeamMembership.objects.create(
                    team=team,
                    user=member_user,
                    role='member'
                )
            except User.DoesNotExist:
                continue
        
        # Add lead as member if not already in the list
        if team.lead and team.lead.id not in member_ids:
            TeamMembership.objects.create(
                team=team,
                user=team.lead,
                role='lead'
            )
        
        return team

class AddTeamMemberSerializer(serializers.Serializer):
    """Serializer for adding members to a team"""
    user_id = serializers.UUIDField()
    role = serializers.ChoiceField(choices=TeamMembership.MEMBERSHIP_ROLES, default='member')
    
    def validate_user_id(self, value):
        from accounts.models import User
        try:
            user = User.objects.get(id=value)
            team = self.context['team']
            
            # Check if user belongs to the same company
            if user.company != team.company:
                raise serializers.ValidationError("User must belong to the same company")
            
            # Check if user is already a member
            if TeamMembership.objects.filter(team=team, user=user, is_active=True).exists():
                raise serializers.ValidationError("User is already a member of this team")
                
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")