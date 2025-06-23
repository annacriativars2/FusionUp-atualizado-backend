import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { postService } from "../../services/postService";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [search]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    const result = await postService.getPosts({ search });

    if (result.success) {
      setPosts(result.data.results);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const categories = ["Todos", ...new Set(posts.map((post) => post.category))];

  const filteredPosts =
    selectedCategory === "Todos"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  if (loading) return <div className="pt-24 text-center">Carregando posts...</div>;
  if (error) return <div className="pt-24 text-red-500 text-center">Erro: {error}</div>;

  return (
    <section className="pt-36 pb-20 px-4 md:px-8 bg-[#F1F5F9]">

      {/* Título */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-[#1E3A8A]"
      >
        Blog Educacional
      </motion.h2>

      <p className="text-center text-[#1E3A8A] max-w-xl mx-auto mb-10 text-lg">
        Explore conteúdos sobre neuropsicopedagogia, aprendizagem e educação inclusiva.
      </p>

      {/* Categorias */}
      <div className="flex flex-wrap md:justify-center overflow-x-auto gap-2 mb-8">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? "bg-[#1E3A8A] text-white"
                : "bg-white text-[#1E3A8A] border border-[#1E3A8A] hover:bg-[#DBEAFE]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="Buscar artigo..."
          className="w-full md:w-96 mx-auto block px-4 py-3 rounded-lg bg-white border border-[#94A3B8] text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de posts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col"
            >
              <img
                src={post.image || "https://placehold.co/400x200"}
                alt={post.title}
                className="w-full h-52 object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs uppercase font-semibold text-white bg-[#1E3A8A] rounded-full px-3 py-1 w-fit mb-2">
                  {post.category || "Geral"}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-[#1E3A8A] mb-2">
                  {post.title}
                </h3>
                <p className="text-[#334155] text-sm mb-4 flex-grow">{post.excerpt}</p>
                <div className="text-sm text-[#64748B] mb-2">
                  Por <strong>{post.author}</strong> —{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <button className="mt-auto py-2 px-4 rounded-lg bg-white border border-[#1E3A8A] text-[#1E3A8A] font-medium hover:bg-[#DBEAFE] transition-all">
                  Ler artigo completo
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center text-[#1E3A8A]">Nenhum post encontrado.</div>
        )}
      </div>

      {/* Newsletter */}
      <div className="mt-20 bg-white rounded-xl p-8 border border-[#E2E8F0] shadow">
        <h3 className="text-2xl font-bold text-[#1E3A8A] mb-4">Inscreva-se na nossa newsletter</h3>
        <p className="text-[#334155] mb-6">
          Receba atualizações e novos artigos diretamente no seu e-mail.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="Seu melhor e-mail"
            className="flex-grow px-4 py-3 rounded-lg bg-white border border-[#94A3B8] text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
          <button
            className="px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
            style={{
              background: "#1E3A8A",
              boxShadow: "0 4px 15px rgba(30, 58, 138, 0.3)",
            }}
          >
            INSCREVER
          </button>
        </div>
      </div>
    </section>
  );
}
