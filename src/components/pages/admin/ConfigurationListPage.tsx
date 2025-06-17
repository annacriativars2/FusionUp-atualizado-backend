import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { configurationService } from '../../../services/configurationService';
import { Link } from 'react-router-dom';

const ConfigurationListPage = () => {
  const { user } = useAuth();
  const [configurations, setConfigurations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (user?.is_staff) {
      loadConfigurations();
      loadCategories();
    }
  }, [user]);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const result = await configurationService.getConfigurationsByCategory();
      if (result.success) {
        setConfigurations(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await configurationService.getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const handleUpdateConfiguration = async (key, value) => {
    try {
      const result = await configurationService.updateConfiguration(key, { value });
      if (result.success) {
        setSuccess(result.message);
        setEditingConfig(null);
        setEditValue('');
        loadConfigurations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao atualizar configuração');
    }
  };

  const handleResetCategory = async (category) => {
    if (window.confirm(`Tem certeza que deseja resetar todas as configurações da categoria "${category}" para os valores padrão?`)) {
      try {
        const result = await configurationService.resetToDefaults(category);
        if (result.success) {
          setSuccess(result.message);
          loadConfigurations();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Erro ao resetar configurações');
      }
    }
  };

  const startEditing = (config) => {
    setEditingConfig(config.key);
    setEditValue(config.value || config.default_value || '');
  };

  const cancelEditing = () => {
    setEditingConfig(null);
    setEditValue('');
  };

  const saveEditing = () => {
    if (editingConfig) {
      handleUpdateConfiguration(editingConfig, editValue);
    }
  };

  const renderConfigurationInput = (config) => {
    const isEditing = editingConfig === config.key;
    const currentValue = config.value || config.default_value || '';

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-gray-900">
            {config.type === 'boolean' 
              ? (config.value_typed ? 'Sim' : 'Não')
              : (currentValue || 'Não definido')
            }
          </span>
          <button
            onClick={() => startEditing(config)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Editar
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {config.type === 'textarea' ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        ) : config.type === 'boolean' ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>
        ) : (
          <input
            type={config.type === 'number' ? 'number' : config.type === 'email' ? 'email' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={config.description}
          />
        )}
        <div className="flex space-x-2">
          <button
            onClick={saveEditing}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Salvar
          </button>
          <button
            onClick={cancelEditing}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  const filteredConfigurations = configurations.filter(category => {
    if (activeCategory !== 'all' && category.category !== activeCategory) {
      return false;
    }
    if (searchTerm) {
      return category.configurations.some(config =>
        config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar as configurações.</p>
          <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações do Sistema</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie as configurações do seu CMS
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Voltar ao Dashboard
              </Link>
              <Link
                to="/admin/configurations/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Nova Configuração
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagens */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar configurações
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite para buscar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Configurações por Categoria */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando configurações...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredConfigurations.map(category => (
              <div key={category.category} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.label}
                  </h2>
                  <button
                    onClick={() => handleResetCategory(category.category)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Resetar para Padrão
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {category.configurations
                      .filter(config => {
                        if (!searchTerm) return true;
                        return config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               config.description?.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map(config => (
                        <div key={config.key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{config.label}</h3>
                              <p className="text-sm text-gray-500">
                                {config.key} ({config.type})
                              </p>
                              {config.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {config.description}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              {config.is_required && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Obrigatório
                                </span>
                              )}
                              {config.is_public && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Público
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            {renderConfigurationInput(config)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredConfigurations.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma configuração encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationListPage;

