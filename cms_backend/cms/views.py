from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from collections import defaultdict

from .models import Post, SiteConfiguration
from .serializers import (
    PostSerializer, PostListSerializer, PostCreateUpdateSerializer,
    SiteConfigurationSerializer, SiteConfigurationUpdateSerializer,
    SiteConfigurationCreateSerializer, PublicConfigurationSerializer,
    ConfigurationsByCategorySerializer
)
from .permissions import IsAuthorOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de posts"""
    
    queryset = Post.objects.all()
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'list':
            return PostListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PostCreateUpdateSerializer
        return PostSerializer
    
    def get_permissions(self):
        """Define permissões baseadas na ação"""
        if self.action in ['list', 'retrieve']:
            # Leitura é pública
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            # Apenas usuários autenticados podem criar
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Apenas o autor pode editar/deletar
            permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtra posts baseado no usuário e parâmetros"""
        queryset = Post.objects.all()
        
        # Se não é staff, mostra apenas posts publicados para usuários não autenticados
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            if self.action in ['list', 'retrieve']:
                queryset = queryset.filter(is_published=True)
        
        # Filtros opcionais
        author = self.request.query_params.get('author', None)
        if author:
            queryset = queryset.filter(author__email=author)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Define o autor como o usuário atual ao criar"""
        serializer.save(author=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_posts(self, request):
        """Retorna apenas os posts do usuário atual"""
        posts = Post.objects.filter(author=request.user).order_by('-created_at')
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAuthorOrReadOnly])
    def toggle_publish(self, request, slug=None):
        """Alterna o status de publicação do post"""
        post = self.get_object()
        post.is_published = not post.is_published
        post.save()
        
        serializer = PostSerializer(post)
        return Response({
            'message': f'Post {"publicado" if post.is_published else "despublicado"} com sucesso!',
            'post': serializer.data
        })


class SiteConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de configurações do sistema"""
    
    queryset = SiteConfiguration.objects.all()
    lookup_field = 'key'
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'create':
            return SiteConfigurationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SiteConfigurationUpdateSerializer
        return SiteConfigurationSerializer
    
    def get_queryset(self):
        """Filtra configurações baseado nos parâmetros"""
        queryset = SiteConfiguration.objects.all()
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(key__icontains=search) | 
                Q(label__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset.order_by('category', 'order', 'label')
    
    def list(self, request, *args, **kwargs):
        """Lista configurações com opção de agrupamento por categoria"""
        group_by_category = request.query_params.get('group_by_category', 'false').lower() == 'true'
        
        if group_by_category:
            return self.list_by_category(request)
        
        return super().list(request, *args, **kwargs)
    
    def list_by_category(self, request):
        """Lista configurações agrupadas por categoria"""
        queryset = self.get_queryset()
        
        # Agrupar por categoria
        categories = defaultdict(list)
        for config in queryset:
            categories[config.category].append(config)
        
        # Preparar resposta
        result = []
        category_labels = dict(SiteConfiguration.CATEGORY_CHOICES)
        
        for category, configs in categories.items():
            result.append({
                'category': category,
                'label': category_labels.get(category, category),
                'configurations': SiteConfigurationSerializer(configs, many=True).data
            })
        
        return Response(result)
    
    def create(self, request, *args, **kwargs):
        """Cria uma nova configuração"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            config = serializer.save()
            return Response({
                'message': 'Configuração criada com sucesso!',
                'configuration': SiteConfigurationSerializer(config).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Erro ao criar configuração',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Atualiza uma configuração existente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            config = serializer.save()
            return Response({
                'message': 'Configuração atualizada com sucesso!',
                'configuration': SiteConfigurationSerializer(config).data
            })
        
        return Response({
            'message': 'Erro ao atualizar configuração',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Deleta uma configuração"""
        instance = self.get_object()
        
        # Verificar se é uma configuração obrigatória
        if instance.is_required:
            return Response({
                'message': 'Não é possível deletar uma configuração obrigatória'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response({
            'message': 'Configuração deletada com sucesso!'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Retorna todas as categorias disponíveis"""
        categories = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in SiteConfiguration.CATEGORY_CHOICES
        ]
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Retorna todos os tipos disponíveis"""
        types = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in SiteConfiguration.TYPE_CHOICES
        ]
        return Response(types)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Atualiza múltiplas configurações de uma vez"""
        configurations = request.data.get('configurations', [])
        
        if not configurations:
            return Response({
                'message': 'Nenhuma configuração fornecida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        updated_configs = []
        errors = []
        
        for config_data in configurations:
            key = config_data.get('key')
            value = config_data.get('value')
            
            if not key:
                errors.append({'key': 'missing', 'error': 'Chave é obrigatória'})
                continue
            
            try:
                config = SiteConfiguration.objects.get(key=key)
                serializer = SiteConfigurationUpdateSerializer(
                    config, 
                    data={'value': value}, 
                    partial=True
                )
                
                if serializer.is_valid():
                    updated_config = serializer.save()
                    updated_configs.append(SiteConfigurationSerializer(updated_config).data)
                else:
                    errors.append({'key': key, 'errors': serializer.errors})
            
            except SiteConfiguration.DoesNotExist:
                errors.append({'key': key, 'error': 'Configuração não encontrada'})
        
        return Response({
            'message': f'{len(updated_configs)} configurações atualizadas com sucesso!',
            'updated': updated_configs,
            'errors': errors
        })
    
    @action(detail=False, methods=['post'])
    def reset_to_defaults(self, request):
        """Reseta configurações para valores padrão"""
        category = request.data.get('category')
        
        queryset = SiteConfiguration.objects.all()
        if category:
            queryset = queryset.filter(category=category)
        
        reset_count = 0
        for config in queryset:
            if config.default_value is not None:
                config.value = config.default_value
                config.save()
                reset_count += 1
        
        return Response({
            'message': f'{reset_count} configurações resetadas para valores padrão!'
        })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_configurations(request):
    """Endpoint público para obter configurações públicas"""
    configs = SiteConfiguration.objects.filter(is_public=True)
    
    # Opção de agrupar por categoria
    group_by_category = request.query_params.get('group_by_category', 'false').lower() == 'true'
    
    if group_by_category:
        categories = defaultdict(dict)
        for config in configs:
            categories[config.category][config.key] = config.get_value()
        
        return Response(dict(categories))
    else:
        # Formato simples: chave -> valor
        result = {config.key: config.get_value() for config in configs}
        return Response(result)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def site_info(request):
    """Endpoint público para informações básicas do site"""
    site_configs = SiteConfiguration.get_configs_by_category('site')
    seo_configs = SiteConfiguration.get_configs_by_category('seo')
    social_configs = SiteConfiguration.get_configs_by_category('social')
    
    return Response({
        'site': site_configs,
        'seo': seo_configs,
        'social': social_configs
    })


