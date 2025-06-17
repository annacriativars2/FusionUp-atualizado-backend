from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user-management')

urlpatterns = [
    # Autenticação JWT
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registro e perfil
    path('register/', views.register_user, name='register'),
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_user_profile, name='profile_update'),
    
    # Gerenciamento de usuários (admin)
    path('', include(router.urls)),
]

