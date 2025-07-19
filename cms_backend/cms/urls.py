from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'configurations', views.SiteConfigurationViewSet, basename='configuration')

urlpatterns = [
    path('', include(router.urls)),
    path('public/configurations/', views.public_configurations, name='public_configurations'),
    path('public/site-info/', views.site_info, name='site_info'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
