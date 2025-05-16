import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { Cliente } from "../../services/clienteService";
import clienteService from "../../services/clienteService";

export default function ClienteEdit() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      clienteService.get(Number(id)).then((res) => setCliente(res.data));
    }
  }, [id]);

  const formatCpfCnpj = (inputNumber: string) => {
    if (!inputNumber) return "";
    const numeric = inputNumber.replace(/\D/g, "");
    if (numeric.length === 14) {
      return `${numeric.substring(0, 2)}.${numeric.substring(2, 5)}.${numeric.substring(5, 8)}/${numeric.substring(8, 12)}-${numeric.substring(12, 14)}`;
    } else if (numeric.length === 11) {
      return `${numeric.substring(0, 3)}.${numeric.substring(3, 6)}.${numeric.substring(6, 9)}-${numeric.substring(9, 11)}`;
    }
    return inputNumber;
  };

  const formatCurrency = (value: string) => {
    const numeric = parseFloat(value.replace(/[^\d]/g, "")) / 100;
    if (isNaN(numeric)) return "";
    return numeric.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatTelefone = (input: string) => {
    const numeric = input.replace(/\D/g, "").slice(0, 11);
    if (numeric.length === 0) return "";
    if (numeric.length < 3) return `(${numeric}`;
    if (numeric.length < 7) return `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    if (numeric.length < 11)
      return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 6)}-${numeric.slice(6)}`;
    return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErros((prev) => ({ ...prev, [name]: false }));
    if (!cliente) return;

    if (name === "cpf_cnpj") {
      const numericValue = value.replace(/\D/g, "").slice(0, 14);
      setCliente((prev) => ({ ...prev!, cpf_cnpj: numericValue }));
      return;
    }

    setCliente((prev) => ({
      ...prev!,
      [name]: name === "valor_padrao" ? Number(value) : value,
    }));
  };

  const validarCampos = () => {
    const novosErros: Record<string, boolean> = {};
    if (!cliente?.nome.trim()) novosErros.nome = true;

    const cpfCnpj = cliente?.cpf_cnpj.replace(/\D/g, "") || "";
    if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
      novosErros.cpf_cnpj = true;
    }

    const telefone = cliente?.telefone.replace(/\D/g, "") || "";
    if (!telefone || (telefone.length !== 10 && telefone.length !== 11)) {
      novosErros.telefone = true;
    }

    if (cliente?.email && !/^\S+@\S+\.\S+$/.test(cliente.email)) {
      novosErros.email = true;
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!cliente || !validarCampos()) return;
    try {
      await clienteService.update(cliente.id!, cliente);
      navigate("/clientes");
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar cliente.");
    }
  };

  if (!cliente) return null;

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" mb={2}>
          Editar Cliente
        </Typography>

        <TextField
          fullWidth
          label="Nome"
          name="nome"
          margin="normal"
          value={cliente.nome}
          onChange={handleChange}
          error={erros.nome}
          helperText={erros.nome && "Campo incorreto"}
        />
        <TextField
          fullWidth
          label="CPF/CNPJ"
          name="cpf_cnpj"
          margin="normal"
          value={formatCpfCnpj(cliente.cpf_cnpj)}
          onChange={handleChange}
          error={erros.cpf_cnpj}
          helperText={erros.cpf_cnpj && "CPF ou CNPJ inválido"}
        />
        <TextField
          fullWidth
          label="Telefone"
          name="telefone"
          margin="normal"
          value={formatTelefone(cliente.telefone)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setErros((prev) => ({ ...prev, telefone: false }));
            setCliente((prev) => ({ ...prev!, telefone: raw }));
          }}
          error={erros.telefone}
          helperText={erros.telefone && "Telefone inválido"}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          margin="normal"
          value={cliente.email}
          onChange={handleChange}
          error={erros.email}
          helperText={erros.email && "Email inválido"}
        />
        <TextField
          fullWidth
          label="Endereço"
          name="endereco"
          margin="normal"
          value={cliente.endereco}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Valor Padrão"
          name="valor_padrao"
          type="text"
          margin="normal"
          value={formatCurrency(cliente.valor_padrao.toString())}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^\d]/g, "");
            setCliente((prev) => ({
              ...prev!,
              valor_padrao: Number(numericValue),
            }));
          }}
          onBlur={(e) => {
            const numeric = parseFloat(e.target.value.replace(/[^\d]/g, "")) / 100;
            setCliente((prev) => ({
              ...prev!,
              valor_padrao: isNaN(numeric) ? 0 : numeric,
            }));
          }}
        />

        {erro && <Typography color="error">{erro}</Typography>}

        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          fullWidth
          onClick={() => navigate("/clientes")}
        >
          Voltar
        </Button>
        <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={handleSubmit}>
          Salvar
        </Button>
      </Paper>
    </Box>
  );
}