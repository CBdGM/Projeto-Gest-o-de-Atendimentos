import api from "./axios";

export interface Nota {
  id: number;
  titulo: string;
  conteudo: string;
  criado_em?: string;
  atualizado_em?: string;
}

const NotasService = {
  listar: () => api.get<Nota[]>("/notas/"),
  obter: (id: number) => api.get<Nota>(`/notas/${id}`),
  criar: (dados: Omit<Nota, "id">) => api.post<Nota>("/notas/", dados),
  atualizar: (id: number, dados: Partial<Nota>) => api.put<Nota>(`/notas/${id}`, dados),
  deletar: (id: number) => api.delete(`/notas/${id}`),
};

export default NotasService;