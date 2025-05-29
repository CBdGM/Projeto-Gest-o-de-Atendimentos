import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import HistoricoService from "../../services/historicoService";

export default function HistoricoCreate() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<"sessao" | "supervisao">("sessao");
  const [data, setData] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async () => {
    if (!conteudo.trim() || !data || !clienteId) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      await HistoricoService.create({
        cliente_id: parseInt(clienteId),
        tipo,
        data,
        conteudo,
      });
      setSucesso(true);
      setTimeout(() => navigate("/clientes"), 1500);
    } catch (e) {
      setErro("Erro ao salvar histórico.");
      console.error(e);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" mb={2}>
          Novo Histórico
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={tipo}
            label="Tipo"
            onChange={(e) => setTipo(e.target.value as "sessao" | "supervisao")}
          >
            <MenuItem value="sessao">Sessão</MenuItem>
            <MenuItem value="supervisao">Supervisão</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type="date"
          label="Data"
          InputLabelProps={{ shrink: true }}
          margin="normal"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <TextField
          fullWidth
          label="Conteúdo"
          multiline
          rows={5}
          margin="normal"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />

        {erro && (
          <Typography color="error" sx={{ mt: 1 }}>
            {erro}
          </Typography>
        )}

        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          fullWidth
          onClick={() => navigate("/clientes")}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          fullWidth
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </Paper>

      <Snackbar open={sucesso} autoHideDuration={3000}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Histórico salvo com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}