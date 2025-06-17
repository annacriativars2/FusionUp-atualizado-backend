# API Documentation - CMS Backend Django

## Visão Geral

Este é um backend Django completo para um sistema de gerenciamento de conteúdo (CMS) com autenticação JWT e CRUD de posts.

## Base URL

```
http://localhost:8000
```

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header das requisições:

```
Authorization: Bearer <seu_token_aqui>
```

## Endpoints

### Autenticação

#### 1. Registro de Usuário
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "usuario@example.com",
  "first_name": "Nome",
  "last_name": "Sobrenome",
  "password": "senha123456",
  "password_confirm": "senha123456"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso!",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "Nome",
    "last_name": "Sobrenome"
  }
}
```

#### 2. Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha123456"
}
```

**Resposta (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "first_name": "Nome",
    "last_name": "Sobrenome",
    "is_staff": false
  }
}
```

#### 3. Refresh Token
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Perfil do Usuário
```http
GET /api/auth/profile/
Authorization: Bearer <token>
```

### Posts

#### 1. Listar Posts (Público)
```http
GET /api/posts/
```

**Parâmetros de Query:**
- `search`: Busca por título ou conteúdo
- `author`: Filtrar por email do autor
- `page`: Número da página (paginação)

**Resposta (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Meu Primeiro Post",
      "slug": "meu-primeiro-post",
      "author": "usuario@example.com",
      "is_published": true,
      "created_at": "2025-06-09T19:48:30.123456Z",
      "updated_at": "2025-06-09T19:48:30.123456Z",
      "excerpt": "Este é o conteúdo do meu primeiro post..."
    }
  ]
}
```

#### 2. Detalhes do Post (Público)
```http
GET /api/posts/{slug}/
```

#### 3. Criar Post (Autenticado)
```http
POST /api/posts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Título do Post",
  "content": "Conteúdo completo do post...",
  "slug": "titulo-do-post",  // Opcional, gerado automaticamente
  "is_published": true
}
```

#### 4. Atualizar Post (Apenas Autor)
```http
PUT /api/posts/{slug}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Título Atualizado",
  "content": "Conteúdo atualizado...",
  "is_published": false
}
```

#### 5. Deletar Post (Apenas Autor)
```http
DELETE /api/posts/{slug}/
Authorization: Bearer <token>
```

#### 6. Meus Posts (Autenticado)
```http
GET /api/posts/my_posts/
Authorization: Bearer <token>
```

#### 7. Alternar Publicação (Apenas Autor)
```http
POST /api/posts/{slug}/toggle_publish/
Authorization: Bearer <token>
```

## Códigos de Status

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Não encontrado
- `500`: Erro interno do servidor

## Configurações CORS

O backend está configurado para aceitar requisições de:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000`

Para adicionar outras origens, edite `CORS_ALLOWED_ORIGINS` em `settings.py`.

## Configurações JWT

- **Access Token**: Expira em 60 minutos
- **Refresh Token**: Expira em 7 dias
- **Rotação**: Refresh tokens são rotacionados a cada uso

