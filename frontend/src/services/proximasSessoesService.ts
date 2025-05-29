import api from "./axios";

export interface SessaoProxima {
  cliente: string;
  data: string;
  horario: string;
  tipo_atendimento: string;
}

const ProximasSessoesService = {
  getProximasSessoes() {
    return api.get<SessaoProxima[]>("/dashboard/proximas-sessoes");
  },
};

export default ProximasSessoesService;