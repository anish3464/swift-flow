from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import Project, ProjectMembership, Task, TaskComment
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer, ProjectMembershipSerializer,
    AddProjectMemberSerializer, TaskSerializer, TaskCreateSerializer,
    TaskCommentSerializer
)

class ProjectViewSet(ModelViewSet):
    """ViewSet for project management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(company=self.request.user.company)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        # Only admins and managers can create projects
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to create projects")
        serializer.save()
    
    def perform_update(self, serializer):
        # Only admins, managers, and project managers can update projects
        project = self.get_object()
        if (self.request.user.role not in ['admin', 'manager'] and 
            project.manager != self.request.user):
            raise permissions.PermissionDenied("You don't have permission to update this project")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins and managers can delete projects
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to delete projects")
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        
        # Only admins, managers, and project managers can add members
        if (request.user.role not in ['admin', 'manager'] and 
            project.manager != request.user):
            return Response(
                {'error': "You don't have permission to add members to this project"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AddProjectMemberSerializer(
            data=request.data, 
            context={'project': project, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        membership = ProjectMembership.objects.create(
            project=project,
            user_id=serializer.validated_data['user_id'],
            role=serializer.validated_data['role']
        )
        
        return Response(
            ProjectMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only admins, managers, and project managers can remove members
        if (request.user.role not in ['admin', 'manager'] and 
            project.manager != request.user):
            return Response(
                {'error': "You don't have permission to remove members from this project"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            membership = ProjectMembership.objects.get(
                project=project, 
                user_id=user_id, 
                is_active=True
            )
            membership.is_active = False
            membership.save()
            
            return Response({'message': 'Member removed successfully'})
        except ProjectMembership.DoesNotExist:
            return Response(
                {'error': 'Member not found in this project'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get project members"""
        project = self.get_object()
        memberships = ProjectMembership.objects.filter(project=project, is_active=True)
        serializer = ProjectMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get project tasks"""
        project = self.get_object()
        tasks = Task.objects.filter(project=project)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

class TaskViewSet(ModelViewSet):
    """ViewSet for task management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(project__company=self.request.user.company)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        serializer.save()
    
    def perform_update(self, serializer):
        task = self.get_object()
        
        # Mark task as completed when status changes to completed
        if (serializer.validated_data.get('status') == 'completed' and 
            task.status != 'completed'):
            serializer.validated_data['completed_at'] = timezone.now()
        
        # Clear completed_at when status changes from completed
        if (task.status == 'completed' and 
            serializer.validated_data.get('status') != 'completed'):
            serializer.validated_data['completed_at'] = None
        
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only task creator, project manager, or admins can delete tasks
        if (instance.created_by != self.request.user and
            instance.project.manager != self.request.user and
            self.request.user.role not in ['admin', 'manager']):
            raise permissions.PermissionDenied("You don't have permission to delete this task")
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to the task"""
        task = self.get_object()
        
        serializer = TaskCommentSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(task=task)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get task comments"""
        task = self.get_object()
        comments = TaskComment.objects.filter(task=task)
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)

class MyTasksView(generics.ListAPIView):
    """List tasks assigned to the current user"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(
            assigned_to=self.request.user,
            project__company=self.request.user.company
        )

class MyProjectsView(generics.ListAPIView):
    """List projects where the current user is a member"""
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(
            company=self.request.user.company,
            projectmembership__user=self.request.user,
            projectmembership__is_active=True
        ).distinct()

class TaskCommentViewSet(ModelViewSet):
    """ViewSet for task comment management"""
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TaskComment.objects.filter(
            task__project__company=self.request.user.company
        )
    
    def perform_update(self, serializer):
        # Only comment creator can update comments
        if self.get_object().user != self.request.user:
            raise permissions.PermissionDenied("You can only update your own comments")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only comment creator or admins can delete comments
        if (instance.user != self.request.user and 
            self.request.user.role not in ['admin', 'manager']):
            raise permissions.PermissionDenied("You don't have permission to delete this comment")
        instance.delete()
