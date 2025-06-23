import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../../../services/postService';
import { useAuth } from '../../../context/AuthContext';

const PostCreatePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    slug: '',
    is_published: false,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;

    if (type === 'file') {
      const file = files?.[0];
      if (file) {
        // Validação de tamanho (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
          setError('A imagem deve ter no máximo 2MB.');
          setFormData((prev) => ({ ...prev, image: null }));
          setImagePreview(null);
          return;
        }

        // Validação de tipo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          setError('Formato inválido. Use JPEG, PNG ou WEBP.');
          setFormData((prev) => ({ ...prev, image: null }));
          setImagePreview(null);
          return;
        }

        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
        setError('');
      } else {
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('slug', formData.slug);
    data.append('is_published', String(formData.is_published));
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const result = await postService.createPost(data);

      if (result.success) {
        navigate('/admin/posts');
      } else {
        setError(result.message || 'Erro ao criar post');
      }
    } catch (err) {
      console.error(err);
      setError('Erro inesperado ao criar post.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Nova Postagem</h1>
        <button
          onClick={() => navigate('/admin/posts')}
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
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite o título da postagem"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL amigável)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="url-amigavel-do-post"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Gerar
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite o conteúdo da postagem"
            />
          </div>

          {/* Imagem */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de capa (opcional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            {/* Preview da Imagem */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Pré-visualização:</p>
                <img
                  src={imagePreview}
                  alt="Pré-visualização"
                  className="w-full max-w-sm rounded-md shadow border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Publicação */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="is_published" className="ml-2 text-sm text-gray-700">
              Publicar imediatamente
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/posts')}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Postagem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreatePage;
