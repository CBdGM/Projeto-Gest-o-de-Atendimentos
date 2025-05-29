import api from "./axios";

export interface ResumoFinanceiroResponse {
  sessoes: number;
  recebido: number;
  a_receber: number;
  futuras: number;
  nao_realizadas: number;
}

const DashboardService = {
  getResumoFinanceiro() {
    return api.get<ResumoFinanceiroResponse>("/dashboard/resumo-financeiro");
  },
};

export default DashboardService;
