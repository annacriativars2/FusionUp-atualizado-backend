import api from '../api/axios';

export const userService = {
  // Listar usuários (admin)
  async getUsers(search = '') {
    try {
      const params = search ? { search } : {};
      const response = await api.get('/auth/users/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar usuários',
        errors: error.response?.data?.errors
      };
    }
  },

  // Criar usuário (admin)
  async createUser(userData) {
    try {
      const response = await api.post('/auth/users/', userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar usuário',
        errors: error.response?.data?.errors
      };
    }
  },

  // Atualizar usuário (admin)
  async updateUser(userId, userData) {
    try {
      const response = await api.patch(`/auth/users/${userId}/`, userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar usuário',
        errors: error.response?.data?.errors
      };
    }
  },

  // Deletar usuário (admin)
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/auth/users/${userId}/`);
      return {
        success: true,
        message: response.data?.message || 'Usuário deletado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar usuário'
      };
    }
  },

  // Alternar status de administrador (admin)
  async toggleStaff(userId) {
    try {
      const response = await api.post(`/auth/users/${userId}/toggle_staff/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar status de administrador'
      };
    }
  },

  // Alternar status ativo (admin)
  async toggleActive(userId) {
    try {
      const response = await api.post(`/auth/users/${userId}/toggle_active/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar status ativo'
      };
    }
  },

  // Obter perfil do usuário logado
  async getProfile() {
    try {
      const response = await api.get('/auth/profile/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar perfil'
      };
    }
  },

  // Atualizar perfil do usuário logado
  async updateProfile(userData) {
    try {
      const response = await api.patch('/auth/profile/update/', userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil',
        errors: error.response?.data?.errors
      };
    }
  }
};

