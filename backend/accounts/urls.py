from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.CompanyRegistrationView.as_view(), name='company-register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # User management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('current-user/', views.current_user_view, name='current-user'),
    
    # Company users
    path('users/', views.CompanyUsersListView.as_view(), name='company-users-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Company management
    path('company/', views.CompanyDetailView.as_view(), name='company-detail'),
]