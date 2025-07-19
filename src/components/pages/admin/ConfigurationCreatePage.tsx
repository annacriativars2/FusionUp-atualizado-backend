import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { configurationService } from '../../../services/configurationService';
import { Link, useNavigate } from 'react-router-dom';

const ConfigurationCreatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    value: '',
    default_value: '',
    category: 'general',
    type: 'text',
    is_required: false,
    is_public: false,
    order: 0
  });

  useEffect(() => {
    if (user?.is_staff) {
      loadCategories();
      loadTypes();
    }
  }, [user]);

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

  const loadTypes = async () => {
    try {
      const result = await configurationService.getTypes();
      if (result.success) {
        setTypes(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar tipos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await configurationService.createConfiguration(formData);
      if (result.success) {
        navigate('/admin/configurations');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erro ao criar configuração');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Apenas administradores podem criar configurações.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Nova Configuração</h1>
              <p className="mt-1 text-sm text-gray-600">
                Criar uma nova configuração do sistema
              </p>
            </div>
            <Link
              to="/admin/configurations"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Voltar às Configurações
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagens de erro */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Identificação */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Identificação</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave *
                  </label>
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: site_name"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Identificador único (apenas letras, números e underscore)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome/Label *
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Nome do Site"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Nome amigável da configuração
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição detalhada da configuração..."
                />
              </div>
            </div>

            {/* Categorização */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Categorização</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {types.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ordem de exibição (menor = primeiro)
                  </p>
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Valores</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Atual
                  </label>
                  {formData.type === 'textarea' ? (
                    <textarea
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : formData.type === 'boolean' ? (
                    <select
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  ) : (
                    <input
                      type={formData.type === 'number' ? 'number' : formData.type === 'email' ? 'email' : 'text'}
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Padrão
                  </label>
                  {formData.type === 'textarea' ? (
                    <textarea
                      name="default_value"
                      value={formData.default_value}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : formData.type === 'boolean' ? (
                    <select
                      name="default_value"
                      value={formData.default_value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  ) : (
                    <input
                      type={formData.type === 'number' ? 'number' : formData.type === 'email' ? 'email' : 'text'}
                      name="default_value"
                      value={formData.default_value}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Valor usado quando não há valor definido
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_required"
                    checked={formData.is_required}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Configuração obrigatória
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Configuração pública (acessível sem autenticação)
                  </label>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-6">
              <Link
                to="/admin/configurations"
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Configuração'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationCreatePage;

