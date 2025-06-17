from rest_framework import status, generics, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserListSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserProfileSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """View personalizada para login com JWT"""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Endpoint para registro de novos usuários"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Usuário criado com sucesso!',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'message': 'Erro ao criar usuário',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_user_profile(request):
    """Endpoint para obter perfil do usuário autenticado"""
    serializer = UserProfileSerializer(request.user)
    return Response({
        'user': serializer.data
    })


@api_view(['PUT', 'PATCH'])
def update_user_profile(request):
    """Endpoint para atualizar perfil do usuário autenticado"""
    serializer = UserProfileSerializer(
        request.user,
        data=request.data,
        partial=request.method == 'PATCH'
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Perfil atualizado com sucesso!',
            'user': serializer.data
        })
    
    return Response({
        'message': 'Erro ao atualizar perfil',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de usuários (apenas administradores)"""
    
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserListSerializer
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Lista todos os usuários com paginação e busca"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """Cria um novo usuário"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário criado com sucesso!',
                'user': UserListSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Erro ao criar usuário',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Atualiza um usuário existente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário atualizado com sucesso!',
                'user': UserListSerializer(user).data
            })
        
        return Response({
            'message': 'Erro ao atualizar usuário',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Deleta um usuário"""
        instance = self.get_object()
        
        # Impede que o usuário delete a si mesmo
        if instance == request.user:
            return Response({
                'message': 'Você não pode deletar sua própria conta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response({
            'message': 'Usuário deletado com sucesso!'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """Alterna o status de staff do usuário"""
        user = self.get_object()
        
        # Impede que o usuário remova seu próprio status de staff
        if user == request.user and user.is_staff:
            return Response({
                'message': 'Você não pode remover seu próprio status de administrador'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_staff = not user.is_staff
        user.save()
        
        return Response({
            'message': f'Status de administrador {"ativado" if user.is_staff else "desativado"} com sucesso!',
            'user': UserListSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Alterna o status ativo do usuário"""
        user = self.get_object()
        
        # Impede que o usuário desative sua própria conta
        if user == request.user:
            return Response({
                'message': 'Você não pode desativar sua própria conta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = not user.is_active
        user.save()
        
        return Response({
            'message': f'Usuário {"ativado" if user.is_active else "desativado"} com sucesso!',
            'user': UserListSerializer(user).data
        })

