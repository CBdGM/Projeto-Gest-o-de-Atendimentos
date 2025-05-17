import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate, useParams } from "react-router-dom";
import type { Sessao } from "../../services/sessaoService";
import sessaoService from "../../services/sessaoService";
import clienteService from "../../services/clienteService";
// import ClienteSelect from "../../components/ClienteSelect";

function formatCurrency(value: number | string) {
  const number = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(number)) return "";
  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function SessaoUpdate() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [clienteNome, setClienteNome] = useState<string>("");
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [frequenciaOriginal, setFrequenciaOriginal] = useState("");
  const [dataOriginal, setDataOriginal] = useState("");
  const [horarioOriginal, setHorarioOriginal] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<null | "frequencia" | "dataHorario">(null);
  const [pendingSubmit, setPendingSubmit] = useState<{
    atualizar_futuras_frequencias: boolean;
    atualizar_futuras_data_horario: boolean;
  } | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      sessaoService.get(Number(id)).then((res) => setSessao(res.data));
    }
  }, [id]);

  useEffect(() => {
    if (sessao?.cliente_id) {
      clienteService.get(sessao.cliente_id).then((res) => {
        setClienteNome(res.data.nome);
      });
    }
  }, [sessao?.cliente_id]);

useEffect(() => {
  if (sessao && frequenciaOriginal === "" && dataOriginal === "" && horarioOriginal === "") {
    setFrequenciaOriginal(sessao.frequencia);
    setDataOriginal(sessao.data);
    setHorarioOriginal(sessao.horario);
  }
}, [sessao]);

  const handleChangeGeneric = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    if (!name) return;
    setErros((prev) => ({ ...prev, [name]: false }));
    if (!sessao) return;

    setSessao((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const validarCampos = () => {
    const novosErros: Record<string, boolean> = {};
    if (!sessao?.data) novosErros.data = true;
    if (!sessao?.horario) novosErros.horario = true;
    if (!sessao?.cliente_id) novosErros.cliente_id = true;
    if (!sessao?.tipo_atendimento) novosErros.tipo_atendimento = true;
    if (!sessao?.frequencia) novosErros.frequencia = true;
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const finalizarSubmit = async (
    atualizar_futuras_frequencias: boolean,
    atualizar_futuras_data_horario: boolean
  ) => {
    try {
      await sessaoService.update(sessao!.id!, {
        ...(sessao as Sessao),
        atualizar_futuras_frequencias,
        atualizar_futuras_data_horario,
      } as Sessao & {
        atualizar_futuras_frequencias?: boolean;
        atualizar_futuras_data_horario?: boolean;
      });
      navigate("/sessoes");
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar sessão.");
    }
  };

  const handleSubmit = async () => {
    if (!sessao || !validarCampos()) return;

    const frequenciaAlterada = sessao.frequencia !== frequenciaOriginal;
    const dataAlterada = sessao.data !== dataOriginal;
    const horarioAlterado = sessao.horario !== horarioOriginal;
    const dataHorarioAlterado = dataAlterada || horarioAlterado;


    // Só exibe o Dialog se houver alteração de frequência ou data/horário
    if (frequenciaAlterada || dataHorarioAlterado) {
      if (frequenciaAlterada && !dataHorarioAlterado) {
        setConfirmDialog("frequencia");
        setPendingSubmit({
          atualizar_futuras_frequencias: true,
          atualizar_futuras_data_horario: false,
        });
        return;
      }

      if (!frequenciaAlterada && dataHorarioAlterado) {
        setConfirmDialog("dataHorario");
        setPendingSubmit({
          atualizar_futuras_frequencias: false,
          atualizar_futuras_data_horario: true,
        });
        return;
      }

      if (frequenciaAlterada && dataHorarioAlterado) {
        setConfirmDialog("frequencia");
        setPendingSubmit({
          atualizar_futuras_frequencias: true,
          atualizar_futuras_data_horario: true,
        });
        return;
      }
    }

    await finalizarSubmit(false, false);
  };

  if (!sessao) return null;

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: 600 }}>
        <Typography variant="h5" mb={2}>
          Editar Sessão
        </Typography>

        <Typography variant="h6" gutterBottom>
          Cliente: {clienteNome ? clienteNome : `ID: ${sessao.cliente_id}`}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              name="foi_realizada"
              checked={!!sessao.foi_realizada}
              onChange={(e) =>
                setSessao((prev) => ({
                  ...prev!,
                  foi_realizada: e.target.checked,
                }))
              }
            />
          }
          label="Sessão Realizada"
        />

        <FormControlLabel
          control={
            <Checkbox
              name="foi_paga"
              checked={!!sessao.foi_paga}
              onChange={(e) =>
                setSessao((prev) => ({
                  ...prev!,
                  foi_paga: e.target.checked,
                }))
              }
            />
          }
          label="Sessão Paga"
        />

        <TextField
          fullWidth
          label="Data"
          name="data"
          type="date"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={sessao.data}
          onChange={handleChangeGeneric}
          error={erros.data}
        />

        <TextField
          fullWidth
          label="Horário"
          name="horario"
          type="time"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={sessao.horario}
          onChange={handleChangeGeneric}
          error={erros.horario}
        />



        <FormControl fullWidth margin="normal" error={erros.tipo_atendimento}>
          <InputLabel id="tipo-label">Tipo</InputLabel>
          <Select
            labelId="tipo-label"
            name="tipo_atendimento"
            value={sessao.tipo_atendimento || ""}
            onChange={handleChangeGeneric}
            label="Tipo"
          >
            <MenuItem value="Selecione"><em>Selecione</em></MenuItem>
            <MenuItem value="psicologia">Psicologia</MenuItem>
            <MenuItem value="rolfing">Rolfing</MenuItem>
          </Select>
          {erros.tipo_atendimento && (
            <FormHelperText>Tipo é obrigatório</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal" error={erros.frequencia}>
          <InputLabel id="frequencia-label">Frequência</InputLabel>
          <Select
            labelId="frequencia-label"
            name="frequencia"
            value={sessao.frequencia || ""}
            onChange={handleChangeGeneric}
            label="Frequência"
          >
            <MenuItem value="Selecione"><em>Selecione</em></MenuItem>
            <MenuItem value="semanal">Semanal</MenuItem>
            <MenuItem value="quinzenal">Quinzenal</MenuItem>
            <MenuItem value="mensal">Mensal</MenuItem>
          </Select>
          {erros.frequencia && (
            <FormHelperText>Frequência é obrigatória</FormHelperText>
          )}
        </FormControl>

        <TextField
          fullWidth
          label="Valor (R$)"
          name="valor"
          margin="normal"
          value={sessao.valor?.toString() || ""}
          onChange={(e) =>
            setSessao((prev) => ({
              ...prev!,
              valor: parseFloat(e.target.value),
            }))
          }
          InputProps={{
            startAdornment: formatCurrency(sessao.valor)
              ? undefined
              : undefined,
            inputProps: { inputMode: "decimal" },
          }}
        />



        <TextField
          fullWidth
          label="Observações"
          name="observacoes"
          margin="normal"
          value={sessao.observacoes || ""}
          onChange={handleChangeGeneric}
          multiline
          rows={4}
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

      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>Confirmar alteração</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog === "frequencia"
              ? "Deseja aplicar a nova frequência para todas as sessões futuras?"
              : "Deseja aplicar a alteração de data e/ou horário para todas as sessões futuras?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmDialog(null);
            finalizarSubmit(false, false);
          }}>Não</Button>
          <Button
            onClick={() => {
              setConfirmDialog(null);
              finalizarSubmit(
                confirmDialog === "frequencia" ? true : pendingSubmit?.atualizar_futuras_frequencias || false,
                confirmDialog === "dataHorario" ? true : pendingSubmit?.atualizar_futuras_data_horario || false
              );
            }}
            variant="contained"
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
