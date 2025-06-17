import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { postService } from '../../../services/postService';
import { userService } from '../../../services/userService';
import { configurationService } from '../../../services/configurationService';

type Post = {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  author: string; // Email do autor
  created_at: string;
};

const DashboardPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [configCount, setConfigCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Buscar posts
        const postsResult = await postService.getMyPosts();
        if (postsResult.success) {
          setPosts(postsResult.data.results || postsResult.data);
        } else {
          setError(postsResult.message || 'Erro ao buscar posts');
        }

        // Buscar contagem de usuários (apenas para admins)
        if (user?.is_staff) {
          const usersResult = await userService.getUsers();
          if (usersResult.success) {
            setUserCount(usersResult.data.count || usersResult.data.results?.length || 0);
          }

          // Buscar contagem de configurações
          const configResult = await configurationService.getConfigurations();
          if (configResult.success) {
            setConfigCount(configResult.data.count || configResult.data.results?.length || 0);
          }
        }
      } catch (err) {
        console.error('Erro geral:', err);
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, isAuthenticated, user?.is_staff]);

  if (loading) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu lateral */}
      <aside className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">CMS Menu</h2>
        <ul className="space-y-3">
          <li>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="text-blue-600 hover:underline w-full text-left"
            >
              Painel
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/admin/posts')}
              className="hover:underline w-full text-left"
            >
              Postagens
            </button>
          </li>
          {user?.is_staff && (
            <li>
              <button 
                onClick={() => navigate('/admin/users')}
                className="hover:underline w-full text-left"
              >
                Usuários
              </button>
            </li>
          )}
          {user?.is_staff && (
            <li>
              <button 
                onClick={() => navigate('/admin/configurations')}
                className="hover:underline w-full text-left"
              >
                Configurações
              </button>
            </li>
          )}
        </ul>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo, {user?.first_name || user?.email || 'Usuário'} 👋</h1>
            <p className="text-gray-600 mt-1">
              {user?.is_staff ? 'Administrador' : 'Usuário'} • Painel de Controle
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/admin/posts')}
          >
            <h2 className="text-xl font-semibold">Postagens</h2>
            <p className="text-3xl font-bold mt-2">{posts.length}</p>
            <p className="text-sm text-gray-500 mt-1">Clique para gerenciar</p>
          </div>

          {user?.is_staff && (
            <div 
              className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate('/admin/users')}
            >
              <h2 className="text-xl font-semibold">Usuários</h2>
              <p className="text-3xl font-bold mt-2">{userCount}</p>
              <p className="text-sm text-gray-500 mt-1">Clique para gerenciar</p>
            </div>
          )}

          {user?.is_staff && (
            <div 
              className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate('/admin/configurations')}
            >
              <h2 className="text-xl font-semibold">Configurações</h2>
              <p className="text-3xl font-bold mt-2">{configCount}</p>
              <p className="text-sm text-gray-500 mt-1">Clique para gerenciar</p>
            </div>
          )}
        </div>

        {/* Tabela de Posts */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Lista de Postagens</h2>
            <button
              onClick={() => navigate('/admin/posts/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Nova Postagem
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhuma postagem encontrada.</p>
              <button
                onClick={() => navigate('/admin/posts/create')}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Criar sua primeira postagem
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Título</th>
                    <th className="p-2 text-left">Slug</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Autor</th>
                    <th className="p-2 text-left">Criado em</th>
                    <th className="p-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.slice(0, 5).map((post) => (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{post.title}</td>
                      <td className="p-2 text-gray-500">{post.slug}</td>
                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            post.is_published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="p-2">{post.author || 'Desconhecido'}</td>
                      <td className="p-2 text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => navigate(`/admin/posts/edit/${post.slug}`)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {posts.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/admin/posts')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver todas as postagens ({posts.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

