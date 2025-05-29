import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClienteSelect from "../../components/ClienteSelect";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Sessao } from "../../services/sessaoService";
import sessaoService from "../../services/sessaoService";

const sessaoInicial: Sessao = {
  cliente_id: 0,
  data: "",
  tipo_atendimento: "",
  frequencia: "",
  horario: "",
  foi_realizada: false,
  foi_paga: false,
  valor: 0,
  observacoes: "",
};

export default function SessaoCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramData = searchParams.get("data") || "";
  const paramHorario = searchParams.get("horario") || "";
  const [sessao, setSessao] = useState<Sessao>({
    ...sessaoInicial,
    data: paramData,
    horario: paramHorario,
  });
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, boolean>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setErros((prev) => ({ ...prev, [name]: false }));

    if (type === "checkbox") {
      setSessao((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "cliente_id" || name === "valor") {
      setSessao((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    setSessao((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarCampos = () => {
    const novosErros: Record<string, boolean> = {};

    if (!sessao.cliente_id || sessao.cliente_id <= 0)
      novosErros.cliente_id = true;
    if (!sessao.data.trim()) novosErros.data = true;
    if (!sessao.tipo_atendimento.trim()) novosErros.tipo_atendimento = true;
    if (!sessao.frequencia.trim()) novosErros.frequencia = true;
    if (!sessao.horario.trim()) novosErros.horario = true;
    if (sessao.valor < 0) novosErros.valor = true;

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarCampos()) return;
    try {
      await sessaoService.create(sessao);
      navigate("/sessoes");
    } catch (err: any) {
      console.error(err);
      if (
        err?.response?.data?.erro ===
        "Já existe uma sessão cadastrada para esse horário"
      ) {
        setErro("Já existe uma sessão cadastrada para esse horário");
      } else if (
        err?.response?.data?.erro ===
        "Com a frequência selecionada vai haver conflitos de horário no futuro, selecione outra frequência e/ou horário"
      ) {
        setErro("Com a frequência selecionada vai haver conflitos de horário no futuro, selecione outra frequência e/ou horário");
      } else {
        setErro("Erro ao salvar sessão.");
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 600, maxHeight: "80vh", overflowY: "auto" }}>
        <Typography variant="h5" mb={2}>
          Nova Sessão
        </Typography>

        <ClienteSelect
          value={sessao.cliente_id}
          onChange={(value) =>
            setSessao((prev) => ({ ...prev, cliente_id: value }))
          }
          error={erros.cliente_id}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Data"
            name="data"
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={sessao.data}
            onChange={handleChange}
            error={erros.data}
            helperText={erros.data && "Data é obrigatória"}
            sx={{ flex: "1 1 45%" }}
          />
          <TextField
            label="Horário"
            name="horario"
            margin="normal"
            type="time"
            InputLabelProps={{ shrink: true }}
            value={sessao.horario}
            onChange={handleChange}
            error={erros.horario}
            helperText={erros.horario && "Horário é obrigatório"}
            sx={{ flex: "1 1 45%" }}
          />
          <FormControl
            sx={{ flex: "1 1 45%", mt: 2 }}
            error={erros.tipo_atendimento}
          >
            <InputLabel id="tipo-atendimento-label">
              Tipo de Atendimento
            </InputLabel>
            <Select
              labelId="tipo-atendimento-label"
              name="tipo_atendimento"
              value={sessao.tipo_atendimento}
              onChange={(e) => {
                const { name, value } = e.target as {
                  name: string;
                  value: string;
                };
                setErros((prev) => ({ ...prev, [name]: false }));
                setSessao((prev) => ({ ...prev, [name]: value }));
              }}
              label="Tipo de Atendimento"
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="psicologia">Psicologia</MenuItem>
              <MenuItem value="rolfing">Rolfing</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ flex: "1 1 45%", mt: 2 }} error={erros.frequencia}>
            <InputLabel id="frequencia-label">Frequência</InputLabel>
            <Select
              labelId="frequencia-label"
              name="frequencia"
              value={sessao.frequencia}
              onChange={(e) => {
                const { name, value } = e.target as {
                  name: string;
                  value: string;
                };
                setErros((prev) => ({ ...prev, [name]: false }));
                setSessao((prev) => ({ ...prev, [name]: value }));
              }}
              label="Frequência"
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="quinzenal">Quinzenal</MenuItem>
              <MenuItem value="mensal">Mensal</MenuItem>
              <MenuItem value="avulsa">Avulsa</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                checked={sessao.foi_realizada}
                onChange={handleChange}
                name="foi_realizada"
              />
            }
            label="Foi Realizada"
            sx={{ flex: "1 1 45%" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sessao.foi_paga}
                onChange={handleChange}
                name="foi_paga"
              />
            }
            label="Foi Paga"
            sx={{ flex: "1 1 45%" }}
          />
          <TextField
            label="Valor"
            name="valor"
            type="text"
            margin="normal"
            value={formatCurrency(sessao.valor.toString())}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^\d]/g, "");
              setSessao((prev) => ({
                ...prev,
                valor: Number(numericValue),
              }));
            }}
            onBlur={(e) => {
              const numeric =
                parseFloat(e.target.value.replace(/[^\d]/g, "")) / 100;
              setSessao((prev) => ({
                ...prev,
                valor: isNaN(numeric) ? 0 : numeric,
              }));
            }}
            error={erros.valor}
            helperText={erros.valor && "Valor inválido"}
            sx={{ flex: "1 1 45%" }}
          />
        </Box>
        <TextField
          fullWidth
          label="Observações"
          name="observacoes"
          margin="normal"
          multiline
          rows={4}
          value={sessao.observacoes}
          onChange={handleChange}
        />

        {erro && <Typography color="error">{erro}</Typography>}

        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          fullWidth
          onClick={() => navigate("/sessoes")}
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
    </Box>
  );
}
