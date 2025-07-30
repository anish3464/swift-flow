from rest_framework import serializers
from .models import Project, ProjectMembership, Task, TaskComment
from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer

class ProjectMembershipSerializer(serializers.ModelSerializer):
    """Serializer for ProjectMembership model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = ProjectMembership
        fields = [
            'id', 'user', 'user_id', 'role', 'joined_at', 'is_active'
        ]
        read_only_fields = ['id', 'joined_at']

class TaskCommentSerializer(serializers.ModelSerializer):
    """Serializer for TaskComment model"""
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = TaskComment
        fields = [
            'id', 'task', 'user', 'user_name', 'content', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_title',
            'assigned_to', 'assigned_to_name', 'created_by', 'created_by_name',
            'status', 'priority', 'estimated_hours', 'actual_hours',
            'start_date', 'due_date', 'completed_at', 'created_at', 'updated_at',
            'comments', 'comments_count'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_by_name', 'project_title', 
            'assigned_to_name', 'completed_at', 'created_at', 'updated_at',
            'comments', 'comments_count'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    task_count = serializers.ReadOnlyField()
    completed_tasks = serializers.ReadOnlyField()
    completion_percentage = serializers.ReadOnlyField()
    assigned_teams = TeamSerializer(many=True, read_only=True)
    memberships = ProjectMembershipSerializer(source='projectmembership_set', many=True, read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'company', 'company_name',
            'manager', 'manager_name', 'assigned_teams', 'memberships',
            'status', 'priority', 'start_date', 'due_date', 'budget',
            'progress', 'task_count', 'completed_tasks', 'completion_percentage',
            'tasks', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company_name', 'manager_name', 'task_count', 
            'completed_tasks', 'completion_percentage', 'assigned_teams',
            'memberships', 'tasks', 'created_at', 'updated_at'
        ]

class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating projects"""
    assigned_user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    assigned_team_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'manager', 'status', 'priority',
            'start_date', 'due_date', 'budget', 'assigned_user_ids',
            'assigned_team_ids'
        ]
    
    def create(self, validated_data):
        assigned_user_ids = validated_data.pop('assigned_user_ids', [])
        assigned_team_ids = validated_data.pop('assigned_team_ids', [])
        user = self.context['request'].user
        validated_data['company'] = user.company
        
        project = Project.objects.create(**validated_data)
        
        # Add assigned users
        for user_id in assigned_user_ids:
            ProjectMembership.objects.create(
                project=project,
                user_id=user_id,
                role='member'
            )
        
        # Add assigned teams
        from teams.models import Team
        for team_id in assigned_team_ids:
            try:
                team = Team.objects.get(id=team_id, company=user.company)
                project.assigned_teams.add(team)
            except Team.DoesNotExist:
                continue
        
        # Add manager as member if not already in the list
        if project.manager and project.manager.id not in assigned_user_ids:
            ProjectMembership.objects.create(
                project=project,
                user=project.manager,
                role='manager'
            )
        
        return project

class AddProjectMemberSerializer(serializers.Serializer):
    """Serializer for adding members to a project"""
    user_id = serializers.UUIDField()
    role = serializers.ChoiceField(choices=ProjectMembership.MEMBERSHIP_ROLES, default='member')
    
    def validate_user_id(self, value):
        from accounts.models import User
        try:
            user = User.objects.get(id=value)
            project = self.context['project']
            
            # Check if user belongs to the same company
            if user.company != project.company:
                raise serializers.ValidationError("User must belong to the same company")
            
            # Check if user is already a member
            if ProjectMembership.objects.filter(project=project, user=user, is_active=True).exists():
                raise serializers.ValidationError("User is already a member of this project")
                
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

class TaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tasks"""
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'project', 'assigned_to', 'status',
            'priority', 'estimated_hours', 'start_date', 'due_date'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_project(self, value):
        user = self.context['request'].user
        if value.company != user.company:
            raise serializers.ValidationError("Project must belong to your company")
        return value
    
    def validate_assigned_to(self, value):
        if value:
            user = self.context['request'].user
            if value.company != user.company:
                raise serializers.ValidationError("Assigned user must belong to your company")
        return value