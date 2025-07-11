import api from "./axios";

export interface SessaoResumo {
  data: string;
  tipo_atendimento: string;
  horario: string;
  valor: number;
  foi_paga: boolean;
}

export interface ClienteRelatorio {
  cliente: {
    id: number;
    nome: string;
  };
  sessoes: SessaoResumo[];
  total_pago: number;
}

export interface SessaoDetalhada {
  cliente_id: number;
  cliente_nome: string;
  data: string;
  tipo_atendimento: string;
  horario: string;
  valor: number;
  foi_paga: boolean;
}

export interface RelatorioGeral {
  total_pago_no_mes: number;
  detalhamento: {
    cliente_id: number;
    cliente_nome: string;
    total_pago: number;
  }[];
  sessoes: SessaoDetalhada[];
}

class RelatorioService {
  getRelatorioMensalCliente(mes: number, ano: number) {
    return api.get<ClienteRelatorio[]>(`/relatorios/dados-mensal-cliente`, {
      params: { mes, ano },
    });
  }

  getRelatorioMensalGeral(mes: number, ano: number) {
    return api.get<RelatorioGeral>(`/relatorios/dados-mensal-geral`, {
      params: { mes, ano },
    });
  }
}

export default new RelatorioService();
