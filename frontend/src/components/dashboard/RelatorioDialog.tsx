import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import ClienteService from "../../services/clienteService";
import type { Cliente as ClienteType } from "../../services/clienteService";
import RelatorioService from "../../services/relatorioService";
import type { ClienteRelatorio, RelatorioGeral, SessaoDetalhada } from "../../services/relatorioService";
import { jsPDF } from "jspdf";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function RelatorioDialog({ open, onClose }: Props) {
  const [clientes, setClientes] = useState<ClienteType[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("GERAL");
  const [mes, setMes] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await ClienteService.getAll();
        setClientes(res.data);
      } catch (e) {
        console.error("Erro ao carregar clientes:", e);
      }
    }
    if (open) {
      fetchClientes();
    }
  }, [open]);

  const gerarPdfCliente = (data: ClienteRelatorio) => {
    const doc = new jsPDF();

    // Título grande
    doc.setFontSize(18);
    doc.text(`RELATÓRIO MENSAL - CLIENTE: ${data.cliente.nome.toUpperCase()}`, 10, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${mes.padStart(2, '0')}/${ano}`, 10, 30);

    // Calcular totais
    let totalPago = 0;
    let totalNaoPago = 0;
    data.sessoes.forEach((s) => {
      if (s.foi_paga) {
        totalPago += s.valor;
      } else {
        totalNaoPago += s.valor;
      }
    });

    // Mostrar valores totais
    doc.setFontSize(14);
    doc.text(`VALOR TOTAL PAGO: R$ ${totalPago.toFixed(2)}`, 10, 45);
    doc.text(`VALOR TOTAL NÃO PAGO: R$ ${totalNaoPago.toFixed(2)}`, 10, 55);

    if (!data.sessoes || data.sessoes.length === 0) {
      doc.setFontSize(12);
      doc.text(`Nenhuma sessão encontrada no período.`, 10, 70);
    } else {
      doc.setFontSize(12);
      doc.text(`# SESSÕES DETALHADAS`, 10, 70);

      let y = 80;
      const linhaAltura = 8;

      // Cabeçalho da tabela
      doc.setFontSize(11);
      doc.setFillColor(200, 200, 200);
      doc.rect(10, y, 190, linhaAltura, 'F');
      doc.text('Data', 12, y + 6);
      doc.text('Tipo', 50, y + 6);
      doc.text('Horário', 90, y + 6);
      doc.text('Valor (R$)', 120, y + 6);
      doc.text('Status', 160, y + 6);

      y += linhaAltura + 4;

      data.sessoes.forEach((s) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          // Repete o cabeçalho em nova página
          doc.setFontSize(11);
          doc.setFillColor(200, 200, 200);
          doc.rect(10, y, 190, linhaAltura, 'F');
          doc.text('Data', 12, y + 6);
          doc.text('Tipo', 50, y + 6);
          doc.text('Horário', 90, y + 6);
          doc.text('Valor (R$)', 120, y + 6);
          doc.text('Status', 160, y + 6);
          y += linhaAltura + 4;
        }

        // Formata data para padrão brasileiro - corrigido para evitar problema de timezone
        const [anoStr, mesStr, diaStr] = s.data.split('-');
        const dataFormatada = `${diaStr}/${mesStr}/${anoStr}`;
        const pagoTexto = s.foi_paga ? "PAGA" : "NÃO PAGA";

        doc.setFontSize(10);
        doc.text(dataFormatada, 12, y);
        doc.text(s.tipo_atendimento, 50, y);
        doc.text(s.horario, 90, y);
        doc.text(`R$ ${s.valor.toFixed(2)}`, 120, y);
        doc.text(pagoTexto, 160, y);
        y += linhaAltura;
      });
    }

    // Rodapé com data de emissão
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Emitido em: ${dataEmissao}`, 10, 285);

    // Salvar arquivo com nome personalizado
    const nomeArquivo = `Relatorio_${data.cliente.nome.replace(/\s+/g, '_')}_${mes}-${ano}.pdf`;
    doc.save(nomeArquivo);
  };

  const gerarPdfGeral = (data: RelatorioGeral) => {
    const doc = new jsPDF();

    // Título grande
    doc.setFontSize(18);
    doc.text(`RELATÓRIO GERAL DO MÊS`, 10, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${mes.padStart(2, '0')}/${ano}`, 10, 30);

    // Calcular valor total não recebido
    const totalNaoRecebido = data.sessoes
      .filter((s) => !s.foi_paga)
      .reduce((acc, s) => acc + s.valor, 0);

    // Valor total recebido
    doc.setFontSize(14);
    doc.text(`VALOR TOTAL RECEBIDO: R$ ${data.total_pago_no_mes.toFixed(2)}`, 10, 45);
    doc.text(`VALOR AINDA NÃO RECEBIDO: R$ ${totalNaoRecebido.toFixed(2)}`, 10, 55);

    if (!data.sessoes || data.sessoes.length === 0) {
      doc.setFontSize(12);
      doc.text(`Nenhuma sessão encontrada no período.`, 10, 70);
    } else {
      doc.setFontSize(12);
      doc.text(`# SESSÕES DETALHADAS`, 10, 70);

      let y = 80;
      const linhaAltura = 8;

      // Cabeçalho da tabela
      doc.setFontSize(11);
      doc.setFillColor(200, 200, 200);
      doc.rect(10, y, 190, linhaAltura, 'F');
      doc.text('Cliente', 12, y + 6);
      doc.text('Data', 50, y + 6);
      doc.text('Tipo', 80, y + 6);
      doc.text('Horário', 110, y + 6);
      doc.text('Valor (R$)', 140, y + 6);
      doc.text('Status', 170, y + 6);

      y += linhaAltura + 4; // Mais espaço antes da primeira linha

      data.sessoes.forEach((s: SessaoDetalhada) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          // Repete o cabeçalho em nova página
          doc.setFontSize(11);
          doc.setFillColor(200, 200, 200);
          doc.rect(10, y, 190, linhaAltura, 'F');
          doc.text('Cliente', 12, y + 6);
          doc.text('Data', 50, y + 6);
          doc.text('Tipo', 80, y + 6);
          doc.text('Horário', 110, y + 6);
          doc.text('Valor (R$)', 140, y + 6);
          doc.text('Status', 170, y + 6);
          y += linhaAltura + 4;
        }
        // Formata data para padrão brasileiro - corrigido para evitar problema de timezone
        const [anoStr2, mesStr2, diaStr2] = s.data.split('-');
        const dataFormatada2 = `${diaStr2}/${mesStr2}/${anoStr2}`;
        const pagoTexto2 = s.foi_paga ? "PAGA" : "NÃO PAGA";

        doc.setFontSize(10);
        doc.text(s.cliente_nome, 12, y);
        doc.text(dataFormatada2, 50, y);
        doc.text(s.tipo_atendimento, 80, y);
        doc.text(s.horario, 110, y);
        doc.text(`R$ ${s.valor.toFixed(2)}`, 140, y);
        doc.text(pagoTexto2, 170, y);
        y += linhaAltura;
      });
    }

    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Emitido em: ${dataEmissao}`, 10, 285);

    const nomeArquivo = `Relatorio_Geral_${mes}-${ano}.pdf`;
    doc.save(nomeArquivo);
  };

  const handleGerar = async () => {
    setErro("");
    if (!mes || !ano) {
      setErro("Selecione mês e ano!");
      return;
    }
    try {
      if (clienteSelecionado === "GERAL") {
        const res = await RelatorioService.getRelatorioMensalGeral(Number(mes), Number(ano));
        if (!res.data.sessoes || res.data.sessoes.length === 0) {
          setErro("Nenhuma sessão realizada encontrada para o período!");
          return;
        }
        gerarPdfGeral(res.data);
      } else {
        const res = await RelatorioService.getRelatorioMensalCliente(Number(mes), Number(ano));
        const clienteData = res.data.find((c: ClienteRelatorio) => c.cliente.id === Number(clienteSelecionado));
        if (!clienteData || clienteData.sessoes.length === 0) {
          setErro("Nenhum dado encontrado para esse cliente no período!");
          return;
        }
        gerarPdfCliente(clienteData);
      }
    } catch (e) {
      console.error(e);
      setErro("Erro ao buscar relatório!");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gerar Relatório Mensal</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Typography variant="body2">
            Escolha o cliente (ou selecione "GERAL" para todos)
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Cliente</InputLabel>
            <Select
              value={clienteSelecionado}
              label="Cliente"
              onChange={(e) => setClienteSelecionado(e.target.value)}
            >
              <MenuItem value="GERAL">GERAL</MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" gap={2}>
            <TextField
              type="number"
              label="Mês"
              placeholder="ex: 6"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              fullWidth
            />
            <TextField
              type="number"
              label="Ano"
              placeholder="ex: 2025"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              fullWidth
            />
          </Box>
          {erro && <Alert severity="error">{erro}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGerar}>Gerar PDF</Button>
      </DialogActions>
    </Dialog>
  );
}