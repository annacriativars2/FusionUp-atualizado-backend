from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
include
# Router para ViewSets
router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'configurations', views.SiteConfigurationViewSet, basename='configuration')
include
urlpatterns = [
    path('', include(router.urls)),
    
    # Endpoints públicos
    path('public/configurations/', views.public_configurations, name='public_configurations'),
    path('public/site-info/', views.site_info, name='site_info'),
   # path('public/posts/', views.public_posts, name='public_posts'),
]

