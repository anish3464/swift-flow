from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Team, TeamMembership
from .serializers import (
    TeamSerializer, TeamCreateSerializer, TeamMembershipSerializer,
    AddTeamMemberSerializer
)

# Create your views here.

class TeamViewSet(ModelViewSet):
    """ViewSet for team management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.filter(company=self.request.user.company, is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TeamCreateSerializer
        return TeamSerializer
    
    def perform_create(self, serializer):
        # Only admins and managers can create teams
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to create teams")
        serializer.save()
    
    def perform_update(self, serializer):
        # Only admins, managers, and team leads can update teams
        team = self.get_object()
        if (self.request.user.role not in ['admin', 'manager'] and 
            team.lead != self.request.user):
            raise permissions.PermissionDenied("You don't have permission to update this team")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins and managers can delete teams
        if self.request.user.role not in ['admin', 'manager']:
            raise permissions.PermissionDenied("You don't have permission to delete teams")
        instance.is_active = False
        instance.save()
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the team"""
        team = self.get_object()
        
        # Only admins, managers, and team leads can add members
        if (request.user.role not in ['admin', 'manager'] and 
            team.lead != request.user):
            return Response(
                {'error': "You don't have permission to add members to this team"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AddTeamMemberSerializer(
            data=request.data, 
            context={'team': team, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        membership = TeamMembership.objects.create(
            team=team,
            user_id=serializer.validated_data['user_id'],
            role=serializer.validated_data['role']
        )
        
        return Response(
            TeamMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        """Remove a member from the team"""
        team = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only admins, managers, and team leads can remove members
        if (request.user.role not in ['admin', 'manager'] and 
            team.lead != request.user):
            return Response(
                {'error': "You don't have permission to remove members from this team"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            membership = TeamMembership.objects.get(
                team=team, 
                user_id=user_id, 
                is_active=True
            )
            membership.is_active = False
            membership.save()
            
            return Response({'message': 'Member removed successfully'})
        except TeamMembership.DoesNotExist:
            return Response(
                {'error': 'Member not found in this team'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get team members"""
        team = self.get_object()
        memberships = TeamMembership.objects.filter(team=team, is_active=True)
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

class TeamMembershipListView(generics.ListAPIView):
    """List all team memberships for the current user"""
    serializer_class = TeamMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TeamMembership.objects.filter(
            user=self.request.user,
            is_active=True,
            team__company=self.request.user.company
        )
