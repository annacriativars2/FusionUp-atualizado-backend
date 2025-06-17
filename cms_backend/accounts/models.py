from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Manager personalizado para o modelo User"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Cria e salva um usuário comum"""
        if not email:
            raise ValueError('O email é obrigatório')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Cria e salva um superusuário"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser deve ter is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Modelo de usuário personalizado que usa email como identificador"""
    
    email = models.EmailField(
        verbose_name='Email',
        max_length=255,
        unique=True,
    )
    first_name = models.CharField(
        verbose_name='Nome',
        max_length=30,
        blank=True
    )
    last_name = models.CharField(
        verbose_name='Sobrenome',
        max_length=30,
        blank=True
    )
    is_active = models.BooleanField(
        verbose_name='Ativo',
        default=True
    )
    is_staff = models.BooleanField(
        verbose_name='Staff',
        default=False
    )
    date_joined = models.DateTimeField(
        verbose_name='Data de cadastro',
        auto_now_add=True
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Retorna o nome completo do usuário"""
        return f'{self.first_name} {self.last_name}'.strip()
    
    def get_short_name(self):
        """Retorna o primeiro nome do usuário"""
        return self.first_name

