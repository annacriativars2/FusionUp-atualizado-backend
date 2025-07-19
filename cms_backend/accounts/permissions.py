from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada que permite apenas ao dono do objeto editá-lo.
    """

    def has_object_permission(self, request, view, obj):
        # Permissões de leitura são permitidas para qualquer requisição,
        # então sempre permitimos requisições GET, HEAD ou OPTIONS.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Permissões de escrita são apenas permitidas ao dono do objeto.
        return obj.author == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada que permite apenas administradores editarem.
    """

    def has_permission(self, request, view):
        # Permissões de leitura são permitidas para qualquer requisição
        if request.method in permissions.SAFE_METHODS:
            return True

        # Permissões de escrita são apenas para administradores
        return request.user and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permissão personalizada que permite ao dono ou administradores editarem.
    """

    def has_object_permission(self, request, view, obj):
        # Administradores têm acesso total
        if request.user and request.user.is_staff:
            return True

        # Donos podem editar seus próprios objetos
        return obj.author == request.user


class IsUserOrAdmin(permissions.BasePermission):
    """
    Permissão personalizada para perfis de usuário.
    Permite que usuários vejam/editem apenas seu próprio perfil,
    exceto administradores que podem ver/editar todos.
    """

    def has_object_permission(self, request, view, obj):
        # Administradores têm acesso total
        if request.user and request.user.is_staff:
            return True

        # Usuários podem acessar apenas seu próprio perfil
        return obj == request.user

