# Exemplos de Integração com React Frontend

## Configuração do Axios

```javascript
// src/api/axios.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## Serviços de Autenticação

```javascript
// src/services/authService.js
import api from '../api/axios';

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password
      });
      
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro no login'
      };
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await api.post('/auth/register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Verificar se está logado
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
```

## Serviços de Posts

```javascript
// src/services/postService.js
import api from '../api/axios';

export const postService = {
  // Listar posts
  async getPosts(params = {}) {
    try {
      const response = await api.get('/posts/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: 'Erro ao carregar posts' };
    }
  },

  // Obter post por slug
  async getPost(slug) {
    try {
      const response = await api.get(`/posts/${slug}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: 'Post não encontrado' };
    }
  },

  // Criar post
  async createPost(postData) {
    try {
      const response = await api.post('/posts/', postData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Atualizar post
  async updatePost(slug, postData) {
    try {
      const response = await api.put(`/posts/${slug}/`, postData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Deletar post
  async deletePost(slug) {
    try {
      await api.delete(`/posts/${slug}/`);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Erro ao deletar post' };
    }
  },

  // Meus posts
  async getMyPosts() {
    try {
      const response = await api.get('/posts/my_posts/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: 'Erro ao carregar seus posts' };
    }
  },

  // Alternar publicação
  async togglePublish(slug) {
    try {
      const response = await api.post(`/posts/${slug}/toggle_publish/`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: 'Erro ao alterar publicação' };
    }
  }
};
```

## Componente de Login

```jsx
// src/components/Login.jsx
import React, { useState } from 'react';
import { authService } from '../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(formData.email, formData.password);
    
    if (result.success) {
      onLogin(result.user);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Senha:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default Login;
```

## Componente de Lista de Posts

```jsx
// src/components/PostList.jsx
import React, { useState, useEffect } from 'react';
import { postService } from '../services/postService';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPosts();
  }, [search]);

  const loadPosts = async () => {
    setLoading(true);
    const result = await postService.getPosts({ search });
    
    if (result.success) {
      setPosts(result.data.results);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <div>
        {posts.map(post => (
          <div key={post.id} className="post-item">
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <small>Por {post.author} em {new Date(post.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;
```

## Context de Autenticação

```jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Uso no App Principal

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import PostList from './components/PostList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/" element={<PostList />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

