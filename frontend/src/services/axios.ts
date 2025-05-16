import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Adiciona token de acesso nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepta erros 401 para tentar refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 e ainda não tentou refazer
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");

        const response = await axios.post<{ access_token: string }>(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = response.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        // Atualiza header da próxima request
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Reenvia a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao tentar renovar token", refreshError);
        // Você pode redirecionar para login aqui, se quiser
      }
    }

    return Promise.reject(error);
  }
);

export default api;
