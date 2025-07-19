from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada que permite apenas ao autor do post
    editar ou deletar seus próprios posts.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permissões de leitura são permitidas para qualquer requisição,
        # então sempre permitimos requisições GET, HEAD ou OPTIONS.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permissões de escrita são apenas para o autor do post.
        return obj.author == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada genérica para objetos que têm um campo 'owner'.
    """
    
    def has_object_permission(self, request, view, obj):
        # Permissões de leitura para qualquer requisição
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permissões de escrita apenas para o proprietário
        return obj.owner == request.user

