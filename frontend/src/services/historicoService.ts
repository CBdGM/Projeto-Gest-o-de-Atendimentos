import api from "./axios";

export interface Historico {
  id?: number;
  cliente_id: number;
  data?: string; // será gerada automaticamente se não enviada
  tipo: "sessao" | "supervisao";
  conteudo: string;
}

class HistoricoService {
  getByCliente(clienteId: number) {
    return api.get<Historico[]>(`/historicos/cliente/${clienteId}`);
  }

  getById(id: number) {
    return api.get<Historico>(`/historicos/${id}`);
}

  create(data: Omit<Historico, "id">) {
    return api.post<Historico>("/historicos/", data);
  }

  update(id: number, data: Partial<Historico>) {
    return api.put<Historico>(`/historicos/${id}`, data);
  }

  delete(id: number) {
    return api.delete(`/historicos/${id}`);
  }
}

export default new HistoricoService();