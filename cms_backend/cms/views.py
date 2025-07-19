from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Post, SiteConfiguration, ContactMessage
from .serializers import (
    PostSerializer,
    PostListSerializer,
    PostCreateUpdateSerializer,
    SiteConfigurationSerializer,
    SiteConfigurationUpdateSerializer,
    SiteConfigurationCreateSerializer,
    PublicConfigurationSerializer,
    ContactMessageSerializer,
    ContactMessageCreateSerializer,
    ConfigurationsByCategorySerializer
)
from .permissions import IsAuthorOrReadOnly


# ---------------- POST VIEWS ----------------

class PostViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de posts com suporte a imagem"""
    queryset = Post.objects.all()
    lookup_field = 'slug'
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]

    def get_queryset(self):
        queryset = Post.objects.all()
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            if self.action in ['list', 'retrieve']:
                queryset = queryset.filter(is_published=True)

        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__email=author)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            image=self.request.FILES.get('image')
        )

    def perform_update(self, serializer):
        serializer.save(
            image=self.request.FILES.get('image', serializer.instance.image)
        )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_posts(self, request):
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAuthorOrReadOnly])
    def toggle_publish(self, request, slug=None):
        post = self.get_object()
        post.is_published = not post.is_published
        post.save()
        serializer = PostSerializer(post)
        return Response({
            'message': f'Post {"publicado" if post.is_published else "despublicado"} com sucesso!',
            'post': serializer.data
        })


# ---------------- CONFIGURAÇÕES DO SITE ----------------

class SiteConfigurationViewSet(viewsets.ModelViewSet):
    queryset = SiteConfiguration.objects.all()
    serializer_class = SiteConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]


# ---------------- CONFIGURAÇÕES PÚBLICAS ----------------

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_configurations(request):
    configs = SiteConfiguration.objects.filter(is_public=True)
    serializer = PublicConfigurationSerializer(configs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def site_info(request):
    site_name = SiteConfiguration.objects.filter(key="site_name").first()
    email_contact = SiteConfiguration.objects.filter(key="email_contact").first()

    return Response({
        "site_name": site_name.value if site_name else None,
        "email_contact": email_contact.value if email_contact else None
    })
