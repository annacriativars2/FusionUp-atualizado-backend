from django.contrib import admin
from .models import Post, SiteConfiguration


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """Admin para o modelo Post"""
    
    list_display = ('title', 'author', 'is_published', 'created_at', 'updated_at')
    list_filter = ('is_published', 'created_at', 'updated_at', 'author')
    search_fields = ('title', 'content', 'slug')
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Conteúdo', {
            'fields': ('title', 'slug', 'content', 'author')
        }),
        ('Configurações', {
            'fields': ('is_published',)
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def save_model(self, request, obj, form, change):
        """Define o autor como o usuário atual se não especificado"""
        if not change:  # Se é um novo post
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    """Admin para configurações do sistema"""
    
    list_display = ('label', 'key', 'category', 'type', 'is_required', 'is_public', 'order')
    list_filter = ('category', 'type', 'is_required', 'is_public')
    search_fields = ('key', 'label', 'description')
    ordering = ('category', 'order', 'label')
    
    fieldsets = (
        ('Identificação', {
            'fields': ('key', 'label', 'description')
        }),
        ('Valor', {
            'fields': ('value', 'default_value', 'type')
        }),
        ('Categorização', {
            'fields': ('category', 'order')
        }),
        ('Configurações', {
            'fields': ('is_required', 'is_public')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_form(self, request, obj=None, **kwargs):
        """Customiza o formulário baseado no tipo"""
        form = super().get_form(request, obj, **kwargs)
        
        if obj and obj.type == 'textarea':
            form.base_fields['value'].widget = admin.widgets.AdminTextareaWidget()
        elif obj and obj.type == 'boolean':
            form.base_fields['value'].widget = admin.widgets.AdminRadioSelect(
                choices=[('true', 'Sim'), ('false', 'Não')]
            )
        
        return form
    
    actions = ['reset_to_default', 'make_public', 'make_private']
    
    def reset_to_default(self, request, queryset):
        """Ação para resetar configurações para valor padrão"""
        count = 0
        for config in queryset:
            if config.default_value is not None:
                config.value = config.default_value
                config.save()
                count += 1
        
        self.message_user(
            request,
            f'{count} configurações foram resetadas para o valor padrão.'
        )
    reset_to_default.short_description = "Resetar para valor padrão"
    
    def make_public(self, request, queryset):
        """Ação para tornar configurações públicas"""
        count = queryset.update(is_public=True)
        self.message_user(
            request,
            f'{count} configurações foram tornadas públicas.'
        )
    make_public.short_description = "Tornar público"
    
    def make_private(self, request, queryset):
        """Ação para tornar configurações privadas"""
        count = queryset.update(is_public=False)
        self.message_user(
            request,
            f'{count} configurações foram tornadas privadas.'
        )
    make_private.short_description = "Tornar privado"

