import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate, useParams } from "react-router-dom";
import HistoricoService from "../../services/historicoService";
import type { Historico } from "../../services/historicoService";

export default function HistoricoEdit() {
  const [historico, setHistorico] = useState<Historico | null>(null);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      HistoricoService.getById(Number(id)).then((res: { data: Historico }) => {
        setHistorico(res.data);
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHistorico((prev) => (prev ? { ...prev, [name!]: value } : prev));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setHistorico((prev) => (prev ? { ...prev, [name!]: value } : prev));
  };

  const handleSubmit = async () => {
    if (historico && typeof historico.id === "number") {
      try {
        await HistoricoService.update(historico.id, historico);
        setSuccess(true);
        setTimeout(() => navigate("/clientes"), 2000); // Redireciona após sucesso
      } catch (err) {
        console.error(err);
        setErro("Erro ao atualizar histórico.");
      }
    }
  };

  if (!historico) return null;

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" mb={2}>
          Editar Histórico
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={historico.tipo}
            label="Tipo"
            name="tipo"
            onChange={handleSelectChange}
          >
            <MenuItem value="sessao">Sessão</MenuItem>
            <MenuItem value="supervisao">Supervisão</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Data"
          type="date"
          name="data"
          InputLabelProps={{ shrink: true }}
          value={
            historico.data
              ? new Date(historico.data).toISOString().split("T")[0]
              : ""
          }
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Conteúdo"
          name="conteudo"
          multiline
          rows={4}
          value={historico.conteudo}
          onChange={handleChange}
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
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          fullWidth
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success">Histórico atualizado com sucesso!</Alert>
      </Snackbar>
    </Box>
  );
}
