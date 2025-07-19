#!/usr/bin/env python3
"""
Script de teste para as APIs de gerenciamento de usuários
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_user_management_apis():
    print("🧪 Testando APIs de Gerenciamento de Usuários")
    print("=" * 50)
    
    # 1. Login como admin
    print("\n1. Fazendo login como administrador...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens['access']
        print("✅ Login realizado com sucesso!")
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    else:
        print("❌ Erro no login:", response.text)
        return
    
    # 2. Listar usuários
    print("\n2. Listando usuários...")
    response = requests.get(f"{BASE_URL}/auth/users/", headers=headers)
    if response.status_code == 200:
        users_data = response.json()
        print(f"✅ {users_data['count']} usuários encontrados")
        for user in users_data['results']:
            print(f"   - {user['email']} ({'Admin' if user['is_staff'] else 'Usuário'})")
    else:
        print("❌ Erro ao listar usuários:", response.text)
    
    # 3. Criar novo usuário
    print("\n3. Criando novo usuário...")
    new_user_data = {
        "email": "teste@example.com",
        "first_name": "Usuário",
        "last_name": "Teste",
        "password": "senha123456",
        "password_confirm": "senha123456",
        "is_staff": False,
        "is_active": True
    }
    
    response = requests.post(f"{BASE_URL}/auth/users/", json=new_user_data, headers=headers)
    if response.status_code == 201:
        user_data = response.json()
        new_user_id = user_data['user']['id']
        print(f"✅ Usuário criado com sucesso! ID: {new_user_id}")
    else:
        print("❌ Erro ao criar usuário:", response.text)
        return
    
    # 4. Buscar usuário
    print("\n4. Buscando usuários...")
    response = requests.get(f"{BASE_URL}/auth/users/?search=teste", headers=headers)
    if response.status_code == 200:
        search_data = response.json()
        print(f"✅ {search_data['count']} usuários encontrados na busca")
    else:
        print("❌ Erro na busca:", response.text)
    
    # 5. Atualizar usuário
    print("\n5. Atualizando usuário...")
    update_data = {
        "first_name": "Usuário Atualizado",
        "last_name": "Teste Modificado"
    }
    
    response = requests.patch(f"{BASE_URL}/auth/users/{new_user_id}/", json=update_data, headers=headers)
    if response.status_code == 200:
        print("✅ Usuário atualizado com sucesso!")
    else:
        print("❌ Erro ao atualizar usuário:", response.text)
    
    # 6. Alternar status de staff
    print("\n6. Alternando status de administrador...")
    response = requests.post(f"{BASE_URL}/auth/users/{new_user_id}/toggle_staff/", headers=headers)
    if response.status_code == 200:
        print("✅ Status de administrador alterado!")
    else:
        print("❌ Erro ao alterar status:", response.text)
    
    # 7. Deletar usuário
    print("\n7. Deletando usuário...")
    response = requests.delete(f"{BASE_URL}/auth/users/{new_user_id}/", headers=headers)
    if response.status_code == 204:
        print("✅ Usuário deletado com sucesso!")
    else:
        print("❌ Erro ao deletar usuário:", response.text)
    
    print("\n🎉 Teste das APIs de gerenciamento de usuários concluído!")

if __name__ == "__main__":
    test_user_management_apis()

