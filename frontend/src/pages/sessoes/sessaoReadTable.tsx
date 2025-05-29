import { useEffect, useState } from "react";
import type { Sessao } from "../../services/sessaoService";
import ClienteService from "../../services/clienteService";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import SessaoService from "../../services/sessaoService";

// function formatCpfCnpj(value: string) {
//   if (!value) return "";
//   const cleaned = value.replace(/\D/g, "");
//   if (cleaned.length === 11) {
//     return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
//   } else if (cleaned.length === 14) {
//     return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
//   }
//   return value;
// }

// function formatTelefone(value: string) {
//   if (!value) return "";
//   const cleaned = value.replace(/\D/g, "");
//   if (cleaned.length <= 2) return `(${cleaned}`;
//   if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
//   if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
//   return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
// }

function formatCurrency(value: number | null | undefined) {
  if (value == null || isNaN(value)) return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function SessaoReadTable() {
  const [sessoes, setSessaos] = useState<Sessao[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [sessaoSelecionado, setSessaoSelecionado] = useState<Sessao | null>(
    null
  );
  const [expandedSessaoId, setExpandedSessaoId] = useState<number | null>(null);
  const [exibirSessoesAntigas, setExibirSessoesAntigas] = useState(true);
  const navigate = useNavigate();

  const fetchSessaos = async () => {
    try {
      const response = await SessaoService.getAll();
      const ordenadas = response.data.sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
      );
      setSessaos(ordenadas);
    } catch (error: any) {
      console.error("Erro ao buscar sessoes", error?.response || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await ClienteService.getAll();
      const map: Record<number, string> = {};
      response.data.forEach((cliente: any) => {
        map[cliente.id] = cliente.nome;
      });
      setClientesMap(map);
    } catch (error: any) {
      console.error("Erro ao buscar clientes", error?.response || error);
    }
  };

  const handleDelete = (sessao: Sessao) => {
    setSessaoSelecionado(sessao);
    setOpenDialog(true);
  };

  const confirmarExclusao = async (futuras: boolean) => {
    if (!sessaoSelecionado) return;

    try {
      await SessaoService.delete(sessaoSelecionado.id!, futuras);
      fetchSessaos();
    } catch (error) {
      console.error("Erro ao excluir sessão", error);
    } finally {
      setOpenDialog(false);
      setSessaoSelecionado(null);
    }
  };

  useEffect(() => {
    fetchSessaos();
    fetchClientes();
  }, []);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h3" gutterBottom>
          Sessões
        </Typography>
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={exibirSessoesAntigas}
                onChange={(e) => setExibirSessoesAntigas(e.target.checked)}
                color="primary"
              />
            }
            label="Exibir sessões antigas/realizadas"
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={() => navigate("/sessoes/novo")}>
            Adicionar Sessão
          </Button>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja excluir apenas esta sessão ou também todas as sessões futuras com a mesma repetição?
            <br />
            <strong>Cliente:</strong>{" "}
            {clientesMap[sessaoSelecionado?.cliente_id ?? 0] ||
              `ID: ${sessaoSelecionado?.cliente_id}`}
            <br />
            <strong>Data:</strong>{" "}
            {sessaoSelecionado?.data?.split("-").reverse().join("/")}
            <br />
            <strong>Horário:</strong> {sessaoSelecionado?.horario}
            <br />
            <strong>Tipo:</strong> {sessaoSelecionado?.tipo_atendimento}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => confirmarExclusao(false)}
            color="primary"
            variant="outlined"
          >
            Apenas esta
          </Button>
          <Button
            onClick={() => confirmarExclusao(true)}
            color="error"
            variant="contained"
          >
            Esta e futuras
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Frequência</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Realizada</TableCell>
                <TableCell>Paga</TableCell>
                <TableCell>Observações</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessoes
                .filter((sessao) => {
                  if (exibirSessoesAntigas) return true;
                  const hoje = new Date().toISOString().split("T")[0];
                  return !(sessao.data < hoje && sessao.foi_realizada);
                })
                .map((sessao) => (
                <TableRow key={sessao.id}>
                  <TableCell>
                    {clientesMap[sessao.cliente_id] ||
                      `ID: ${sessao.cliente_id}`}
                  </TableCell>
                  <TableCell>
                    {sessao.data.split("-").reverse().join("/")}
                  </TableCell>
                  <TableCell>{sessao.horario}</TableCell>
                  <TableCell>{sessao.tipo_atendimento}</TableCell>
                  <TableCell>{sessao.frequencia}</TableCell>
                  <TableCell>{formatCurrency(sessao.valor)}</TableCell>
                  <TableCell>{sessao.foi_realizada ? "Sim" : "Não"}</TableCell>
                  <TableCell>{sessao.foi_paga ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    {expandedSessaoId === sessao.id ? (
                      <>
                        {sessao.observacoes}
                        <Button
                          size="small"
                          onClick={() => setExpandedSessaoId(null)}
                          sx={{ ml: 1 }}
                        >
                          -
                        </Button>
                      </>
                    ) : sessao.observacoes && sessao.observacoes.length > 30 ? (
                      <>
                        {sessao.observacoes.slice(0, 30)}...
                        <Button
                          size="small"
                          onClick={() => setExpandedSessaoId(sessao.id ?? null)}
                          sx={{ ml: 1 }}
                        >
                          +
                        </Button>
                      </>
                    ) : (
                      sessao.observacoes
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/sessoes/editar/${sessao.id}`)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(sessao)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
