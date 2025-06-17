#!/usr/bin/env python3
"""
Script para testar as APIs de configurações do sistema
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_configurations_api():
    print("🧪 Testando APIs de Configurações do Sistema\n")
    
    # 1. Login como admin
    print("1. Fazendo login como administrador...")
    login_data = {
        "email": "admin@example.com",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=login_data)
    if response.status_code == 200:
        tokens = response.json()
        headers = {"Authorization": f"Bearer {tokens['access']}"}
        print("✅ Login realizado com sucesso!")
    else:
        print("❌ Erro no login:", response.text)
        return
    
    # 2. Listar todas as configurações
    print("\n2. Listando todas as configurações...")
    response = requests.get(f"{BASE_URL}/api/configurations/", headers=headers)
    if response.status_code == 200:
        configs = response.json()
        print(f"✅ {len(configs['results'])} configurações encontradas")
        for config in configs['results'][:3]:  # Mostrar apenas as 3 primeiras
            print(f"   - {config['label']} ({config['key']}): {config['value_typed']}")
    else:
        print("❌ Erro ao listar configurações:", response.text)
    
    # 3. Listar configurações agrupadas por categoria
    print("\n3. Listando configurações por categoria...")
    response = requests.get(f"{BASE_URL}/api/configurations/?group_by_category=true", headers=headers)
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ {len(categories)} categorias encontradas:")
        for category in categories:
            print(f"   - {category['label']}: {len(category['configurations'])} configurações")
    else:
        print("❌ Erro ao listar por categoria:", response.text)
    
    # 4. Buscar configurações
    print("\n4. Buscando configurações com 'site'...")
    response = requests.get(f"{BASE_URL}/api/configurations/?search=site", headers=headers)
    if response.status_code == 200:
        configs = response.json()
        print(f"✅ {len(configs['results'])} configurações encontradas na busca")
    else:
        print("❌ Erro na busca:", response.text)
    
    # 5. Atualizar uma configuração
    print("\n5. Atualizando configuração 'site_name'...")
    update_data = {"value": "Meu CMS Atualizado"}
    response = requests.patch(f"{BASE_URL}/api/configurations/site_name/", json=update_data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        print("✅ Configuração atualizada:", result['message'])
        print(f"   Novo valor: {result['configuration']['value_typed']}")
    else:
        print("❌ Erro ao atualizar:", response.text)
    
    # 6. Criar nova configuração
    print("\n6. Criando nova configuração...")
    new_config = {
        "key": "test_config",
        "label": "Configuração de Teste",
        "description": "Uma configuração criada para teste",
        "category": "general",
        "type": "text",
        "value": "Valor de teste",
        "is_public": True,
        "order": 999
    }
    response = requests.post(f"{BASE_URL}/api/configurations/", json=new_config, headers=headers)
    if response.status_code == 201:
        result = response.json()
        print("✅ Nova configuração criada:", result['message'])
    else:
        print("❌ Erro ao criar configuração:", response.text)
    
    # 7. Atualização em lote
    print("\n7. Testando atualização em lote...")
    bulk_data = {
        "configurations": [
            {"key": "site_name", "value": "CMS Django React"},
            {"key": "site_description", "value": "Sistema moderno de gerenciamento de conteúdo"}
        ]
    }
    response = requests.post(f"{BASE_URL}/api/configurations/bulk_update/", json=bulk_data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        print("✅ Atualização em lote:", result['message'])
    else:
        print("❌ Erro na atualização em lote:", response.text)
    
    # 8. Testar endpoint público
    print("\n8. Testando endpoint público de configurações...")
    response = requests.get(f"{BASE_URL}/api/public/configurations/")
    if response.status_code == 200:
        public_configs = response.json()
        print(f"✅ {len(public_configs)} configurações públicas disponíveis:")
        for key, value in list(public_configs.items())[:3]:  # Mostrar apenas as 3 primeiras
            print(f"   - {key}: {value}")
    else:
        print("❌ Erro ao acessar configurações públicas:", response.text)
    
    # 9. Testar endpoint de informações do site
    print("\n9. Testando endpoint de informações do site...")
    response = requests.get(f"{BASE_URL}/api/public/site-info/")
    if response.status_code == 200:
        site_info = response.json()
        print("✅ Informações do site obtidas:")
        print(f"   - Site: {len(site_info.get('site', {}))} configurações")
        print(f"   - SEO: {len(site_info.get('seo', {}))} configurações")
        print(f"   - Social: {len(site_info.get('social', {}))} configurações")
    else:
        print("❌ Erro ao obter informações do site:", response.text)
    
    # 10. Deletar configuração de teste
    print("\n10. Deletando configuração de teste...")
    response = requests.delete(f"{BASE_URL}/api/configurations/test_config/", headers=headers)
    if response.status_code == 204:
        print("✅ Configuração de teste deletada com sucesso!")
    else:
        print("❌ Erro ao deletar configuração:", response.text)
    
    print("\n🎉 Teste das APIs de configurações concluído!")

if __name__ == "__main__":
    test_configurations_api()

