import api from '../api/axios';

export const configurationService = {
  // Listar todas as configurações
  async getConfigurations(params = {}) {
    try {
      const response = await api.get('/api/configurations/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar configurações',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Listar configurações agrupadas por categoria
  async getConfigurationsByCategory() {
    try {
      const response = await api.get('/api/configurations/?group_by_category=true');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar configurações por categoria',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Obter uma configuração específica
  async getConfiguration(key) {
    try {
      const response = await api.get(`/api/configurations/${key}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar configuração',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Criar nova configuração
  async createConfiguration(configData) {
    try {
      const response = await api.post('/api/configurations/', configData);
      return {
        success: true,
        data: response.data.configuration,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar configuração',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Atualizar configuração
  async updateConfiguration(key, configData) {
    try {
      const response = await api.patch(`/api/configurations/${key}/`, configData);
      return {
        success: true,
        data: response.data.configuration,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar configuração',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Deletar configuração
  async deleteConfiguration(key) {
    try {
      const response = await api.delete(`/api/configurations/${key}/`);
      return {
        success: true,
        message: response.data?.message || 'Configuração deletada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar configuração',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Atualização em lote
  async bulkUpdateConfigurations(configurations) {
    try {
      const response = await api.post('/api/configurations/bulk_update/', {
        configurations
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro na atualização em lote',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Reset para valores padrão
  async resetToDefaults(category = null) {
    try {
      const data = category ? { category } : {};
      const response = await api.post('/api/configurations/reset_to_defaults/', data);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao resetar configurações',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Obter categorias disponíveis
  async getCategories() {
    try {
      const response = await api.get('/api/configurations/categories/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar categorias',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Obter tipos disponíveis
  async getTypes() {
    try {
      const response = await api.get('/api/configurations/types/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar tipos',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Obter configurações públicas (sem autenticação)
  async getPublicConfigurations() {
    try {
      const response = await api.get('/api/public/configurations/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar configurações públicas',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Obter informações do site (público)
  async getSiteInfo() {
    try {
      const response = await api.get('/api/public/site-info/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar informações do site',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};

