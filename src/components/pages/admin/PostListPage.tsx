import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { useAuth } from '../../../context/AuthContext';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

const PostListPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [search]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    
    const result = await postService.getMyPosts();
    if (result.success) {
      setPosts(result.data);
    } else {
      setError(result.message || 'Erro ao carregar posts');
    }
    setLoading(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;
    
    const result = await postService.deletePost(slug);
    if (result.success) {
      setPosts(posts.filter(post => post.slug !== slug));
    } else {
      setError(result.message || 'Erro ao deletar post');
    }
  };

  const handleTogglePublish = async (slug: string) => {
    const result = await postService.togglePublish(slug);
    if (result.success) {
      setPosts(posts.map(post => 
        post.slug === slug 
          ? { ...post, is_published: !post.is_published }
          : post
      ));
    } else {
      setError(result.message || 'Erro ao alterar status de publicação');
    }
  };

  if (loading) return <div className="p-8">Carregando posts...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Postagens</h1>
        <button
          onClick={() => navigate('/admin/posts/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Nova Postagem
        </button>
      </div>

      {/* Barra de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar postagens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Lista de posts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">Nenhuma postagem encontrada.</p>
            <button
              onClick={() => navigate('/admin/posts/create')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Criar sua primeira postagem
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{post.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/admin/posts/edit/${post.slug}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleTogglePublish(post.slug)}
                        className="text-green-600 hover:text-green-900"
                      >
                        {post.is_published ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deletar
                      </button>
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

export default PostListPage;

