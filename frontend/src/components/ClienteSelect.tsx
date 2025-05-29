import { useEffect, useState } from "react";
import { TextField, MenuItem, CircularProgress } from "@mui/material";
import clienteService from "../services/clienteService";
import type { Cliente } from "../services/clienteService";

type Props = {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
};

export default function ClienteSelect({ value, onChange, error }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clienteService.getAll().then((response) => {
      setClientes(response.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <TextField
      fullWidth
      select
      label="Cliente"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      margin="normal"
      error={error}
      helperText={error && "Cliente obrigatório"}
    >
      {clientes.map((cliente) => (
        <MenuItem key={cliente.id} value={cliente.id}>
          {cliente.nome}
        </MenuItem>
      ))}
    </TextField>
  );
}