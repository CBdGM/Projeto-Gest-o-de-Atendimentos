import { useEffect, useState } from "react";
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
  const navigate = useNavigate();

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
                      onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
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
