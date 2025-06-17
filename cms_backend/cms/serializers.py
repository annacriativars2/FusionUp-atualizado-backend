from rest_framework import serializers
from .models import Post, SiteConfiguration


class PostSerializer(serializers.ModelSerializer):
    """Serializer para o modelo Post"""
    
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    excerpt = serializers.CharField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'content',
            'slug',
            'author',
            'author_id',
            'is_published',
            'created_at',
            'updated_at',
            'excerpt'
        ]
        read_only_fields = ['id', 'author', 'author_id', 'created_at', 'updated_at', 'excerpt']
    
    def create(self, validated_data):
        """Cria um novo post com o autor atual"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PostListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de posts"""
    
    author = serializers.StringRelatedField(read_only=True)
    excerpt = serializers.CharField(read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'slug',
            'author',
            'is_published',
            'created_at',
            'updated_at',
            'excerpt'
        ]


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criação e atualização de posts"""
    
    class Meta:
        model = Post
        fields = [
            'title',
            'content',
            'slug',
            'is_published'
        ]
        extra_kwargs = {
            'slug': {'required': False}
        }
    
    def validate_slug(self, value):
        """Valida se o slug é único"""
        if value:
            instance = getattr(self, 'instance', None)
            if Post.objects.filter(slug=value).exclude(pk=instance.pk if instance else None).exists():
                raise serializers.ValidationError("Este slug já está em uso.")
        return value


class SiteConfigurationSerializer(serializers.ModelSerializer):
    """Serializer para configurações do sistema"""
    
    value_typed = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteConfiguration
        fields = [
            'id',
            'key',
            'value',
            'value_typed',
            'default_value',
            'category',
            'type',
            'label',
            'description',
            'is_required',
            'is_public',
            'order',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'value_typed']
    
    def get_value_typed(self, obj):
        """Retorna o valor convertido para o tipo apropriado"""
        return obj.get_value()


class SiteConfigurationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de configurações"""
    
    class Meta:
        model = SiteConfiguration
        fields = ['value']
    
    def validate_value(self, value):
        """Valida o valor baseado no tipo da configuração"""
        config_type = self.instance.type if self.instance else 'text'
        
        if config_type == 'email' and value:
            from django.core.validators import validate_email
            try:
                validate_email(value)
            except serializers.ValidationError:
                raise serializers.ValidationError("Email inválido")
        
        elif config_type == 'url' and value:
            from django.core.validators import URLValidator
            validator = URLValidator()
            try:
                validator(value)
            except serializers.ValidationError:
                raise serializers.ValidationError("URL inválida")
        
        elif config_type == 'number' and value:
            try:
                float(value)
            except ValueError:
                raise serializers.ValidationError("Número inválido")
        
        elif config_type == 'boolean' and value:
            if str(value).lower() not in ['true', 'false', '1', '0', 'yes', 'no']:
                raise serializers.ValidationError("Valor booleano inválido")
        
        elif config_type == 'json' and value:
            import json
            try:
                json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("JSON inválido")
        
        return value


class SiteConfigurationCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de novas configurações"""
    
    class Meta:
        model = SiteConfiguration
        fields = [
            'key',
            'value',
            'default_value',
            'category',
            'type',
            'label',
            'description',
            'is_required',
            'is_public',
            'order'
        ]
    
    def validate_key(self, value):
        """Valida se a chave é única"""
        if SiteConfiguration.objects.filter(key=value).exists():
            raise serializers.ValidationError("Esta chave já existe")
        return value


class PublicConfigurationSerializer(serializers.ModelSerializer):
    """Serializer para configurações públicas"""
    
    value_typed = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteConfiguration
        fields = ['key', 'value_typed', 'label']
    
    def get_value_typed(self, obj):
        """Retorna o valor convertido para o tipo apropriado"""
        return obj.get_value()


class ConfigurationsByCategorySerializer(serializers.Serializer):
    """Serializer para agrupar configurações por categoria"""
    
    category = serializers.CharField()
    label = serializers.CharField()
    configurations = SiteConfigurationSerializer(many=True)

