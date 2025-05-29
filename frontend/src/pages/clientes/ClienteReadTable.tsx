import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import type { Cliente } from "../../services/clienteService";
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
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ClienteService from "../../services/clienteService";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HistoricoService from "../../services/historicoService";
import type { Historico } from "../../services/historicoService";

function formatCpfCnpj(value: string) {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (cleaned.length === 14) {
    return cleaned.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }
  return value;
}

function formatTelefone(value: string) {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
    7,
    11
  )}`;
}

export default function ClienteReadTable() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );
  const [historicoPorCliente, setHistoricoPorCliente] = useState<
    Record<number, Historico[]>
  >({});
  const [expandidos, setExpandidos] = useState<number[]>([]);
  // Estados relacionados ao histórico (devem estar aqui dentro)
  const [openHistoricoDialog, setOpenHistoricoDialog] = useState(false);
  const [
    historicoSelecionadoParaExclusao,
    setHistoricoSelecionadoParaExclusao,
  ] = useState<Historico | null>(null);
  const [clienteDoHistorico, setClienteDoHistorico] = useState<Cliente | null>(
    null
  );
  const navigate = useNavigate();

  const theme = useTheme();

  const fetchClientes = async () => {
    try {
      const response = await ClienteService.getAll();
      setClientes(response.data);
    } catch (error: any) {
      console.error("Erro ao buscar clientes", error?.response || error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setOpenDialog(true);
  };

  const toggleHistorico = async (clienteId: number) => {
    if (expandidos.includes(clienteId)) {
      setExpandidos(expandidos.filter((id) => id !== clienteId));
    } else {
      if (!historicoPorCliente[clienteId]) {
        const res = await HistoricoService.getByCliente(clienteId);
        setHistoricoPorCliente((prev) => ({ ...prev, [clienteId]: res.data }));
      }
      setExpandidos([...expandidos, clienteId]);
    }
  };

  const confirmarExclusao = async () => {
    if (clienteSelecionado) {
      await ClienteService.delete(clienteSelecionado.id!);
      fetchClientes();
      setOpenDialog(false);
      setClienteSelecionado(null);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleEditarHistorico = (historico: Historico) => {
    navigate(`/historicos/editar/${historico.id}`);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h3">Clientes</Typography>
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            onClick={() => navigate("/clientes/novo")}
          >
            Adicionar Cliente
          </Button>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente excluir este cliente?
            <br />
            <strong>Nome:</strong> {clienteSelecionado?.nome}
            <br />
            <strong>CPF/CNPJ:</strong>{" "}
            {formatCpfCnpj(clienteSelecionado?.cpf_cnpj || "")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Nome
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  CPF/CNPJ
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Telefone
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Telefone de Emergência
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Endereço
                </TableCell>
                <TableCell sx={{ fontSize: "1rem", fontWeight: 500 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente) => (
                <>
                  <TableRow key={cliente.id}>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      {cliente.nome}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      {formatCpfCnpj(cliente.cpf_cnpj)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      <a
                        href={`mailto:${cliente.email}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {cliente.email}
                      </a>
                    </TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      <a
                        href={`https://wa.me/55${cliente.telefone.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {formatTelefone(cliente.telefone)}
                      </a>
                    </TableCell>

                    <TableCell sx={{ fontSize: "1rem" }}>
                      <a
                        href={`https://wa.me/55${(
                          cliente.telefone_emergencia || ""
                        ).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {formatTelefone(cliente.telefone_emergencia || "")}
                      </a>
                    </TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      {cliente.endereco}
                    </TableCell>
                    <TableCell sx={{ fontSize: "1rem" }}>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/clientes/editar/${cliente.id}`)
                        }
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(cliente)}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => navigate(`/recibos/gerar/${cliente.id}`)}
                      >
                        🧾
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={() => toggleHistorico(cliente.id!)}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {expandidos.includes(cliente.id!) && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ backgroundColor: "#000000" }}
                      >
                        <Box
                          p={2}
                          sx={{ backgroundColor: "#f5f5f5", borderRadius: 2 }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{ color: "#000" }}
                            >
                              Histórico
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/historicos/novo/${cliente.id}`)}
                            >
                              Adicionar Histórico
                            </Button>
                          </Box>
                          {historicoPorCliente[cliente.id!]?.length ? (
                            (() => {
                              const historicos = [
                                ...(historicoPorCliente[cliente.id!] || []),
                              ];
                              return historicos
                                .sort(
                                  (a, b) =>
                                    new Date(b.data ?? "").getTime() -
                                    new Date(a.data ?? "").getTime()
                                )
                                .map((h) => (
                                  <Box
                                    key={h.id}
                                    mb={1}
                                    p={1}
                                    borderBottom="1px solid #ddd"
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                          color:
                                            h.tipo === "sessao"
                                              ? "#1976d2"
                                              : "#ed6c02",
                                        }}
                                      >
                                        {h.tipo === "sessao"
                                          ? "Sessão"
                                          : "Supervisão"}{" "}
                                        –{" "}
                                        {h.data
                                          ? h.data.split("-").reverse().join("/")
                                          : "Data inválida"}
                                      </Typography>
                                      <Box>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleEditarHistorico(h)
                                          }
                                        >
                                          <Edit
                                            fontSize="small"
                                            sx={{
                                              color: theme.palette.primary.main,
                                            }}
                                          />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setHistoricoSelecionadoParaExclusao(
                                              h
                                            );
                                            setClienteDoHistorico(cliente);
                                            setOpenHistoricoDialog(true);
                                          }}
                                        >
                                          <Delete
                                            fontSize="small"
                                            sx={{ color: "red" }}
                                          />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      whiteSpace="pre-wrap"
                                      sx={{ color: "#000" }}
                                    >
                                      {h.conteudo}
                                    </Typography>
                                  </Box>
                                ));
                            })()
                          ) : (
                            <Typography variant="body2" sx={{ color: "#000" }}>
                              Sem histórico registrado.
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Dialog de confirmação de exclusão do histórico */}
      <Dialog
        open={openHistoricoDialog}
        onClose={() => setOpenHistoricoDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente excluir este item do histórico?
            <br />
            <strong>Tipo:</strong>{" "}
            {historicoSelecionadoParaExclusao?.tipo === "sessao"
              ? "Sessão"
              : "Supervisão"}
            <br />
            <strong>Data:</strong>{" "}
            {historicoSelecionadoParaExclusao?.data
              ? new Date(
                  historicoSelecionadoParaExclusao.data
                ).toLocaleDateString()
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoricoDialog(false)}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (historicoSelecionadoParaExclusao && clienteDoHistorico) {
                await HistoricoService.delete(
                  historicoSelecionadoParaExclusao.id!
                );
                setHistoricoPorCliente((prev) => ({
                  ...prev,
                  [clienteDoHistorico.id!]: (
                    prev[clienteDoHistorico.id!] || []
                  ).filter(
                    (item) => item.id !== historicoSelecionadoParaExclusao.id
                  ),
                }));
                setOpenHistoricoDialog(false);
                setHistoricoSelecionadoParaExclusao(null);
                setClienteDoHistorico(null);
              }
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
