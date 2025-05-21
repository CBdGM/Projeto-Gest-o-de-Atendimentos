import ProximasSessoes from "../components/dashboard/ProximasSessoes";
import SessoesAmanha from "../components/dashboard/SessoesAmanha";
import { useEffect, useState } from "react";
import DashboardService from "../services/dashboardService";
import type { ResumoFinanceiroResponse } from "../services/dashboardService";
import ResumoFinanceiro from "../components/dashboard/ResumoFinanceiro";
import { Box, CircularProgress, Typography } from "@mui/material";
import ProximasSessoesService from "../services/proximasSessoesService";
import type { SessaoProxima } from "../services/proximasSessoesService";
import SessoesAmanhaService from "../services/sessoesAmanhaService";
import type { SessaoAmanha } from "../services/sessoesAmanhaService";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sessoes, setSessoes] = useState(0);
  const [recebido, setRecebido] = useState(0);
  const [aReceber, setAReceber] = useState(0);
  const [futuras, setFuturas] = useState(0);
  const [naoRealizadas, setNaoRealizadas] = useState(0);

  const [proximasSessoes, setProximasSessoes] = useState<SessaoProxima[]>([]);
  const [sessoesAmanha, setSessoesAmanha] = useState<SessaoAmanha[]>([]);

  useEffect(() => {
    async function fetchProximas() {
      try {
        const res = await ProximasSessoesService.getProximasSessoes();
        console.log("[DEBUG] Sessões recebidas do backend:", res.data);
        setProximasSessoes(res.data);
      } catch (err) {
        console.error("Erro ao buscar próximas sessões:", err);
      }
    }

    fetchProximas();
  }, []);

  useEffect(() => {
    async function fetchAmanha() {
      try {
        const res = await SessoesAmanhaService.getSessoesAmanha();
        console.log(
          "[DEBUG] Sessões de amanhã recebidas do backend:",
          res.data
        );
        setSessoesAmanha(res.data);
      } catch (err) {
        console.error("Erro ao buscar sessões de amanhã:", err);
      }
    }

    fetchAmanha();
  }, []);

  useEffect(() => {
    async function fetchResumo() {
      try {
        const res: { data: ResumoFinanceiroResponse } =
          await DashboardService.getResumoFinanceiro();
        setSessoes(res.data.sessoes);
        setRecebido(res.data.recebido);
        setAReceber(res.data.a_receber);
        setFuturas(res.data.futuras);
        setNaoRealizadas(res.data.nao_realizadas);
      } catch (err) {
        console.error("Erro ao buscar resumo financeiro:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResumo();
  }, []);

  return (
    <Box p={4} height="80vh" overflow="hidden">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box display="flex" flexDirection="column" justifyContent="left">
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
            gap={4}
          >
            <ResumoFinanceiro
              sessoes={sessoes}
              recebido={recebido}
              aReceber={aReceber}
              futuras={futuras}
              naoRealizadas={naoRealizadas}
            />
          </Box>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
            gap={4}
            mt={4}
          >
            <ProximasSessoes sessoes={proximasSessoes} />
            <SessoesAmanha sessoes={sessoesAmanha} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
