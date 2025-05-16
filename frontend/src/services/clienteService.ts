import api from "./axios";

export interface Cliente {
  id?: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  valor_padrao: number;
}

class ClienteService {
  getAll() {
    return api.get<Cliente[]>("/clientes/");
  }

  get(id: number) {
    return api.get<Cliente>(`/clientes/${id}`);
  }

  create(data: Cliente) {
    return api.post<Cliente>("/clientes", data);
  }

  update(id: number, data: Cliente) {
    return api.put<Cliente>(`/clientes/${id}`, data);
  }

  delete(id: number) {
    return api.delete(`/clientes/${id}`);
  }
}

export default new ClienteService();