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

export default function SessaoUpdate() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [clienteNome, setClienteNome] = useState<string>("");
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [frequenciaOriginal, setFrequenciaOriginal] = useState("");
  const [dataOriginal, setDataOriginal] = useState("");
  const [horarioOriginal, setHorarioOriginal] = useState("");
  const [valorOriginal, setValorOriginal] = useState<number>(0);
  const [confirmDialog, setConfirmDialog] = useState<
    null | "frequencia" | "dataHorario" | "valor"
  >(null);
  const [confirmQueue, setConfirmQueue] = useState<string[]>([]);
  const [submitOptions, setSubmitOptions] = useState({
    atualizar_futuras_frequencias: false,
    atualizar_futuras_data_horario: false,
    atualizar_valores_futuros: false,
  });
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
    if (
      sessao &&
      frequenciaOriginal === "" &&
      dataOriginal === "" &&
      horarioOriginal === ""
    ) {
      setFrequenciaOriginal(sessao.frequencia);
      setDataOriginal(sessao.data);
      setHorarioOriginal(sessao.horario);
      setValorOriginal(sessao.valor);
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

  function formatCurrency(value: number | string) {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "";
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }

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
    atualizar_futuras_data_horario: boolean,
    atualizar_valores_futuros: boolean = false
  ) => {
    try {
      await sessaoService.update(sessao!.id!, {
        ...(sessao as Sessao),
        atualizar_futuras_frequencias,
        atualizar_futuras_data_horario,
        atualizar_valores_futuros,
      } as Sessao & {
        atualizar_futuras_frequencias?: boolean;
        atualizar_futuras_data_horario?: boolean;
        atualizar_valores_futuros?: boolean;
      });
      navigate("/sessoes");
    } catch (err: any) {
      if (
        err?.response?.data?.erro ===
        "Já existe uma sessão cadastrada para esse horário"
      ) {
        setErro("Já existe uma sessão cadastrada para esse horário.");
      } else if (
        err?.response?.data?.erro?.includes("Com a frequência selecionada")
      ) {
        setErro(
          "Com a frequência selecionada vai haver conflitos de horário no futuro, selecione outra frequência e/ou horário."
        );
      } else if (err?.response?.data?.erro?.includes("Com o novo horário")) {
        setErro(
          "Com o novo horário haverá conflitos de sessões futuras. Altere o horário ou desmarque a atualização em cadeia."
        );
      } else if (err?.response?.data?.erro?.includes("Com a nova data")) {
        setErro(
          "Com a nova data haverá conflitos de sessões futuras. Altere a data ou desmarque a atualização em cadeia."
        );
      } else {
        setErro("Erro ao atualizar sessão.");
      }
    }
  };

  const handleSubmit = () => {
    if (!sessao || !validarCampos()) return;

    const frequenciaAlterada = sessao.frequencia !== frequenciaOriginal;
    const dataAlterada = sessao.data !== dataOriginal;
    const horarioAlterado = sessao.horario !== horarioOriginal;
    const valorAlterado = sessao.valor !== valorOriginal;
    const dataHorarioAlterado = dataAlterada || horarioAlterado;

    const queue: string[] = [];
    if (frequenciaAlterada) queue.push("frequencia");
    if (dataHorarioAlterado) queue.push("dataHorario");
    if (valorAlterado) queue.push("valor");

    if (queue.length > 0) {
      setConfirmQueue(queue);
      setConfirmDialog(queue[0] as "frequencia" | "dataHorario" | "valor");
      return;
    }

    finalizarSubmit(false, false, false);
  };

  const handleConfirmResponse = (aplicar: boolean) => {
    if (!confirmDialog) return;

    setSubmitOptions((prev) => ({
      ...prev,
      ...(confirmDialog === "frequencia" && { atualizar_futuras_frequencias: aplicar }),
      ...(confirmDialog === "dataHorario" && { atualizar_futuras_data_horario: aplicar }),
      ...(confirmDialog === "valor" && { atualizar_valores_futuros: aplicar }),
    }));

    const nextQueue = [...confirmQueue];
    nextQueue.shift();

    if (nextQueue.length > 0) {
      setConfirmQueue(nextQueue);
      setConfirmDialog(nextQueue[0] as "frequencia" | "dataHorario" | "valor");
    } else {
      setConfirmDialog(null);
      finalizarSubmit(
        submitOptions.atualizar_futuras_frequencias || (aplicar && confirmDialog === "frequencia"),
        submitOptions.atualizar_futuras_data_horario || (aplicar && confirmDialog === "dataHorario"),
        submitOptions.atualizar_valores_futuros || (aplicar && confirmDialog === "valor")
      );
      setSubmitOptions({
        atualizar_futuras_frequencias: false,
        atualizar_futuras_data_horario: false,
        atualizar_valores_futuros: false,
      });
    }
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
            <MenuItem value="Selecione">
              <em>Selecione</em>
            </MenuItem>
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
            <MenuItem value="Selecione">
              <em>Selecione</em>
            </MenuItem>
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
          label="Valor"
          name="valor"
          margin="normal"
          value={formatCurrency(sessao.valor)}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^\d]/g, "");
            setSessao((prev) => ({
              ...prev!,
              valor: Number(numericValue) / 100,
            }));
          }}
          onBlur={(e) => {
            const numeric =
              parseFloat(e.target.value.replace(/[^\d]/g, "")) / 100;
            setSessao((prev) => ({
              ...prev!,
              valor: isNaN(numeric) ? 0 : numeric,
            }));
          }}
          error={erros.valor}
          helperText={erros.valor && "Valor inválido"}
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
              : confirmDialog === "dataHorario"
              ? "Deseja aplicar a alteração de data e/ou horário para todas as sessões futuras?"
              : "Deseja aplicar o novo valor para todas as sessões futuras?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmResponse(false)}>Não</Button>
          <Button onClick={() => handleConfirmResponse(true)} variant="contained">
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
