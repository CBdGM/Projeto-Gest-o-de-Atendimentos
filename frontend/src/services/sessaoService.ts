import api from "./axios";

export interface Sessao {
  id?: number;
  cliente_id: number;
  data: string;
  tipo_atendimento: string;
  frequencia: string;
  horario: string;
  foi_realizada: boolean;
  foi_paga: boolean;
  valor: number;
  observacoes: string;
  criado_em?: string;
}

export interface ReciboPreview {
  quantidade: number;
  valor_total: number;
  datas: string[];
}

export interface ResumoFinanceiroResponse {
  sessoes: number;
  recebido: number;
  a_receber: number;
}

class SessaoService {
  getAll() {
    return api.get<Sessao[]>("/sessoes/");
  }

  get(id: number) {
    return api.get<Sessao>(`/sessoes/${id}`);
  }

  create(data: Sessao) {
    return api.post("/sessoes/", data);
  }

  update(id: number, data: Sessao) {
    return api.put(`/sessoes/${id}`, data);
  }

  delete(id: number, excluirFuturas: boolean = false) {
    const url = `/sessoes/${id}${excluirFuturas ? "?delete_all=true" : ""}`;
    return api.delete(url);
  }

  getRecibo(clienteId: number, mes: number, ano: number) {
    return api.get<ReciboPreview>(`/recibos/preview/${clienteId}?mes=${mes}&ano=${ano}`);
  }

  getResumoFinanceiro() {
    return api.get<ResumoFinanceiroResponse>("/dashboard/resumo-financeiro");
  }
}

export default new SessaoService();