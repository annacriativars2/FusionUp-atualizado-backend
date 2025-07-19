import api from "../api/axios";

interface PostData {
  // Defina aqui os campos que você espera enviar para criar/atualizar um post
  // Exemplo:
  title?: string;
  content?: string;
  // e qualquer outro campo que seu backend aceite
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export const postService = {
  async getPosts(params = {}): Promise<ApiResponse<any>> {
    try {
      const response = await api.get("/posts/", { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: "Erro ao carregar posts" };
    }
  },

  async getPost(slug: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/posts/${slug}/`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: "Post não encontrado" };
    }
  },

  async createPost(postData: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await api.post("/posts/", postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || "Erro ao criar post",
        errors: error.response?.data || {},
      };
    }
  },

  async updatePost(slug: string, postData: FormData): Promise<ApiResponse<any>> {
    try {
      const response = await api.put(`/posts/${slug}/`, postData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || "Erro ao atualizar post",
        errors: error.response?.data || {},
      };
    }
  },

  async deletePost(slug: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/posts/${slug}/`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: "Erro ao deletar post" };
    }
  },

  async getMyPosts(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get("/posts/my_posts/");
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: "Erro ao carregar seus posts" };
    }
  },

  async togglePublish(slug: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/posts/${slug}/toggle_publish/`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: "Erro ao alterar publicação" };
    }
  },
};
