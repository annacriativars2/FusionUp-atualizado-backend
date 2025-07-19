import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verificar se o usuário é admin
  useEffect(() => {
    if (!user?.is_staff) {
      navigate('/admin/dashboard');
      return;
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await userService.getUsers(search);
    if (result.success) {
      setUsers(result.data.results);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleStaff = async (userId) => {
    const result = await userService.toggleStaff(userId);
    if (result.success) {
      setSuccess(result.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleActive = async (userId) => {
    const result = await userService.toggleActive(userId);
    if (result.success) {
      setSuccess(result.message);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${userEmail}?`)) {
      const result = await userService.deleteUser(userId);
      if (result.success) {
        setSuccess(result.message);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user?.is_staff) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/admin/users/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Novo Usuário
          </Link>
          <Link
            to="/admin/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Busca */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por email, nome ou sobrenome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {users.length} usuário(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {userItem.first_name ? userItem.first_name[0].toUpperCase() : userItem.email[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        {userItem.is_staff && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userItem.date_joined)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.last_login ? formatDate(userItem.last_login) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/users/edit/${userItem.id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleToggleStaff(userItem.id)}
                          className="text-purple-600 hover:text-purple-900 text-sm"
                          disabled={userItem.id === user.id}
                        >
                          {userItem.is_staff ? 'Remover Admin' : 'Tornar Admin'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(userItem.id)}
                          className="text-yellow-600 hover:text-yellow-900 text-sm"
                          disabled={userItem.id === user.id}
                        >
                          {userItem.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id, userItem.email)}
                          className="text-red-600 hover:text-red-900 text-sm"
                          disabled={userItem.id === user.id}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;

