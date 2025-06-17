from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import json

User = get_user_model()


class Post(models.Model):
    """Modelo para posts do blog"""
    
    title = models.CharField(
        max_length=200, 
        verbose_name="Título",
        help_text="Título do post"
    )
    content = models.TextField(
        verbose_name="Conteúdo",
        help_text="Conteúdo completo do post"
    )
    slug = models.SlugField(
        max_length=200, 
        unique=True,
        verbose_name="Slug",
        help_text="URL amigável (será gerada automaticamente se não fornecida)"
    )
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name="Autor"
    )
    is_published = models.BooleanField(
        default=False, 
        verbose_name="Publicado",
        help_text="Se o post está publicado e visível publicamente"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, 
        verbose_name="Criado em"
    )
    updated_at = models.DateTimeField(
        auto_now=True, 
        verbose_name="Atualizado em"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Gera slug automaticamente se não fornecido"""
        if not self.slug:
            self.slug = slugify(self.title)
            
            # Garantir que o slug seja único
            original_slug = self.slug
            counter = 1
            while Post.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        
        super().save(*args, **kwargs)
    
    @property
    def excerpt(self):
        """Retorna um resumo do conteúdo"""
        if len(self.content) > 150:
            return self.content[:150] + "..."
        return self.content


class SiteConfiguration(models.Model):
    """
    Modelo para armazenar configurações do sistema de forma flexível
    """
    
    CATEGORY_CHOICES = [
        ('site', 'Configurações do Site'),
        ('seo', 'Configurações de SEO'),
        ('email', 'Configurações de Email'),
        ('media', 'Configurações de Mídia'),
        ('general', 'Configurações Gerais'),
        ('social', 'Redes Sociais'),
        ('analytics', 'Analytics'),
    ]
    
    TYPE_CHOICES = [
        ('text', 'Texto'),
        ('textarea', 'Texto Longo'),
        ('number', 'Número'),
        ('boolean', 'Verdadeiro/Falso'),
        ('email', 'Email'),
        ('url', 'URL'),
        ('json', 'JSON'),
        ('file', 'Arquivo'),
    ]
    
    key = models.CharField(
        max_length=100, 
        unique=True, 
        help_text="Chave única para identificar a configuração"
    )
    value = models.TextField(
        blank=True, 
        null=True,
        help_text="Valor da configuração"
    )
    default_value = models.TextField(
        blank=True, 
        null=True,
        help_text="Valor padrão da configuração"
    )
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        default='general',
        help_text="Categoria da configuração"
    )
    type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES, 
        default='text',
        help_text="Tipo de dado da configuração"
    )
    label = models.CharField(
        max_length=200,
        help_text="Nome amigável da configuração"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Descrição da configuração"
    )
    is_required = models.BooleanField(
        default=False,
        help_text="Se a configuração é obrigatória"
    )
    is_public = models.BooleanField(
        default=False,
        help_text="Se a configuração pode ser acessada publicamente"
    )
    order = models.IntegerField(
        default=0,
        help_text="Ordem de exibição"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'order', 'label']
        verbose_name = 'Configuração do Sistema'
        verbose_name_plural = 'Configurações do Sistema'
    
    def __str__(self):
        return f"{self.label} ({self.key})"
    
    def clean(self):
        """Validação personalizada"""
        if self.is_required and not self.value and not self.default_value:
            raise ValidationError(f"Configuração obrigatória '{self.key}' deve ter um valor ou valor padrão")
        
        # Validar tipos específicos
        if self.value:
            if self.type == 'email':
                from django.core.validators import validate_email
                try:
                    validate_email(self.value)
                except ValidationError:
                    raise ValidationError(f"'{self.value}' não é um email válido")
            
            elif self.type == 'url':
                from django.core.validators import URLValidator
                validator = URLValidator()
                try:
                    validator(self.value)
                except ValidationError:
                    raise ValidationError(f"'{self.value}' não é uma URL válida")
            
            elif self.type == 'number':
                try:
                    float(self.value)
                except ValueError:
                    raise ValidationError(f"'{self.value}' não é um número válido")
            
            elif self.type == 'boolean':
                if self.value.lower() not in ['true', 'false', '1', '0', 'yes', 'no']:
                    raise ValidationError(f"'{self.value}' não é um valor booleano válido")
            
            elif self.type == 'json':
                try:
                    json.loads(self.value)
                except json.JSONDecodeError:
                    raise ValidationError(f"'{self.value}' não é um JSON válido")
    
    def get_value(self):
        """Retorna o valor convertido para o tipo apropriado"""
        value = self.value if self.value is not None else self.default_value
        
        if value is None:
            return None
        
        if self.type == 'number':
            try:
                return float(value) if '.' in str(value) else int(value)
            except ValueError:
                return value
        
        elif self.type == 'boolean':
            return str(value).lower() in ['true', '1', 'yes', 'on']
        
        elif self.type == 'json':
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        
        return value
    
    def set_value(self, value):
        """Define o valor convertendo para string se necessário"""
        if self.type == 'json' and not isinstance(value, str):
            self.value = json.dumps(value)
        elif self.type == 'boolean':
            self.value = 'true' if value else 'false'
        else:
            self.value = str(value) if value is not None else None
    
    @classmethod
    def get_config(cls, key, default=None):
        """Método utilitário para obter uma configuração"""
        try:
            config = cls.objects.get(key=key)
            return config.get_value()
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_config(cls, key, value):
        """Método utilitário para definir uma configuração"""
        try:
            config = cls.objects.get(key=key)
            config.set_value(value)
            config.save()
            return config
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_public_configs(cls):
        """Retorna todas as configurações públicas"""
        configs = cls.objects.filter(is_public=True)
        return {config.key: config.get_value() for config in configs}
    
    @classmethod
    def get_configs_by_category(cls, category):
        """Retorna configurações por categoria"""
        configs = cls.objects.filter(category=category)
        return {config.key: config.get_value() for config in configs}


def create_default_configurations():
    """Função para criar configurações padrão do sistema"""
    default_configs = [
        # Configurações do Site
        {
            'key': 'site_name',
            'label': 'Nome do Site',
            'description': 'Nome principal do site',
            'category': 'site',
            'type': 'text',
            'default_value': 'Meu CMS',
            'is_required': True,
            'is_public': True,
            'order': 1
        },
        {
            'key': 'site_description',
            'label': 'Descrição do Site',
            'description': 'Descrição breve do site',
            'category': 'site',
            'type': 'textarea',
            'default_value': 'Sistema de gerenciamento de conteúdo',
            'is_public': True,
            'order': 2
        },
        {
            'key': 'site_logo',
            'label': 'Logo do Site',
            'description': 'URL ou caminho para o logo',
            'category': 'site',
            'type': 'url',
            'is_public': True,
            'order': 3
        },
        {
            'key': 'site_favicon',
            'label': 'Favicon',
            'description': 'URL ou caminho para o favicon',
            'category': 'site',
            'type': 'url',
            'is_public': True,
            'order': 4
        },
        
        # Configurações de SEO
        {
            'key': 'seo_title',
            'label': 'Título SEO',
            'description': 'Título padrão para SEO',
            'category': 'seo',
            'type': 'text',
            'is_public': True,
            'order': 1
        },
        {
            'key': 'seo_description',
            'label': 'Descrição SEO',
            'description': 'Meta descrição padrão',
            'category': 'seo',
            'type': 'textarea',
            'is_public': True,
            'order': 2
        },
        {
            'key': 'seo_keywords',
            'label': 'Palavras-chave SEO',
            'description': 'Palavras-chave separadas por vírgula',
            'category': 'seo',
            'type': 'textarea',
            'is_public': True,
            'order': 3
        },
        
        # Configurações de Email
        {
            'key': 'email_from_name',
            'label': 'Nome do Remetente',
            'description': 'Nome que aparece nos emails enviados',
            'category': 'email',
            'type': 'text',
            'default_value': 'Meu CMS',
            'order': 1
        },
        {
            'key': 'email_from_address',
            'label': 'Email do Remetente',
            'description': 'Email que aparece como remetente',
            'category': 'email',
            'type': 'email',
            'order': 2
        },
        {
            'key': 'email_contact',
            'label': 'Email de Contato',
            'description': 'Email para contato geral',
            'category': 'email',
            'type': 'email',
            'is_public': True,
            'order': 3
        },
        
        # Configurações Gerais
        {
            'key': 'timezone',
            'label': 'Fuso Horário',
            'description': 'Fuso horário do sistema',
            'category': 'general',
            'type': 'text',
            'default_value': 'America/Sao_Paulo',
            'order': 1
        },
        {
            'key': 'language',
            'label': 'Idioma',
            'description': 'Idioma padrão do sistema',
            'category': 'general',
            'type': 'text',
            'default_value': 'pt-br',
            'order': 2
        },
        {
            'key': 'posts_per_page',
            'label': 'Posts por Página',
            'description': 'Número de posts exibidos por página',
            'category': 'general',
            'type': 'number',
            'default_value': '10',
            'order': 3
        },
        
        # Redes Sociais
        {
            'key': 'social_facebook',
            'label': 'Facebook',
            'description': 'URL do perfil no Facebook',
            'category': 'social',
            'type': 'url',
            'is_public': True,
            'order': 1
        },
        {
            'key': 'social_twitter',
            'label': 'Twitter',
            'description': 'URL do perfil no Twitter',
            'category': 'social',
            'type': 'url',
            'is_public': True,
            'order': 2
        },
        {
            'key': 'social_instagram',
            'label': 'Instagram',
            'description': 'URL do perfil no Instagram',
            'category': 'social',
            'type': 'url',
            'is_public': True,
            'order': 3
        },
        {
            'key': 'social_linkedin',
            'label': 'LinkedIn',
            'description': 'URL do perfil no LinkedIn',
            'category': 'social',
            'type': 'url',
            'is_public': True,
            'order': 4
        },
    ]
    
    from django.db import transaction
    
    with transaction.atomic():
        for config_data in default_configs:
            SiteConfiguration.objects.get_or_create(
                key=config_data['key'],
                defaults=config_data
            )

