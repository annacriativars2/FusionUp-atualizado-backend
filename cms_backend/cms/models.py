from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import json

User = get_user_model()


class Post(models.Model):
    """Modelo para posts do blog"""

    title = models.CharField(max_length=200, verbose_name="Título")
    content = models.TextField(verbose_name="Conteúdo")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts', verbose_name="Autor")
    is_published = models.BooleanField(default=False, verbose_name="Publicado")
    image = models.ImageField(upload_to='posts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
            original_slug = self.slug
            counter = 1
            while Post.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    @property
    def excerpt(self):
        return self.content[:150] + "..." if len(self.content) > 150 else self.content


class SiteConfiguration(models.Model):
    """Configurações dinâmicas do site"""

    CATEGORY_CHOICES = [
        ('site', 'Site'),
        ('email', 'Email'),
        ('seo', 'SEO'),
        ('social', 'Redes Sociais'),
        ('outros', 'Outros'),
    ]

    TYPE_CHOICES = [
        ('text', 'Texto'),
        ('textarea', 'Área de texto'),
        ('number', 'Número'),
        ('boolean', 'Booleano'),
        ('email', 'Email'),
        ('url', 'URL'),
        ('json', 'JSON'),
    ]

    key = models.CharField(max_length=100, unique=True)
    value = models.TextField(blank=True, null=True)
    default_value = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='outros')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='text')
    label = models.CharField(max_length=150, verbose_name="Rótulo")
    description = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.label} ({self.key})'

    def get_value(self):
        if self.type == 'number':
            try:
                return float(self.value)
            except:
                return None
        elif self.type == 'boolean':
            return str(self.value).lower() in ['true', '1', 'yes']
        elif self.type == 'json':
            try:
                return json.loads(self.value)
            except:
                return None
        return self.value or self.default_value

    def clean(self):
        if self.is_required and not self.value:
            raise ValidationError({'value': 'Este campo é obrigatório'})


class ContactMessage(models.Model):
    """Mensagens enviadas via formulário de contato"""

    name = models.CharField(max_length=150, verbose_name="Nome")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone")
    subject = models.CharField(max_length=200, verbose_name="Assunto")
    message = models.TextField(verbose_name="Mensagem")
    is_read = models.BooleanField(default=False, verbose_name="Lida")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Recebida em")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mensagem de Contato'
        verbose_name_plural = 'Mensagens de Contato'

    def __str__(self):
        return f'{self.name} - {self.subject}'
