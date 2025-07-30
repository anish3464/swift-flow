from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teams', views.TeamViewSet, basename='team')

urlpatterns = [
    path('', include(router.urls)),
    path('my-teams/', views.TeamMembershipListView.as_view(), name='my-teams'),
]