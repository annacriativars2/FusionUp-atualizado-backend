import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';

const UserEditPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    is_staff: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [userToEdit, setUserToEdit] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();

  // Verificar se o usuário é admin
  useEffect(() => {
    if (!user?.is_staff) {
      navigate('/admin/dashboard');
      return;
    }
  }, [user, navigate]);

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const result = await userService.getUsers();
      if (result.success) {
        const foundUser = result.data.results.find(u => u.id === parseInt(userId));
        if (foundUser) {
          setUserToEdit(foundUser);
          setFormData({
            email: foundUser.email,
            first_name: foundUser.first_name || '',
            last_name: foundUser.last_name || '',
            password: '',
            password_confirm: '',
            is_staff: foundUser.is_staff,
            is_active: foundUser.is_active,
          });
        } else {
          setError('Usuário não encontrado');
        }
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setErrors({});

    // Preparar dados para envio (remover senha se vazia)
    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
      delete dataToSend.password_confirm;
    }

    const result = await userService.updateUser(userId, dataToSend);
    if (result.success) {
      navigate('/admin/users');
    } else {
      setError(result.message);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!user?.is_staff) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando usuário...</p>
        </div>
      </div>
    );
  }

  if (error && !userToEdit) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Editar Usuário</h1>
          <p className="text-gray-600 mt-1">Editando: {userToEdit?.email}</p>
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name[0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Sobrenome
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sobrenome"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name[0]}</p>
              )}
            </div>
          </div>

          {/* Senhas (opcional para edição) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Alterar Senha (opcional)</h3>
            <p className="text-sm text-gray-600">Deixe em branco para manter a senha atual</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a nova senha"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirme a nova senha"
                />
                {errors.password_confirm && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirm[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissões */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Permissões</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={userToEdit?.id === user.id}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Usuário ativo
                {userToEdit?.id === user.id && (
                  <span className="text-gray-500 text-xs ml-1">(não é possível desativar sua própria conta)</span>
                )}
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_staff"
                name="is_staff"
                checked={formData.is_staff}
                onChange={handleChange}
                disabled={userToEdit?.id === user.id && user.is_staff}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-700">
                Administrador (acesso ao painel administrativo)
                {userToEdit?.id === user.id && user.is_staff && (
                  <span className="text-gray-500 text-xs ml-1">(não é possível remover seu próprio status de admin)</span>
                )}
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditPage;

