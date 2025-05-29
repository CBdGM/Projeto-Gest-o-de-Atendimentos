import api from "./axios";

export interface SessaoAmanha {
  cliente: string;
  telefone: string;
  data: string;
  horario: string;
  tipo_atendimento: string;
}

const SessoesAmanhaService = {
  getSessoesAmanha() {
    return api.get<SessaoAmanha[]>("/dashboard/sessoes-amanha");
  },
};

export default SessoesAmanhaService;