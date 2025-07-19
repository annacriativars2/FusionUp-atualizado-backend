# CMS Backend Django

Um backend completo em Django para sistema de gerenciamento de conteúdo (CMS) com autenticação JWT e API REST.

## 🚀 Características

- **Autenticação JWT** com djangorestframework-simplejwt
- **Login com email** como identificador principal
- **CRUD completo** para posts
- **Permissões granulares** (leitura pública, escrita autenticada)
- **CORS configurado** para integração com frontend React
- **API REST** com paginação e filtros
- **Admin Django** personalizado
- **Documentação completa** da API

## 📋 Pré-requisitos

- Python 3.11+
- pip
- virtualenv (recomendado)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd cms_backend
```

2. **Crie e ative o ambiente virtual**
```bash
python3.11 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
```

4. **Execute as migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Crie um superusuário**
```bash
python manage.py createsuperuser
```

6. **Inicie o servidor**
```bash
python manage.py runserver 0.0.0.0:8000
```

## 📁 Estrutura do Projeto

```
cms_backend/
├── cms_backend/          # Configurações do projeto
│   ├── settings.py       # Configurações principais
│   ├── urls.py          # URLs principais
│   └── wsgi.py          # WSGI config
├── accounts/            # App de autenticação
│   ├── models.py        # Modelo User customizado
│   ├── serializers.py   # Serializers JWT
│   ├── views.py         # Views de auth
│   ├── urls.py          # URLs de auth
│   └── admin.py         # Admin personalizado
├── cms/                 # App do CMS
│   ├── models.py        # Modelo Post
│   ├── serializers.py   # Serializers de posts
│   ├── views.py         # ViewSets CRUD
│   ├── urls.py          # URLs da API
│   ├── permissions.py   # Permissões customizadas
│   └── admin.py         # Admin de posts
├── manage.py
├── test_api.py          # Script de teste
├── API_DOCUMENTATION.md # Documentação da API
└── REACT_INTEGRATION.md # Exemplos React
```

## 🔧 Configuração

### Variáveis de Ambiente (Produção)

Crie um arquivo `.env` para produção:

```env
SECRET_KEY=sua_chave_secreta_aqui
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
DATABASE_URL=postgres://user:pass@localhost/dbname
CORS_ALLOWED_ORIGINS=https://seu-frontend.com
```

### CORS

Para adicionar novos domínios frontend, edite `CORS_ALLOWED_ORIGINS` em `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://seu-frontend.com",
]
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login (retorna JWT)
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/profile/` - Perfil do usuário

### Posts
- `GET /api/posts/` - Listar posts (público)
- `POST /api/posts/` - Criar post (autenticado)
- `GET /api/posts/{slug}/` - Detalhes do post
- `PUT /api/posts/{slug}/` - Atualizar post (apenas autor)
- `DELETE /api/posts/{slug}/` - Deletar post (apenas autor)
- `GET /api/posts/my_posts/` - Meus posts (autenticado)
- `POST /api/posts/{slug}/toggle_publish/` - Alternar publicação

## 🧪 Testes

Execute o script de teste incluído:

```bash
python test_api.py
```

## 🔐 Autenticação JWT

### Configurações
- **Access Token**: 60 minutos
- **Refresh Token**: 7 dias
- **Rotação**: Refresh tokens são rotacionados

### Uso no Frontend
```javascript
// Headers para requisições autenticadas
headers: {
  'Authorization': 'Bearer ' + accessToken
}
```

## 👥 Permissões

- **Leitura de posts**: Pública
- **Criação de posts**: Usuários autenticados
- **Edição/Exclusão**: Apenas o autor do post
- **Admin**: Acesso total via Django Admin

## 🌐 Integração com React

Veja exemplos completos em `REACT_INTEGRATION.md`:
- Configuração do Axios
- Serviços de autenticação
- Componentes React
- Context de autenticação

## 📖 Documentação

- **API**: `API_DOCUMENTATION.md`
- **React**: `REACT_INTEGRATION.md`
- **Admin**: Acesse `/admin/` após criar superusuário

## 🚀 Deploy

### Preparação para Produção

1. **Configure variáveis de ambiente**
2. **Use banco PostgreSQL**
3. **Configure servidor web** (Nginx + Gunicorn)
4. **Configure HTTPS**
5. **Atualize CORS_ALLOWED_ORIGINS**

### Exemplo com Gunicorn
```bash
pip install gunicorn
gunicorn cms_backend.wsgi:application --bind 0.0.0.0:8000
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs do Django

---

**Desenvolvido com ❤️ usando Django REST Framework**

# cms_backend_configuracoes_completo
