#!/usr/bin/env python3
"""
Script de teste para a API do CMS Django
"""

import requests
import json

# Configurações
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"
AUTH_BASE = f"{BASE_URL}/api/auth"

def test_api():
    """Testa os principais endpoints da API"""
    
    print("🚀 Iniciando testes da API do CMS...")
    
    # 1. Teste de registro de usuário
    print("\n1. Testando registro de usuário...")
    register_data = {
        "email": "teste@example.com",
        "first_name": "Usuário",
        "last_name": "Teste",
        "password": "senha123456",
        "password_confirm": "senha123456"
    }
    
    try:
        response = requests.post(f"{AUTH_BASE}/register/", json=register_data)
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.json()}")
    except Exception as e:
        print(f"Erro no registro: {e}")
    
    # 2. Teste de login
    print("\n2. Testando login...")
    login_data = {
        "email": "teste@example.com",
        "password": "senha123456"
    }
    
    try:
        response = requests.post(f"{AUTH_BASE}/login/", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"Token obtido: {access_token[:50]}...")
            
            # Headers para requisições autenticadas
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # 3. Teste de criação de post
            print("\n3. Testando criação de post...")
            post_data = {
                "title": "Meu Primeiro Post",
                "content": "Este é o conteúdo do meu primeiro post no CMS!",
                "is_published": True
            }
            
            response = requests.post(f"{API_BASE}/posts/", json=post_data, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Resposta: {response.json()}")
            
            # 4. Teste de listagem de posts
            print("\n4. Testando listagem de posts...")
            response = requests.get(f"{API_BASE}/posts/")
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                posts = response.json()
                print(f"Total de posts: {len(posts.get('results', []))}")
                
        else:
            print(f"Erro no login: {response.json()}")
            
    except Exception as e:
        print(f"Erro nos testes: {e}")
    
    print("\n✅ Testes concluídos!")

if __name__ == "__main__":
    test_api()

