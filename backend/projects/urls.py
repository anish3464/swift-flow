from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'comments', views.TaskCommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    path('my-tasks/', views.MyTasksView.as_view(), name='my-tasks'),
    path('my-projects/', views.MyProjectsView.as_view(), name='my-projects'),
]