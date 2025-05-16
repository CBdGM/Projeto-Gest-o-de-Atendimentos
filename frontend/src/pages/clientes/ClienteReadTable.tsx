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
  DialogActions
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
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value;
}

function formatTelefone(value: string) {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}


export default function ClienteReadTable() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h3">Clientes</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/clientes/novo")}
        >
          Adicionar Cliente
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja realmente excluir este cliente?
            <br />
            <strong>Nome:</strong> {clienteSelecionado?.nome}
            <br />
            <strong>CPF/CNPJ:</strong> {formatCpfCnpj(clienteSelecionado?.cpf_cnpj || "")}
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>CPF/CNPJ</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Valor Padrão</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{formatCpfCnpj(cliente.cpf_cnpj)}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{formatTelefone(cliente.telefone)}</TableCell>
                  <TableCell>{cliente.endereco}</TableCell>
                  <TableCell>{formatCurrency(cliente.valor_padrao)}</TableCell>
                  <TableCell>
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